import { loadEnvFile } from '../lib/env-file.js'
import { createDb } from './client.js'
import { runMigrations } from './migrate.js'

loadEnvFile()
const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is required')
const { pool, db } = createDb(url)
await runMigrations(db)
await pool.end()
console.log('Migrations applied.')
