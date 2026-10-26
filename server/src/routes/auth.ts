import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { adminUsers } from '../db/schema.js'
import { AppError, parse } from '../lib/errors.js'
import { dummyHash, hashPassword, verifyPassword } from '../lib/password.js'
import { changePasswordSchema, loginSchema } from '../lib/validation.js'
import type { Ctx } from './context.js'

const invalid = () => new AppError(401, 'invalid_credentials', 'Incorrect email or password.')

export async function authRoutes(app: FastifyInstance, { db, sessions }: Ctx) {
  app.post(
    '/api/auth/login',
    {
      bodyLimit: 4 * 1024,
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
          hook: 'preHandler',
          keyGenerator: (req) => {
            const body = req.body as { email?: unknown } | undefined
            const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
            return `${req.ip}|${email}`
          },
        },
      },
    },
    async (req, reply) => {
      const { email, password } = parse(loginSchema, req.body)
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1)
      // Always run one Argon2 verification so unknown emails take as long as wrong passwords.
      const ok = await verifyPassword(admin?.password_hash ?? (await dummyHash()), password)
      if (!admin || !ok) throw invalid()
      await sessions.issue(reply, { id: admin.id, email: admin.email, tokenVersion: admin.token_version })
      return { email: admin.email }
    },
  )

  app.post('/api/auth/logout', async (_req, reply) => {
    sessions.clear(reply)
    return reply.status(204).send()
  })

  app.get('/api/auth/me', { preHandler: sessions.requireAdmin }, async (req, reply) => {
    reply.header('Cache-Control', 'no-store')
    return { email: req.admin!.email }
  })

  app.post(
    '/api/auth/change-password',
    {
      preHandler: sessions.requireAdmin,
      bodyLimit: 4 * 1024,
      config: { rateLimit: { max: 10, timeWindow: '15 minutes', keyGenerator: (req) => req.ip } },
    },
    async (req, reply) => {
      const { currentPassword, newPassword } = parse(changePasswordSchema, req.body)
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, req.admin!.id)).limit(1)
      if (!admin || !(await verifyPassword(admin.password_hash, currentPassword))) {
        throw new AppError(400, 'wrong_password', 'The current password is incorrect.')
      }
      const tokenVersion = admin.token_version + 1
      await db
        .update(adminUsers)
        .set({ password_hash: await hashPassword(newPassword), token_version: tokenVersion, updated_at: new Date().toISOString() })
        .where(eq(adminUsers.id, admin.id))
      // Every other session is now invalid; keep this one signed in.
      await sessions.issue(reply, { id: admin.id, email: admin.email, tokenVersion })
      return { ok: true }
    },
  )
}
