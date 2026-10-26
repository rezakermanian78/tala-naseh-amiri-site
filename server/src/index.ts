import { buildApp } from './app.js'
import { loadConfig } from './config.js'
import { createDb } from './db/client.js'
import { runMigrations } from './db/migrate.js'
import { isFreshDatabase, seedAdmin, seedContent } from './db/seed.js'
import { loadEnvFile } from './lib/env-file.js'

if (process.env.NODE_ENV !== 'production') loadEnvFile()
const config = loadConfig()
const { pool, db } = createDb(config.DATABASE_URL)

await runMigrations(db)
if (config.SEED_ON_START && (await isFreshDatabase(db))) await seedContent(db)
const createdAdmin =
  config.ADMIN_EMAIL && config.ADMIN_PASSWORD
    ? await seedAdmin(db, config.ADMIN_EMAIL, config.ADMIN_PASSWORD)
    : false

const app = await buildApp(config, db)
if (createdAdmin) app.log.info('Created the admin account from ADMIN_EMAIL / ADMIN_PASSWORD.')

const shutdown = async (signal: string) => {
  app.log.info({ signal }, 'shutting down')
  await app.close()
  await pool.end()
  process.exit(0)
}
process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))

await app.listen({ port: config.PORT, host: config.HOST })
