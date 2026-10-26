import { asc, count, desc, eq, max, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { listTables, messages, siteSettings, skills, type ListResource } from '../db/schema.js'
import { notFound, parse } from '../lib/errors.js'
import {
  idParam,
  readSchema,
  reorderSchema,
  resourceSchemas,
  settingsSchema,
} from '../lib/validation.js'
import type { Ctx } from './context.js'

const resourceParam = z.object({
  resource: z.enum(Object.keys(listTables) as [ListResource, ...ListResource[]]),
})

// All list tables share id / sort_order / visible / timestamps, and every other column is
// validated per resource by zod before it gets here. Drizzle can't follow a table chosen at
// runtime through its generics, so the shared operations use one table's type as the view.
const tableOf = (r: ListResource) => listTables[r] as unknown as typeof skills
type Row = typeof skills.$inferInsert

const now = () => new Date().toISOString()

export async function adminRoutes(app: FastifyInstance, { db }: Ctx) {
  app.addHook('onSend', async (_req, reply) => {
    reply.header('Cache-Control', 'no-store')
  })

  // ── Profile & SEO ──
  app.get('/api/admin/settings', async () => {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1)
    if (!row) throw notFound('Settings')
    return row
  })

  app.put('/api/admin/settings', { bodyLimit: 256 * 1024 }, async (req) => {
    const patch = parse(settingsSchema, req.body)
    const [row] = await db
      .insert(siteSettings)
      .values({ ...patch, id: 1 })
      .onConflictDoUpdate({ target: siteSettings.id, set: { ...patch, updated_at: now() } })
      .returning()
    return row
  })

  // ── Messages ──
  app.get('/api/admin/messages', async () => {
    const [rows, [unread]] = await Promise.all([
      db.select().from(messages).orderBy(desc(messages.created_at)).limit(500),
      db.select({ n: count() }).from(messages).where(eq(messages.read, false)),
    ])
    return { messages: rows, unread: unread?.n ?? 0 }
  })

  app.patch('/api/admin/messages/:id', async (req) => {
    const { id } = parse(idParam, req.params)
    const { read } = parse(readSchema, req.body)
    const [row] = await db.update(messages).set({ read }).where(eq(messages.id, id)).returning()
    if (!row) throw notFound('Message')
    return row
  })

  app.delete('/api/admin/messages/:id', async (req, reply) => {
    const { id } = parse(idParam, req.params)
    const [row] = await db.delete(messages).where(eq(messages.id, id)).returning({ id: messages.id })
    if (!row) throw notFound('Message')
    return reply.status(204).send()
  })

  // ── List sections: skills, languages, education, projects, publications, content_work, gallery ──
  app.get('/api/admin/:resource', async (req) => {
    const t = tableOf(parse(resourceParam, req.params).resource)
    return db.select().from(t).orderBy(asc(t.sort_order), asc(t.created_at))
  })

  app.post('/api/admin/:resource', { bodyLimit: 128 * 1024 }, async (req, reply) => {
    const { resource } = parse(resourceParam, req.params)
    const data = parse(resourceSchemas[resource], req.body) as Partial<Row>
    const t = tableOf(resource)
    if (data.sort_order === undefined) {
      // New items go to the end of the list.
      const [last] = await db.select({ m: max(t.sort_order) }).from(t)
      data.sort_order = (last?.m ?? 0) + 10
    }
    const [row] = await db.insert(t).values(data).returning()
    return reply.status(201).send(row)
  })

  app.put('/api/admin/:resource/reorder', async (req) => {
    const t = tableOf(parse(resourceParam, req.params).resource)
    const { ids } = parse(reorderSchema, req.body)
    await db.transaction(async (tx) => {
      for (const [i, id] of ids.entries()) {
        await tx.update(t).set({ sort_order: (i + 1) * 10 }).where(eq(t.id, id))
      }
    })
    return { ok: true }
  })

  app.patch('/api/admin/:resource/:id', { bodyLimit: 128 * 1024 }, async (req) => {
    const { resource } = parse(resourceParam, req.params)
    const { id } = parse(idParam, req.params)
    const patch = parse(resourceSchemas[resource], req.body) as Partial<Row>
    const t = tableOf(resource)
    const [row] = await db
      .update(t)
      .set({ ...patch, updated_at: sql`now()` as unknown as string })
      .where(eq(t.id, id))
      .returning()
    if (!row) throw notFound()
    return row
  })

  app.delete('/api/admin/:resource/:id', async (req, reply) => {
    const { resource } = parse(resourceParam, req.params)
    const { id } = parse(idParam, req.params)
    const t = tableOf(resource)
    const [row] = await db.delete(t).where(eq(t.id, id)).returning({ id: t.id })
    if (!row) throw notFound()
    return reply.status(204).send()
  })
}
