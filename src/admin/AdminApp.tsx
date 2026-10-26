import type { Session } from '@supabase/supabase-js'
import { Languages, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ADMIN_EMAIL, supabaseConfigured } from '../lib/supabase'
import { getSupabase } from '../lib/supabaseAdmin'
import Dashboard from './Dashboard'
import { hasUnsavedChanges } from './dirty'
import { AdminLangContext, adminStrings, useT, type AdminLang } from './i18n'
import Login from './Login'
import FeedbackProvider from './ui/Feedback'

const LANG_KEY = 'admin-lang'

function storedLang(): AdminLang {
  try {
    return localStorage.getItem(LANG_KEY) === 'fa' ? 'fa' : 'en'
  } catch {
    return 'en'
  }
}

// Read before supabase-js consumes the URL: an expired/invalid magic link lands here.
const linkError = new URLSearchParams(window.location.hash.slice(1)).get('error_description')

export default function AdminApp() {
  const [lang, setLang] = useState<AdminLang>(storedLang)
  const t = adminStrings[lang]

  // Page chrome: language/direction, title, and keep the admin out of search engines.
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = t.dir
    document.title = `${t.adminTitle} · Tala Naseh Amiri`
  }, [lang, t])

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    const warn = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges()) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => {
      meta.remove()
      window.removeEventListener('beforeunload', warn)
    }
  }, [])

  const toggleLang = () => {
    const next = lang === 'en' ? 'fa' : 'en'
    setLang(next)
    try {
      localStorage.setItem(LANG_KEY, next)
    } catch {
      /* storage unavailable */
    }
  }

  return (
    <AdminLangContext.Provider value={t}>
      <FeedbackProvider>
        <div dir={t.dir} lang={lang} className="min-h-svh bg-canvas text-muted">
          <AuthGate onToggleLang={toggleLang} />
        </div>
      </FeedbackProvider>
    </AdminLangContext.Provider>
  )
}

function AuthGate({ onToggleLang }: { onToggleLang: () => void }) {
  const t = useT()
  const [session, setSession] = useState<Session | null | undefined>(
    supabaseConfigured ? undefined : null,
  )
  const [error, setError] = useState(linkError ?? '')

  useEffect(() => {
    if (!supabaseConfigured) return
    let unsubscribe = () => {}
    let alive = true
    void getSupabase().then((sb) => {
      if (!alive) return
      const { data } = sb.auth.onAuthStateChange((_event, s) => setSession(s))
      unsubscribe = () => data.subscription.unsubscribe()
      void sb.auth.getSession().then(({ data: d, error: e }) => {
        if (e) setError(e.message)
        setSession(d.session)
      })
    })
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  // Clean "#error=…" or "#access_token=…" leftovers out of the address bar.
  useEffect(() => {
    if (session !== undefined && window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [session])

  const signOut = async () => {
    const sb = await getSupabase()
    await sb.auth.signOut()
  }

  const langButton = (
    <button
      type="button"
      onClick={onToggleLang}
      aria-label={t.langToggleLabel}
      className="fixed end-3 top-3 z-50 inline-flex h-11 items-center gap-1.5 rounded-full bg-surface/80 px-3 text-sm font-semibold text-plum shadow-soft backdrop-blur hover:bg-blush-deep"
    >
      <Languages size={16} aria-hidden="true" />
      {t.langToggle}
    </button>
  )

  if (!supabaseConfigured) {
    return (
      <main className="grid min-h-svh place-items-center p-6">
        {langButton}
        <p role="alert" className="max-w-md rounded-2xl border border-line/15 bg-surface p-6 shadow-soft">
          {t.login.notConfigured}
        </p>
      </main>
    )
  }

  if (session === undefined) {
    return (
      <main className="grid min-h-svh place-items-center" aria-busy="true">
        <Loader2 size={28} aria-label={t.loading} className="animate-spin text-rose-ink" />
      </main>
    )
  }

  if (!session) {
    return (
      <>
        {langButton}
        {error && (
          <p
            role="alert"
            className="fixed inset-x-3 top-16 z-40 mx-auto max-w-md rounded-2xl border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-900"
          >
            {t.login.linkError}: {error}
          </p>
        )}
        <Login />
      </>
    )
  }

  if ((session.user.email ?? '').toLowerCase() !== ADMIN_EMAIL) {
    return (
      <main className="grid min-h-svh place-items-center p-6">
        {langButton}
        <div className="max-w-md rounded-2xl border border-line/15 bg-surface p-6 text-center shadow-soft">
          <p role="alert" className="font-semibold text-plum">
            {t.login.notAuthorized}
          </p>
          <p className="mt-1 text-sm" dir="ltr">
            {session.user.email}
          </p>
          <button type="button" onClick={() => void signOut()} className="btn-primary mt-5">
            {t.signOut}
          </button>
        </div>
      </main>
    )
  }

  return <Dashboard onToggleLang={onToggleLang} onSignOut={signOut} />
}
