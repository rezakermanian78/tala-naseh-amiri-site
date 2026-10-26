import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import { sql } from 'drizzle-orm'
import Fastify, { type FastifyServerOptions } from 'fastify'
import type { Config } from './config.js'
import type { Db } from './db/client.js'
import { AppError, errorHandler } from './lib/errors.js'
import { checkOrigin, createSessions } from './lib/session.js'
import { adminRoutes } from './routes/admin.js'
import { authRoutes } from './routes/auth.js'
import type { Ctx } from './routes/context.js'
import { publicRoutes } from './routes/public.js'
import { uploadsAdmin, uploadsPublic } from './routes/uploads.js'

function loggerOptions(config: Config): FastifyServerOptions['logger'] {
  if (config.NODE_ENV === 'test') return false
  const redact = ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]']
  if (config.isProd) return { level: config.LOG_LEVEL, redact }
  return { level: config.LOG_LEVEL, redact, transport: { target: 'pino-pretty' } }
}

export async function buildApp(config: Config, db: Db) {
  const app = Fastify({
    logger: loggerOptions(config),
    // Trust only the configured number of proxy hops (Railway: 1), so a client can't spoof its
    // IP (and dodge rate limits) with its own X-Forwarded-For header.
    trustProxy: (_address: string, hop: number) => hop < config.TRUST_PROXY,
    bodyLimit: 1024 * 1024,
  })

  app.setErrorHandler(errorHandler)
  app.setNotFoundHandler((_req, reply) =>
    reply.status(404).send({ error: { code: 'not_found', message: 'Not found.' } }),
  )

  await app.register(fastifyHelmet, {
    // JSON API: nothing here should ever be framed or execute scripts.
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
  await app.register(fastifyCors, {
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    maxAge: 600,
  })
  await app.register(fastifyCookie)
  await app.register(fastifyRateLimit, {
    global: false,
    errorResponseBuilder: (_req, ctx) =>
      new AppError(429, 'rate_limited', `Too many requests. Please try again in ${ctx.after}.`),
  })

  const ctx: Ctx = { config, db, sessions: createSessions(config, db) }
  const sameOrigin = checkOrigin(config.corsOrigins)

  app.get('/health', async (_req, reply) => {
    try {
      await db.execute(sql`select 1`)
      return { ok: true }
    } catch {
      return reply.status(503).send({ ok: false })
    }
  })

  await app.register(publicRoutes, ctx)
  await app.register(uploadsPublic, ctx)

  // Sign-in/out: CSRF-checked, no session needed.
  await app.register(async (scope) => {
    scope.addHook('onRequest', sameOrigin)
    await authRoutes(scope, ctx)
  })

  // Everything under /api/admin: CSRF check, then a valid admin session.
  await app.register(async (scope) => {
    scope.addHook('onRequest', sameOrigin)
    scope.addHook('preHandler', ctx.sessions.requireAdmin)
    await uploadsAdmin(scope, ctx)
    await adminRoutes(scope, ctx)
  })

  return app
}
