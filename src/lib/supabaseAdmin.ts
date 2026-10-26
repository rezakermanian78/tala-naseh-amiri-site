import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { key, url } from './supabase'

// Imported only by the admin panel, so the full supabase-js client (auth, storage, realtime)
// never ships with the public site.
export type Supabase = SupabaseClient<Database>

let client: Promise<Supabase> | undefined
/** Admin panel: full supabase-js client (auth session + storage). */
export function getSupabase(): Promise<Supabase> {
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient<Database>(url, key, {
      auth: {
        // Implicit flow: the magic link also works when opened in a different browser/app
        // than the one that requested it (common on phones).
        flowType: 'implicit',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'tala-admin-auth',
      },
    }),
  )
  return client
}
