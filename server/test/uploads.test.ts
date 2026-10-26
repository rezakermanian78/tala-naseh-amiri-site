import { readdirSync } from 'node:fs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { closeDb, config, login, makeApp, ORIGIN, resetDb } from './helpers.js'

let ctx: Awaited<ReturnType<typeof makeApp>>
let cookie: string
beforeAll(async () => {
  await resetDb()
  ctx = await makeApp()
  cookie = await login(ctx.http)
})
afterAll(async () => {
  await ctx.app.close()
  await closeDb()
})

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')
const upload = (buf: Buffer, filename: string, contentType: string) =>
  ctx.http
    .post('/api/admin/upload')
    .set('Origin', ORIGIN)
    .set('Cookie', cookie)
    .attach('file', buf, { filename, contentType })

describe('uploads', () => {
  it('stores an image under a random name and serves it with long cache headers', async () => {
    const res = await upload(PNG, 'photo.png', 'image/png')
    expect(res.status).toBe(201)
    expect(res.body.file).toMatch(/^[a-f0-9]{32}\.png$/)
    expect(res.body.url).toMatch(new RegExp(`/uploads/${res.body.file}$`))
    const file = await ctx.http.get(`/uploads/${res.body.file}`)
    expect(file.status).toBe(200)
    expect(file.headers['content-type']).toBe('image/png')
    expect(file.headers['cache-control']).toBe('public, max-age=31536000, immutable')
    expect(file.headers['x-content-type-options']).toBe('nosniff')
    expect(file.headers['cross-origin-resource-policy']).toBe('cross-origin')
  })

  it('accepts a PDF (CV)', async () => {
    const res = await upload(PDF, 'cv.pdf', 'application/pdf')
    expect(res.status).toBe(201)
    expect(res.body.file).toMatch(/\.pdf$/)
  })

  it('checks the real file type, not the name or the claimed type', async () => {
    const html = await upload(Buffer.from('<html><script>alert(1)</script></html>'), 'evil.png', 'image/png')
    expect(html.status).toBe(415)
    expect(html.body.error.code).toBe('unsupported_media_type')
    const svg = await upload(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>'), 'x.svg', 'image/svg+xml')
    expect(svg.status).toBe(415)
  })

  it('rejects files over 8 MB', async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(8 * 1024 * 1024 + 10)])
    const res = await upload(big, 'big.png', 'image/png')
    expect(res.status).toBe(413)
  })

  it('requires a session', async () => {
    const res = await ctx.http.post('/api/admin/upload').set('Origin', ORIGIN).attach('file', PNG, 'a.png')
    expect(res.status).toBe(401)
  })

  it('deletes files and refuses odd names', async () => {
    const { body } = await upload(PNG, 'a.png', 'image/png')
    const del = (f: string) => ctx.http.delete(`/api/admin/upload/${f}`).set('Origin', ORIGIN).set('Cookie', cookie)
    expect((await del(body.file)).status).toBe(204)
    expect(readdirSync(config.uploadDir)).not.toContain(body.file)
    expect((await del(body.file)).status).toBe(404)
    expect((await del('..%2Fpackage.json')).status).toBe(400)
    expect((await ctx.http.get('/uploads/..%2F..%2Fpackage.json')).status).toBeGreaterThanOrEqual(400)
  })
})
