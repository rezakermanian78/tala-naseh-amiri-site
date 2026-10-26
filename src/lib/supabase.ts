import type { PostgrestClient } from '@supabase/postgrest-js'
import type { Database } from './database.types'

// Public values: the anon/publishable key is designed to ship to browsers; Row Level Security
// decides what it can do. Never put the service_role / secret key in a VITE_ variable.
export const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim().replace(/\/+$/, '')
export const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

export const supabaseConfigured = /^https?:\/\/\S+$/.test(url) && key.length > 20

/** UX-only check; the database enforces the real rule in public.is_admin(). */
export const ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL?.trim() || 'talanasehamiri@gmail.com'
).toLowerCase()

export type PublicDb = PostgrestClient<Database>

let publicDb: Promise<PublicDb> | undefined
/**
 * Public site: a small PostgREST client (the query layer inside supabase-js) using only the
 * anon key — no auth, storage or realtime code, and never the admin's session. Loaded lazily
 * so it stays out of the main bundle.
 */
export function getPublicDb(): Promise<PublicDb> {
  publicDb ??= import('@supabase/postgrest-js').then(({ PostgrestClient }) => {
    // New `sb_publishable_` keys are not JWTs and must not be sent as a Bearer token.
    const isNewKey = key.startsWith('sb_publishable_')
    return new PostgrestClient<Database>(`${url}/rest/v1`, {
      headers: isNewKey ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` },
    })
  })
  return publicDb
}
