import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sql } from 'drizzle-orm'
import request from 'supertest'
import { buildApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'
import { createDb, type Db } from '../src/db/client.js'
import { runMigrations } from '../src/db/migrate.js'
import { seedAdmin, seedContent } from '../src/db/seed.js'

// Needs a throwaway Postgres database; everything in it is wiped.
// docker compose: postgres://postgres:postgres@localhost:5432/tala_test
const DATABASE_URL = process.env.TEST_DATABASE_URL
if (!DATABASE_URL) throw new Error('Set TEST_DATABASE_URL to a throwaway Postgres database')

export const ORIGIN = 'http://localhost:5173'
export const ADMIN = { email: 'talanasehamiri@gmail.com', password: 'correct horse battery staple' }

export const config = loadConfig({
  NODE_ENV: 'test',
  DATABASE_URL,
  JWT_SECRET: 'test-secret-that-is-long-enough-0123456789',
  UPLOAD_DIR: mkdtempSync(join(tmpdir(), 'tala-uploads-')),
  TRUST_PROXY: '1',
})

const { pool, db } = createDb(DATABASE_URL)
export { db }

/** Fresh schema + starter content + admin account. */
export async function resetDb(database: Db = db) {
  await database.execute(sql`drop schema if exists public cascade`)
  await database.execute(sql`drop schema if exists drizzle cascade`)
  await database.execute(sql`create schema public`)
  await runMigrations(database)
  await seedContent(database)
  await seedAdmin(database, ADMIN.email, ADMIN.password)
}

/** A new app per test file, so rate-limit counters start from zero. */
export async function makeApp() {
  const app = await buildApp(config, db)
  await app.ready()
  return { app, http: request(app.server) }
}

export async function closeDb() {
  await pool.end()
}

let ipCounter = 0

/** Signs in and returns the session cookie header value. */
export async function login(http: ReturnType<typeof request>, password = ADMIN.password) {
  // A different client IP per call keeps the login rate limit out of unrelated tests.
  const ip = `198.51.100.${(ipCounter++ % 250) + 1}`
  const res = await http
    .post('/api/auth/login')
    .set('Origin', ORIGIN)
    .set('X-Forwarded-For', ip)
    .send({ email: ADMIN.email, password })
  if (res.status !== 200) throw new Error(`login failed: ${res.status} ${JSON.stringify(res.body)}`)
  return cookieFrom(res.headers['set-cookie'])
}

export function cookieFrom(header: string | string[] | undefined) {
  const list = Array.isArray(header) ? header : header ? [header] : []
  const c = list.find((h) => h.startsWith('tala_session='))
  if (!c) throw new Error('no session cookie')
  return c.split(';')[0]!
}
