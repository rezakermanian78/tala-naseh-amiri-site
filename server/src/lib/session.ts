import { eq } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { jwtVerify, SignJWT } from 'jose'
import type { Config } from '../config.js'
import type { Db } from '../db/client.js'
import { adminUsers } from '../db/schema.js'
import { AppError } from './errors.js'

export const SESSION_COOKIE = 'tala_session'
const MAX_AGE_S = 7 * 24 * 60 * 60
/** Sessions older than this are re-issued on use, so an active admin stays signed in. */
const REFRESH_AFTER_S = 24 * 60 * 60

export type Admin = { id: string; email: string; tokenVersion: number }

declare module 'fastify' {
  interface FastifyRequest {
    admin?: Admin
  }
}

export function createSessions(config: Config, db: Db) {
  const key = new TextEncoder().encode(config.JWT_SECRET)

  const cookieOptions = {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: MAX_AGE_S,
  }

  async function issue(reply: FastifyReply, admin: Admin) {
    const token = await new SignJWT({ email: admin.email, ver: admin.tokenVersion })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(admin.id)
      .setIssuedAt()
      .setExpirationTime(`${MAX_AGE_S}s`)
      .sign(key)
    reply.setCookie(SESSION_COOKIE, token, cookieOptions)
  }

  function clear(reply: FastifyReply) {
    reply.clearCookie(SESSION_COOKIE, { ...cookieOptions, maxAge: 0 })
  }

  /** preHandler: 401 unless the request carries a valid, current admin session. */
  async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
    const token = req.cookies[SESSION_COOKIE]
    if (!token) throw new AppError(401, 'unauthorized', 'Please sign in.')
    let payload
    try {
      ;({ payload } = await jwtVerify(token, key, { algorithms: ['HS256'] }))
    } catch {
      clear(reply)
      throw new AppError(401, 'unauthorized', 'Your session has expired. Please sign in again.')
    }
    const [admin] = payload.sub
      ? await db.select().from(adminUsers).where(eq(adminUsers.id, payload.sub)).limit(1)
      : []
    // A password change bumps token_version, which signs out every older session.
    if (!admin || admin.token_version !== payload.ver) {
      clear(reply)
      throw new AppError(401, 'unauthorized', 'Your session has expired. Please sign in again.')
    }
    req.admin = { id: admin.id, email: admin.email, tokenVersion: admin.token_version }
    if (payload.iat && Date.now() / 1000 - payload.iat > REFRESH_AFTER_S) await issue(reply, req.admin)
  }

  return { issue, clear, requireAdmin }
}

/**
 * CSRF defence for cookie-authenticated, state-changing requests: the browser-set Origin (or
 * Referer) must be one of our own sites. Combined with SameSite=Lax cookies.
 */
export function checkOrigin(allowed: string[]) {
  return async (req: FastifyRequest) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return
    let origin = req.headers.origin
    if (!origin && req.headers.referer) {
      try {
        origin = new URL(req.headers.referer).origin
      } catch {
        origin = undefined
      }
    }
    if (!origin || !allowed.includes(origin)) {
      throw new AppError(403, 'forbidden', 'Request origin not allowed.')
    }
  }
}
