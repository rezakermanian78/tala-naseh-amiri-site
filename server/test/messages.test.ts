import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { closeDb, login, makeApp, ORIGIN, resetDb } from './helpers.js'

let ctx: Awaited<ReturnType<typeof makeApp>>
beforeAll(async () => {
  await resetDb()
  ctx = await makeApp()
})
afterAll(async () => {
  await ctx.app.close()
  await closeDb()
})

const send = (ip: string, body: object) =>
  ctx.http.post('/api/messages').set('Origin', ORIGIN).set('X-Forwarded-For', ip).send(body)
const valid = { name: 'Sara', email: 'sara@example.com', message: 'Hello!' }

describe('contact messages', () => {
  it('stores a valid message', async () => {
    const res = await send('192.0.2.1', valid)
    expect(res.status).toBe(201)
    expect(res.body).toEqual({ ok: true })
  })

  it('validates input with the standard error shape', async () => {
    const res = await send('192.0.2.2', { name: '', email: 'x', message: '' })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('validation_error')
    expect((await send('192.0.2.2', { ...valid, message: 'x'.repeat(5001) })).status).toBe(400)
  })

  it('rejects oversized bodies', async () => {
    const res = await send('192.0.2.3', { ...valid, message: 'x'.repeat(20_000) })
    expect(res.status).toBe(413)
    expect(res.body.error.code).toBe('payload_too_large')
  })

  it('silently drops honeypot submissions', async () => {
    const res = await send('192.0.2.4', { ...valid, name: 'Bot', website: 'http://spam.example' })
    expect(res.status).toBe(201)
  })

  it('allows 3 messages per IP per 10 minutes', async () => {
    for (let i = 0; i < 3; i++) expect((await send('192.0.2.5', valid)).status).toBe(201)
    const blocked = await send('192.0.2.5', valid)
    expect(blocked.status).toBe(429)
    expect(blocked.body.error.code).toBe('rate_limited')
    expect((await send('192.0.2.6', valid)).status).toBe(201)
  })

  it('cannot be read without a session', async () => {
    expect((await ctx.http.get('/api/admin/messages')).status).toBe(401)
    expect((await ctx.http.get('/api/messages')).status).toBe(404)
  })

  it('lets the admin list, mark read and delete', async () => {
    const cookie = await login(ctx.http)
    const list = await ctx.http.get('/api/admin/messages').set('Cookie', cookie)
    expect(list.status).toBe(200)
    // 1 + 3 + 1 stored; the honeypot one was not.
    expect(list.body.messages).toHaveLength(5)
    expect(list.body.unread).toBe(5)
    expect(list.body.messages.some((m: { name: string }) => m.name === 'Bot')).toBe(false)
    expect(list.body.messages[0]).not.toHaveProperty('ip_hash')

    const id: string = list.body.messages[0].id
    const read = await ctx.http.patch(`/api/admin/messages/${id}`).set('Origin', ORIGIN).set('Cookie', cookie).send({ read: true })
    expect(read.body.read).toBe(true)
    expect((await ctx.http.get('/api/admin/messages').set('Cookie', cookie)).body.unread).toBe(4)
    expect((await ctx.http.delete(`/api/admin/messages/${id}`).set('Origin', ORIGIN).set('Cookie', cookie)).status).toBe(204)
  })
})
