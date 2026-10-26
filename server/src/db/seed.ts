import { count } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import { hashPassword } from '../lib/password.js'
import type { Db } from './client.js'
import {
  adminUsers,
  contentWork,
  education,
  gallery,
  languages,
  projects,
  publications,
  siteSettings,
  skills,
} from './schema.js'
import seed from './seed-data.json' with { type: 'json' }

type Insert<T extends { $inferInsert: unknown }> = T['$inferInsert']

async function isEmpty(db: Db, table: PgTable) {
  const [row] = await db.select({ n: count() }).from(table)
  return (row?.n ?? 0) === 0
}

/**
 * Imports the starter content (generated from the site's static content). Idempotent: it only
 * fills tables that are completely empty and never touches anything that was edited.
 */
export async function seedContent(db: Db): Promise<string[]> {
  const filled: string[] = []
  await db.transaction(async (tx) => {
    const settings = await tx
      .insert(siteSettings)
      .values({ ...(seed.settings as Insert<typeof siteSettings>), id: 1 })
      .onConflictDoNothing()
      .returning({ id: siteSettings.id })
    if (settings.length) filled.push('site_settings')

    const lists = [
      ['skills', skills, seed.skills as Insert<typeof skills>[]],
      ['languages', languages, seed.languages as Insert<typeof languages>[]],
      ['education', education, seed.education as Insert<typeof education>[]],
      ['projects', projects, seed.projects as Insert<typeof projects>[]],
      ['publications', publications, seed.publications as Insert<typeof publications>[]],
      ['content_work', contentWork, seed.content_work as Insert<typeof contentWork>[]],
      ['gallery', gallery, seed.gallery as Insert<typeof gallery>[]],
    ] as const
    for (const [name, table, rows] of lists) {
      if (!rows.length || !(await isEmpty(tx as unknown as Db, table))) continue
      await tx.insert(table).values(rows as Insert<typeof table>[])
      filled.push(name)
    }
  })
  return filled
}

/** First start on a fresh database: no settings row yet. */
export async function isFreshDatabase(db: Db) {
  return isEmpty(db, siteSettings)
}

/** Creates the admin account if none exists yet. Never changes an existing password. */
export async function seedAdmin(db: Db, email: string, password: string): Promise<boolean> {
  if (!(await isEmpty(db, adminUsers))) return false
  await db
    .insert(adminUsers)
    .values({ email: email.trim().toLowerCase(), password_hash: await hashPassword(password) })
    .onConflictDoNothing()
  return true
}
