import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ADMIN, closeDb, cookieFrom, login, makeApp, ORIGIN, resetDb } from './helpers.js'

let ctx: Awaited<ReturnType<typeof makeApp>>
beforeAll(async () => {
  await resetDb()
  ctx = await makeApp()
})
afterAll(async () => {
  await ctx.app.close()
  await closeDb()
})

describe('auth', () => {
  it('rejects a wrong password and an unknown email with the same generic error', async () => {
    const wrong = await ctx.http.post('/api/auth/login').set('Origin', ORIGIN).send({ email: ADMIN.email, password: 'nope' })
    const unknown = await ctx.http.post('/api/auth/login').set('Origin', ORIGIN).set('X-Forwarded-For', '10.0.0.9')
      .send({ email: 'someone@else.com', password: 'nope' })
    expect(wrong.status).toBe(401)
    expect(unknown.status).toBe(401)
    expect(wrong.body).toEqual({ error: { code: 'invalid_credentials', message: 'Incorrect email or password.' } })
    expect(unknown.body).toEqual(wrong.body)
  })

  it('signs in with an httpOnly, SameSite=Lax session cookie', async () => {
    const res = await ctx.http.post('/api/auth/login').set('Origin', ORIGIN).send({ email: ADMIN.email, password: ADMIN.password })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ email: ADMIN.email })
    const raw = String(res.headers['set-cookie'])
    expect(raw).toMatch(/HttpOnly/i)
    expect(raw).toMatch(/SameSite=Lax/i)
    expect(raw).toMatch(/Max-Age=604800/)
    const me = await ctx.http.get('/api/auth/me').set('Cookie', cookieFrom(res.headers['set-cookie']))
    expect(me.status).toBe(200)
    expect(me.body).toEqual({ email: ADMIN.email })
  })

  it('accepts the email case-insensitively', async () => {
    const res = await ctx.http.post('/api/auth/login').set('Origin', ORIGIN).set('X-Forwarded-For', '10.0.0.8')
      .send({ email: ' TalaNasehAmiri@Gmail.com ', password: ADMIN.password })
    expect(res.status).toBe(200)
  })

  it('returns 401 without a session or with a tampered one', async () => {
    expect((await ctx.http.get('/api/auth/me')).status).toBe(401)
    const cookie = await login(ctx.http)
    const tampered = cookie.slice(0, -3) + 'abc'
    const res = await ctx.http.get('/api/auth/me').set('Cookie', tampered)
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('unauthorized')
  })

  it('blocks cross-site requests (CSRF) on auth and admin routes', async () => {
    const evil = await ctx.http.post('/api/auth/login').set('Origin', 'https://evil.example').send({ email: ADMIN.email, password: ADMIN.password })
    expect(evil.status).toBe(403)
    const cookie = await login(ctx.http)
    const noOrigin = await ctx.http.post('/api/admin/skills').set('Cookie', cookie).send({ name_en: 'X' })
    expect(noOrigin.status).toBe(403)
    const viaReferer = await ctx.http.post('/api/admin/skills').set('Cookie', cookie).set('Referer', `${ORIGIN}/admin`).send({ name_en: 'X' })
    expect(viaReferer.status).toBe(201)
  })

  it('logs out by clearing the cookie', async () => {
    const res = await ctx.http.post('/api/auth/logout').set('Origin', ORIGIN)
    expect(res.status).toBe(204)
    expect(String(res.headers['set-cookie'])).toMatch(/tala_session=;/)
  })

  it('changes the password and signs out every other session', async () => {
    const oldSession = await login(ctx.http)
    const current = await login(ctx.http)
    const wrong = await ctx.http.post('/api/auth/change-password').set('Origin', ORIGIN).set('Cookie', current)
      .send({ currentPassword: 'nope', newPassword: 'a brand new password' })
    expect(wrong.status).toBe(400)
    expect(wrong.body.error.code).toBe('wrong_password')
    const short = await ctx.http.post('/api/auth/change-password').set('Origin', ORIGIN).set('Cookie', current)
      .send({ currentPassword: ADMIN.password, newPassword: 'short' })
    expect(short.status).toBe(400)

    const ok = await ctx.http.post('/api/auth/change-password').set('Origin', ORIGIN).set('Cookie', current)
      .send({ currentPassword: ADMIN.password, newPassword: 'a brand new password' })
    expect(ok.status).toBe(200)
    const renewed = cookieFrom(ok.headers['set-cookie'])
    expect((await ctx.http.get('/api/auth/me').set('Cookie', oldSession)).status).toBe(401)
    expect((await ctx.http.get('/api/auth/me').set('Cookie', renewed)).status).toBe(200)
    await login(ctx.http, 'a brand new password')
  })

  it('rate-limits login to 5 attempts per 15 minutes per IP + email', async () => {
    const attempt = () =>
      ctx.http.post('/api/auth/login').set('Origin', ORIGIN).set('X-Forwarded-For', '203.0.113.7')
        .send({ email: 'brute@force.test', password: 'guess' })
    for (let i = 0; i < 5; i++) expect((await attempt()).status).toBe(401)
    const blocked = await attempt()
    expect(blocked.status).toBe(429)
    expect(blocked.body.error.code).toBe('rate_limited')
    // A different IP is not affected.
    const other = await ctx.http.post('/api/auth/login').set('Origin', ORIGIN).set('X-Forwarded-For', '203.0.113.8')
      .send({ email: 'brute@force.test', password: 'guess' })
    expect(other.status).toBe(401)
  })
})
