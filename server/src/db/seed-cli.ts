import { loadEnvFile } from '../lib/env-file.js'
import { createDb } from './client.js'
import { runMigrations } from './migrate.js'
import { seedAdmin, seedContent } from './seed.js'

loadEnvFile()
const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is required')
const { pool, db } = createDb(url)
await runMigrations(db)
const filled = await seedContent(db)
console.log(filled.length ? `Seeded: ${filled.join(', ')}` : 'Nothing to seed (tables already have content).')
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
if (ADMIN_EMAIL && ADMIN_PASSWORD && (await seedAdmin(db, ADMIN_EMAIL, ADMIN_PASSWORD))) {
  console.log(`Created admin account ${ADMIN_EMAIL}.`)
}
await pool.end()
