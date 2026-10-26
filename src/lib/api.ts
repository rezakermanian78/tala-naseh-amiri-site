// Typed fetch wrapper for the API (server/). Cookies are sent with every request
// (credentials: 'include'): the admin session lives in an httpOnly cookie.

const configured = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '')

/** Base URL of the API. Without VITE_API_URL, production builds run on the built-in content. */
export const API_URL = configured || (import.meta.env.DEV ? 'http://localhost:8787' : '')
export const apiConfigured = API_URL !== ''

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** A plain object is sent as JSON; FormData as multipart. */
  body?: unknown
  signal?: AbortSignal
}

const unauthorizedListeners = new Set<() => void>()
/** Called whenever a request fails because the admin session is missing or expired. */
export function onUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

function errorBody(data: unknown): { code: string; message: string } | null {
  if (typeof data !== 'object' || data === null || !('error' in data)) return null
  const e = (data as { error: unknown }).error
  if (typeof e !== 'object' || e === null) return null
  const { code, message } = e as { code?: unknown; message?: unknown }
  return typeof code === 'string' && typeof message === 'string' ? { code, message } : null
}

export async function api<T>(path: string, { method = 'GET', body, signal }: Options = {}): Promise<T> {
  if (!apiConfigured) throw new ApiError(0, 'not_configured', 'The API is not configured.')
  const headers: Record<string, string> = { Accept: 'application/json' }
  let payload: BodyInit | undefined
  if (body instanceof FormData) payload = body
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload, credentials: 'include', signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(0, 'network_error', 'Could not reach the server. Check your connection.')
  }

  if (res.status === 204) return undefined as T
  const data: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const e = errorBody(data) ?? { code: `http_${res.status}`, message: res.statusText || 'Request failed' }
    if (res.status === 401 && e.code === 'unauthorized') unauthorizedListeners.forEach((l) => l())
    throw new ApiError(res.status, e.code, e.message)
  }
  return data as T
}
