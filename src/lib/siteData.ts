import { useSyncExternalStore } from 'react'
import { fallbackData, type SiteData } from '../content/fallback'
import { getPublicDb, supabaseConfigured } from './supabase'

/**
 * loading  – Supabase is configured and the first fetch is in flight (show skeletons)
 * live     – data from Supabase (or the last good copy of it, while revalidating)
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
  if (!supabaseConfigured) return { status: 'fallback', data: fallbackData }
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

function unwrap<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`)
  if (res.data === null) throw new Error(`${what}: no data`)
  return res.data
}

async function fetchAll(): Promise<SiteData> {
  const db = await getPublicDb()
  // `visible` is also enforced by RLS; filtering here keeps hidden rows out even if a
  // signed-in admin's browser ever reused this client.
  const [settings, skills, languages, education, projects, publications, contentWork, gallery] =
    await Promise.all([
      db.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      db.from('skills').select('*').eq('visible', true).order('sort_order').order('created_at'),
      db.from('languages').select('*').eq('visible', true).order('sort_order').order('created_at'),
      db.from('education').select('*').eq('visible', true).order('sort_order').order('created_at'),
      db.from('projects').select('*').eq('visible', true).order('sort_order').order('created_at'),
      db.from('publications').select('*').eq('visible', true).order('sort_order').order('created_at'),
      db.from('content_work').select('*').eq('visible', true).order('sort_order').order('created_at'),
      db.from('gallery').select('*').eq('visible', true).order('sort_order').order('created_at'),
    ])
  return {
    settings: unwrap(settings, 'site_settings (did you run supabase/seed.sql?)'),
    skills: unwrap(skills, 'skills'),
    languages: unwrap(languages, 'languages'),
    education: unwrap(education, 'education'),
    projects: unwrap(projects, 'projects'),
    publications: unwrap(publications, 'publications'),
    contentWork: unwrap(contentWork, 'content_work'),
    gallery: unwrap(gallery, 'gallery'),
  }
}

let started = false
/** Starts the one-and-only fetch. Called as early as possible from main.tsx. */
export function loadSiteData() {
  if (started || !supabaseConfigured) return
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
