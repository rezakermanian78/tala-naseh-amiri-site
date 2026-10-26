import { z } from 'zod'

const DEFAULT_ORIGINS = 'https://talanasehamiri.ir,https://www.talanasehamiri.ir,http://localhost:5173'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(8787),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(12, 'ADMIN_PASSWORD must be at least 12 characters').optional(),
  CORS_ORIGINS: z.string().default(DEFAULT_ORIGINS),
  UPLOAD_DIR: z.string().optional(),
  /** Public base URL of this API, used to build upload URLs. Defaults to the request's host. */
  PUBLIC_URL: z.string().url().optional(),
  /** Number of proxy hops in front of the app (Railway: 1). Used to find the real client IP. */
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  /** Fill an empty database with the starter content on first start. */
  /** Session cookie `Secure` flag. Defaults to on in production. */
  COOKIE_SECURE: z.enum(['true', 'false']).optional(),
  SEED_ON_START: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  RESEND_API_KEY: z.string().optional(),
  NOTIFY_EMAIL: z.string().email().optional(),
  NOTIFY_FROM: z.string().default('Website <onboarding@resend.dev>'),
})

export type Config = z.infer<typeof schema> & {
  corsOrigins: string[]
  uploadDir: string
  isProd: boolean
  cookieSecure: boolean
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = schema.safeParse(env)
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment:\n${problems}`)
  }
  const c = parsed.data
  const isProd = c.NODE_ENV === 'production'
  return {
    ...c,
    isProd,
    corsOrigins: c.CORS_ORIGINS.split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean),
    uploadDir: c.UPLOAD_DIR ?? (isProd ? '/data/uploads' : './uploads'),
    cookieSecure: c.COOKIE_SECURE ? c.COOKIE_SECURE === 'true' : isProd,
  }
}
