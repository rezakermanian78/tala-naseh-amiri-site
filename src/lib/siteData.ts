import { useSyncExternalStore } from 'react'
import { fallbackData, type SiteData } from '../content/fallback'
import { api, apiConfigured } from './api'

/**
 * loading  – the API is configured and the first fetch is in flight (show skeletons)
 * live     – data from the API (or the last good copy of it, while revalidating)
 * fallback – the static content in src/content (no env vars, offline, or an error)
 */
export type SiteDataStatus = 'loading' | 'live' | 'fallback'
export type SiteDataState = { status: SiteDataStatus; data: SiteData }

const CACHE_KEY = 'site-data-v1'
const TIMEOUT_MS = 6000

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

function isSiteData(v: unknown): v is SiteData {
  if (!isObject(v) || !isObject(v.settings)) return false
  const lists = ['skills', 'languages', 'education', 'projects', 'publications', 'contentWork', 'gallery']
  return lists.every((k) => Array.isArray(v[k]))
}

function readCache(): SiteData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return isSiteData(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeCache(data: SiteData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    /* storage full or unavailable */
  }
}

function initialState(): SiteDataState {
  if (!apiConfigured) return { status: 'fallback', data: fallbackData }
  // Repeat visits render the last good copy instantly, then refresh it in the background.
  const cached = readCache()
  return cached ? { status: 'live', data: cached } : { status: 'loading', data: fallbackData }
}

let state = initialState()
const listeners = new Set<() => void>()

function setState(next: SiteDataState) {
  state = next
  listeners.forEach((l) => l())
}

async function fetchAll(): Promise<SiteData> {
  // One payload with everything visible (GET /api/content).
  const data = await api<unknown>('/api/content', { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!isSiteData(data)) throw new Error('Unexpected /api/content response')
  return data
}

let started = false
/** Starts the one-and-only fetch. Called as early as possible from main.tsx. */
export function loadSiteData() {
  if (started || !apiConfigured) return
  started = true
  const timer = window.setTimeout(() => {
    if (state.status === 'loading') setState({ status: 'fallback', data: fallbackData })
  }, TIMEOUT_MS)
  fetchAll()
    .then((data) => {
      setState({ status: 'live', data })
      writeCache(data)
    })
    .catch((err: unknown) => {
      console.warn('[site] Using built-in content:', err instanceof Error ? err.message : err)
      if (state.status === 'loading') setState({ status: 'fallback', data: fallbackData })
    })
    .finally(() => window.clearTimeout(timer))
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getSnapshot = () => state

export function useSiteData(): SiteDataState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
