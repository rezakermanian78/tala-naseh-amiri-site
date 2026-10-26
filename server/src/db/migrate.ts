import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import type { Db } from './client.js'

// drizzle/ sits next to src/ and dist/, so this resolves from either.
const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'drizzle')

export function runMigrations(db: Db) {
  return migrate(db, { migrationsFolder })
}
