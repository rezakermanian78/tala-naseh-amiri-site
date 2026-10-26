import { Languages, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiConfigured, onUnauthorized } from '../lib/api'
import { logout, me } from './api'
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

type Auth =
  | { state: 'checking' }
  | { state: 'signedOut' }
  | { state: 'signedIn'; email: string; expired: boolean }

function AuthGate({ onToggleLang }: { onToggleLang: () => void }) {
  const t = useT()
  const [auth, setAuth] = useState<Auth>(apiConfigured ? { state: 'checking' } : { state: 'signedOut' })

  // Who am I? (The session is an httpOnly cookie, so only the API can tell.)
  useEffect(() => {
    if (!apiConfigured) return
    let alive = true
    me().then(
      ({ email }) => alive && setAuth({ state: 'signedIn', email, expired: false }),
      () => alive && setAuth({ state: 'signedOut' }),
    )
    return () => {
      alive = false
    }
  }, [])

  // Any 401 later on (session expired, password changed elsewhere): ask to sign in again
  // on top of the dashboard, so nothing typed so far is lost.
  useEffect(
    () =>
      onUnauthorized(() =>
        setAuth((a) => (a.state === 'signedIn' ? { ...a, expired: true } : { state: 'signedOut' })),
      ),
    [],
  )

  const signOut = async () => {
    await logout().catch(() => {})
    setAuth({ state: 'signedOut' })
  }

  const langButton = (
    <button
      type="button"
      onClick={onToggleLang}
      aria-label={t.langToggleLabel}
      className="fixed end-3 top-3 z-[70] inline-flex h-11 items-center gap-1.5 rounded-full bg-surface/80 px-3 text-sm font-semibold text-plum shadow-soft backdrop-blur hover:bg-blush-deep"
    >
      <Languages size={16} aria-hidden="true" />
      {t.langToggle}
    </button>
  )

  if (!apiConfigured) {
    return (
      <main className="grid min-h-svh place-items-center p-6">
        {langButton}
        <p role="alert" className="max-w-md rounded-2xl border border-line/15 bg-surface p-6 shadow-soft">
          {t.login.notConfigured}
        </p>
      </main>
    )
  }

  if (auth.state === 'checking') {
    return (
      <main className="grid min-h-svh place-items-center" aria-busy="true">
        <Loader2 size={28} aria-label={t.loading} className="animate-spin text-rose-ink" />
      </main>
    )
  }

  if (auth.state === 'signedOut') {
    return (
      <main className="grid min-h-svh place-items-center bg-blush px-4 py-16">
        {langButton}
        <Login onSignedIn={(email) => setAuth({ state: 'signedIn', email, expired: false })} />
      </main>
    )
  }

  return (
    <>
      <Dashboard onToggleLang={onToggleLang} onSignOut={signOut} />
      {auth.expired && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.login.title}
          className="fixed inset-0 z-[65] grid place-items-center overflow-y-auto bg-plum/50 px-4 py-16 backdrop-blur-sm"
        >
          {langButton}
          <Login
            notice={t.login.expired}
            onSignedIn={(email) => setAuth({ state: 'signedIn', email, expired: false })}
          />
        </div>
      )}
    </>
  )
}
