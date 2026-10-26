import type { Config } from '../config.js'
import type { Db } from '../db/client.js'
import type { createSessions } from '../lib/session.js'

export type Ctx = { config: Config; db: Db; sessions: ReturnType<typeof createSessions> }
