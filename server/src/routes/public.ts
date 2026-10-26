import { createHash } from 'node:crypto'
import { asc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { listTables, messages, siteSettings, skills, type ListResource } from '../db/schema.js'
import { AppError, parse } from '../lib/errors.js'
import { notifyNewMessage } from '../lib/notify.js'
import { messageSchema } from '../lib/validation.js'
import type { Ctx } from './context.js'

export async function publicRoutes(app: FastifyInstance, { db, config }: Ctx) {
  // All list tables share visible / sort_order / created_at (see the note in admin.ts).
  const visible = (resource: ListResource) => {
    const t = listTables[resource] as unknown as typeof skills
    return db.select().from(t).where(eq(t.visible, true)).orderBy(asc(t.sort_order), asc(t.created_at))
  }

  /** Everything the public site shows, in one cacheable payload (same shape the site expects). */
  app.get('/api/content', async (req, reply) => {
    const [settingsRows, skills, languages, education, projects, publications, contentWork, gallery] =
      await Promise.all([
        db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1),
        visible('skills'),
        visible('languages'),
        visible('education'),
        visible('projects'),
        visible('publications'),
        visible('content_work'),
        visible('gallery'),
      ])
    const settings = settingsRows[0]
    if (!settings) throw new AppError(503, 'not_seeded', 'Content is not set up yet.')

    const body = JSON.stringify({
      settings,
      skills,
      languages,
      education,
      projects,
      publications,
      contentWork,
      gallery,
    })
    const etag = `"${createHash('sha1').update(body).digest('base64url')}"`
    // Browsers revalidate every time (cheap 304s, edits show up on the next load);
    // shared caches/CDNs may keep it briefly.
    reply.header('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=60')
    reply.header('ETag', etag)
    if (req.headers['if-none-match'] === etag) return reply.status(304).send()
    return reply.type('application/json; charset=utf-8').send(body)
  })

  app.post(
    '/api/messages',
    {
      bodyLimit: 16 * 1024,
      config: { rateLimit: { max: 3, timeWindow: '10 minutes', keyGenerator: (req) => req.ip } },
    },
    async (req, reply) => {
      const input = parse(messageSchema, req.body)
      // Honeypot filled in: pretend it worked, store nothing.
      if (input.website) return reply.status(201).send({ ok: true })
      const { name, email, message } = input
      await db.insert(messages).values({ name, email, message })
      notifyNewMessage(config, req.log, { name, email, message })
      return reply.status(201).send({ ok: true })
    },
  )
}
