import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { closeDb, login, makeApp, ORIGIN, resetDb } from './helpers.js'

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

const admin = (method: 'get' | 'post' | 'put' | 'patch' | 'delete', path: string) =>
  ctx.http[method](path).set('Origin', ORIGIN).set('Cookie', cookie)

describe('public content', () => {
  it('returns the seeded content in the shape the site expects', async () => {
    const res = await ctx.http.get('/api/content')
    expect(res.status).toBe(200)
    expect(Object.keys(res.body).sort()).toEqual(
      ['contentWork', 'education', 'gallery', 'languages', 'projects', 'publications', 'settings', 'skills'].sort(),
    )
    expect(res.body.settings.name_en).toBe('Tala Naseh Amiri')
    expect(res.body.skills).toHaveLength(28)
    expect(res.body.skills[0]).toMatchObject({ name_en: 'Power Systems Analysis', sort_order: 10, visible: true })
    expect(res.body.languages.map((l: { name_en: string }) => l.name_en)).toEqual(['Persian', 'Turkish', 'Azeri', 'English', 'German'])
    expect(res.headers['cache-control']).toMatch(/public/)
    expect(res.headers.etag).toBeTruthy()
  })

  it('answers 304 when the ETag matches', async () => {
    const first = await ctx.http.get('/api/content')
    const again = await ctx.http.get('/api/content').set('If-None-Match', first.headers.etag)
    expect(again.status).toBe(304)
  })

  it('allows CORS only for the configured origins, with credentials', async () => {
    const ok = await ctx.http.get('/api/content').set('Origin', ORIGIN)
    expect(ok.headers['access-control-allow-origin']).toBe(ORIGIN)
    expect(ok.headers['access-control-allow-credentials']).toBe('true')
    const evil = await ctx.http.get('/api/content').set('Origin', 'https://evil.example')
    expect(evil.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('sends security headers and the standard error shape', async () => {
    const res = await ctx.http.get('/nope')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: { code: 'not_found', message: 'Not found.' } })
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['strict-transport-security']).toBeTruthy()
    expect(res.headers['content-security-policy']).toContain("default-src 'none'")
  })

  it('reports health', async () => {
    expect((await ctx.http.get('/health')).body).toEqual({ ok: true })
  })
})

describe('admin routes are protected', () => {
  for (const [method, path] of [
    ['get', '/api/admin/skills'],
    ['post', '/api/admin/skills'],
    ['get', '/api/admin/settings'],
    ['put', '/api/admin/settings'],
    ['get', '/api/admin/messages'],
    ['post', '/api/admin/upload'],
  ] as const) {
    it(`${method.toUpperCase()} ${path} → 401 without a session`, async () => {
      const res = await ctx.http[method](path).set('Origin', ORIGIN).send({})
      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('unauthorized')
    })
  }
})

describe('admin CRUD', () => {
  it('creates, hides, edits, reorders and deletes a list item', async () => {
    const created = await admin('post', '/api/admin/skills').send({ group_en: 'Tools', name_en: 'Figma', name_fa: 'فیگما' })
    expect(created.status).toBe(201)
    expect(created.body).toMatchObject({ name_en: 'Figma', visible: true, sort_order: 290 })
    const id: string = created.body.id

    let pub = await ctx.http.get('/api/content')
    expect(pub.body.skills.some((s: { id: string }) => s.id === id)).toBe(true)

    const hidden = await admin('patch', `/api/admin/skills/${id}`).send({ visible: false, name_en: 'Figma 2' })
    expect(hidden.status).toBe(200)
    expect(hidden.body).toMatchObject({ visible: false, name_en: 'Figma 2' })
    pub = await ctx.http.get('/api/content')
    expect(pub.body.skills.some((s: { id: string }) => s.id === id)).toBe(false)
    const all = await admin('get', '/api/admin/skills')
    expect(all.body.some((s: { id: string }) => s.id === id)).toBe(true)

    const ids: string[] = all.body.map((s: { id: string }) => s.id)
    const reordered = [id, ...ids.filter((x) => x !== id)]
    expect((await admin('put', '/api/admin/skills/reorder').send({ ids: reordered })).status).toBe(200)
    const after = await admin('get', '/api/admin/skills')
    expect(after.body[0].id).toBe(id)
    expect(after.body[0].sort_order).toBe(10)

    expect((await admin('delete', `/api/admin/skills/${id}`)).status).toBe(204)
    expect((await admin('delete', `/api/admin/skills/${id}`)).status).toBe(404)
  })

  it('works for every resource', async () => {
    for (const resource of ['skills', 'languages', 'education', 'projects', 'publications', 'content_work', 'gallery']) {
      const res = await admin('post', `/api/admin/${resource}`).send({ visible: false })
      expect(res.status, resource).toBe(201)
      expect((await admin('delete', `/api/admin/${resource}/${res.body.id}`)).status, resource).toBe(204)
    }
  })

  it('validates input', async () => {
    const unknownKey = await admin('post', '/api/admin/skills').send({ name_en: 'X', is_admin: true })
    expect(unknownKey.status).toBe(400)
    expect(unknownKey.body.error.code).toBe('validation_error')
    const scriptLink = await admin('post', '/api/admin/projects').send({ link: 'javascript:alert(1)' })
    expect(scriptLink.status).toBe(400)
    const badLevel = await admin('post', '/api/admin/languages').send({ level: 9 })
    expect(badLevel.status).toBe(400)
    expect((await admin('get', '/api/admin/users')).status).toBe(400)
    expect((await admin('patch', '/api/admin/skills/not-a-uuid').send({})).status).toBe(400)
  })

  it('updates settings and the public payload follows', async () => {
    const res = await admin('put', '/api/admin/settings').send({ headline_en: 'New headline', research_interests_en: ['A', 'B'] })
    expect(res.status).toBe(200)
    expect(res.body.headline_en).toBe('New headline')
    const pub = await ctx.http.get('/api/content')
    expect(pub.body.settings.headline_en).toBe('New headline')
    expect(pub.body.settings.research_interests_en).toEqual(['A', 'B'])
    expect((await admin('put', '/api/admin/settings').send({ email: 'not an email' })).status).toBe(400)
    expect((await admin('put', '/api/admin/settings').send({ id: 2 })).status).toBe(400)
  })
})
