import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'

export type Db = NodePgDatabase<typeof schema>

export function createDb(url: string) {
  const pool = new pg.Pool({ connectionString: url, max: 10 })
  return { pool, db: drizzle(pool, { schema }) }
}
