import type {
  Draft,
  ListRows,
  ListTable,
  MessageRow,
  SiteSettingsRow,
} from '../lib/database.types'
import { getSupabase } from '../lib/supabaseAdmin'

type PgError = { message: string; details?: string | null; hint?: string | null } | null

function check(error: PgError) {
  if (error) throw new Error(error.hint ? `${error.message} (${error.hint})` : error.message)
}

// supabase-js can't narrow `.from(table)` for a generic table name, so the list helpers go
// through this one loosely-typed view of the client; inputs and outputs stay fully typed.
async function listTable(table: ListTable) {
  const sb = await getSupabase()
  return sb.from(table as 'skills')
}

export async function fetchRows<T extends ListTable>(table: T): Promise<ListRows[T][]> {
  const q = await listTable(table)
  const { data, error } = await q.select('*').order('sort_order').order('created_at')
  check(error)
  return (data ?? []) as unknown as ListRows[T][]
}

export async function insertRow<T extends ListTable>(
  table: T,
  draft: Draft<T>,
): Promise<ListRows[T]> {
  const q = await listTable(table)
  const { data, error } = await q
    .insert(draft as unknown as Partial<ListRows['skills']>)
    .select('*')
    .single()
  check(error)
  return data as unknown as ListRows[T]
}

export async function updateRow<T extends ListTable>(
  table: T,
  id: string,
  patch: Partial<Draft<T>>,
): Promise<ListRows[T]> {
  const q = await listTable(table)
  const { data, error } = await q
    .update(patch as unknown as Partial<ListRows['skills']>)
    .eq('id', id)
    .select('*')
    .single()
  check(error)
  return data as unknown as ListRows[T]
}

export async function deleteRow(table: ListTable, id: string) {
  const q = await listTable(table)
  const { error } = await q.delete().eq('id', id)
  check(error)
}

export async function saveOrder(table: ListTable, changes: { id: string; sort_order: number }[]) {
  const q = await listTable(table)
  const results = await Promise.all(
    changes.map((c) => q.update({ sort_order: c.sort_order }).eq('id', c.id)),
  )
  results.forEach((r) => check(r.error))
}

// ── Profile ──
export async function fetchSettings(): Promise<SiteSettingsRow> {
  const sb = await getSupabase()
  const { data, error } = await sb.from('site_settings').select('*').eq('id', 1).maybeSingle()
  check(error)
  if (!data) throw new Error('site_settings is empty — run supabase/seed.sql')
  return data
}

export async function saveSettings(
  patch: Omit<SiteSettingsRow, 'id' | 'updated_at'>,
): Promise<SiteSettingsRow> {
  const sb = await getSupabase()
  const { data, error } = await sb
    .from('site_settings')
    .update(patch)
    .eq('id', 1)
    .select('*')
    .single()
  check(error)
  if (!data) throw new Error('site_settings is empty — run supabase/seed.sql')
  return data
}

// ── Messages ──
export async function fetchMessages(): Promise<MessageRow[]> {
  const sb = await getSupabase()
  const { data, error } = await sb
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
  check(error)
  return data ?? []
}

export async function countUnread(): Promise<number> {
  const sb = await getSupabase()
  const { count, error } = await sb
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('read', false)
  check(error)
  return count ?? 0
}

export async function setMessageRead(id: string, read: boolean) {
  const sb = await getSupabase()
  const { error } = await sb.from('messages').update({ read }).eq('id', id)
  check(error)
}

export async function deleteMessage(id: string) {
  const sb = await getSupabase()
  const { error } = await sb.from('messages').delete().eq('id', id)
  check(error)
}

// ── Storage ("media" bucket) ──
const BUCKET = 'media'

export async function uploadMedia(
  folder: string,
  body: Blob,
  ext: string,
  contentType: string,
): Promise<string> {
  const sb = await getSupabase()
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, body, { contentType, cacheControl: '31536000', upsert: false })
  check(error)
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/** Best-effort removal of a file we uploaded earlier (ignored for other URLs). */
export async function removeMedia(publicUrl: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const at = publicUrl.indexOf(marker)
  if (at === -1) return
  const sb = await getSupabase()
  await sb.storage.from(BUCKET).remove([decodeURIComponent(publicUrl.slice(at + marker.length))])
}
