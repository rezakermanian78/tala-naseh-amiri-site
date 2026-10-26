import { api, API_URL } from '../lib/api'
import type { Draft, ListRows, ListTable, MessageRow, SiteSettingsRow } from '../lib/types'

// ── Auth ──
export const me = () => api<{ email: string }>('/api/auth/me')
export const login = (email: string, password: string) =>
  api<{ email: string }>('/api/auth/login', { method: 'POST', body: { email, password } })
export const logout = () => api<void>('/api/auth/logout', { method: 'POST' })
export const changePassword = (currentPassword: string, newPassword: string) =>
  api<{ ok: true }>('/api/auth/change-password', {
    method: 'POST',
    body: { currentPassword, newPassword },
  })

// ── List sections ──
export const fetchRows = <T extends ListTable>(table: T) => api<ListRows[T][]>(`/api/admin/${table}`)

export const insertRow = <T extends ListTable>(table: T, draft: Draft<T>) =>
  api<ListRows[T]>(`/api/admin/${table}`, { method: 'POST', body: draft })

export const updateRow = <T extends ListTable>(table: T, id: string, patch: Partial<Draft<T>>) =>
  api<ListRows[T]>(`/api/admin/${table}/${id}`, { method: 'PATCH', body: patch })

export const deleteRow = (table: ListTable, id: string) =>
  api<void>(`/api/admin/${table}/${id}`, { method: 'DELETE' })

/** Saves the full order of a list (first id = top). */
export const saveOrder = (table: ListTable, ids: string[]) =>
  api<{ ok: true }>(`/api/admin/${table}/reorder`, { method: 'PUT', body: { ids } })

// ── Profile ──
export const fetchSettings = () => api<SiteSettingsRow>('/api/admin/settings')
export const saveSettings = (patch: Omit<SiteSettingsRow, 'id' | 'updated_at'>) =>
  api<SiteSettingsRow>('/api/admin/settings', { method: 'PUT', body: patch })

// ── Messages ──
export const fetchMessages = () => api<{ messages: MessageRow[]; unread: number }>('/api/admin/messages')
export const countUnread = async () => (await fetchMessages()).unread
export const setMessageRead = (id: string, read: boolean) =>
  api<MessageRow>(`/api/admin/messages/${id}`, { method: 'PATCH', body: { read } })
export const deleteMessage = (id: string) => api<void>(`/api/admin/messages/${id}`, { method: 'DELETE' })

// ── Uploads ──
/** Uploads a file and returns its public URL. */
export async function uploadMedia(body: Blob, filename: string): Promise<string> {
  const form = new FormData()
  form.append('file', body, filename)
  const res = await api<{ url: string }>('/api/admin/upload', { method: 'POST', body: form })
  return res.url
}

/** Best-effort removal of a file uploaded earlier (ignored for other URLs). */
export async function removeMedia(publicUrl: string) {
  const prefix = `${API_URL}/uploads/`
  if (!publicUrl.startsWith(prefix)) return
  await api<void>(`/api/admin/upload/${encodeURIComponent(publicUrl.slice(prefix.length))}`, {
    method: 'DELETE',
  })
}
