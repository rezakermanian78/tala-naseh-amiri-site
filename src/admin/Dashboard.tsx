import { ExternalLink, KeyRound, Languages, LogOut, Moon, Sun } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useTheme } from '../hooks/useTheme'
import { countUnread } from './api'
import { hasUnsavedChanges } from './dirty'
import { useConfirm } from './feedback'
import { useT, type AdminStrings } from './i18n'
import {
  ContentTab,
  EducationTab,
  GalleryTab,
  LanguagesTab,
  ProjectsTab,
  PublicationsTab,
  SkillsTab,
} from './tabs/ListTabs'
import MessagesTab from './tabs/MessagesTab'
import ProfileTab from './tabs/ProfileTab'
import ChangePassword from './ui/ChangePassword'

const TABS = [
  'profile',
  'skills',
  'languages',
  'education',
  'projects',
  'publications',
  'content',
  'gallery',
  'messages',
] as const satisfies readonly (keyof AdminStrings['tabs'])[]
type Tab = (typeof TABS)[number]

const isTab = (v: string | null): v is Tab => TABS.some((t) => t === v)

function initialTab(): Tab {
  const q = new URLSearchParams(window.location.search).get('tab')
  return isTab(q) ? q : 'profile'
}

const headerBtn =
  'inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-plum transition-colors hover:bg-blush-deep'

export default function Dashboard({
  onToggleLang,
  onSignOut,
}: {
  onToggleLang: () => void
  onSignOut: () => Promise<void>
}) {
  const t = useT()
  const confirm = useConfirm()
  const { dark, toggle } = useTheme()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [unread, setUnread] = useState(0)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({})

  useEffect(() => {
    countUnread()
      .then(setUnread)
      .catch(() => {})
  }, [])

  const okToLeave = useCallback(
    async () =>
      !hasUnsavedChanges() ||
      confirm({
        title: t.unsavedTitle,
        body: t.unsavedBody,
        confirmLabel: t.discard,
        cancelLabel: t.keepEditing,
        danger: true,
      }),
    [confirm, t],
  )

  const select = async (next: Tab, focus = false) => {
    if (next === tab || !(await okToLeave())) return
    setTab(next)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', next)
    history.replaceState(null, '', url)
    if (focus) tabRefs.current[next]?.focus()
    window.scrollTo({ top: 0 })
  }

  // Arrow-key navigation between tabs (WAI-ARIA tabs pattern).
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.indexOf(tab)
    const forward = t.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    const back = t.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
    let next: Tab | null = null
    if (e.key === forward) next = TABS[(i + 1) % TABS.length]
    else if (e.key === back) next = TABS[(i - 1 + TABS.length) % TABS.length]
    else if (e.key === 'Home') next = TABS[0]
    else if (e.key === 'End') next = TABS[TABS.length - 1]
    if (next) {
      e.preventDefault()
      void select(next, true)
    }
  }

  const signOut = async () => {
    if (await okToLeave()) await onSignOut()
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/15 bg-canvas/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center gap-1 px-3 py-2 sm:px-6">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose font-extrabold text-white"
          >
            T
          </span>
          <h1 className="ms-2 me-auto truncate text-base font-extrabold sm:text-lg">{t.adminTitle}</h1>
          <a href="/" target="_blank" rel="noopener" className={headerBtn}>
            <ExternalLink size={16} aria-hidden="true" className="rtl:-scale-x-100" />
            <span className="hidden sm:inline">{t.viewSite}</span>
            <span className="sr-only sm:hidden">{t.viewSite}</span>
          </a>
          <button type="button" onClick={onToggleLang} aria-label={t.langToggleLabel} className={headerBtn}>
            <Languages size={16} aria-hidden="true" />
            {t.langToggle}
          </button>
          <button
            type="button"
            onClick={() => setPasswordOpen(true)}
            aria-label={t.account.changePassword}
            title={t.account.changePassword}
            className={`${headerBtn} w-11 justify-center px-0`}
          >
            <KeyRound size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={t.toggleTheme}
            className={`${headerBtn} w-11 justify-center px-0`}
          >
            {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label={t.signOut}
            className={`${headerBtn} max-sm:w-11 max-sm:justify-center max-sm:px-0`}
          >
            <LogOut size={16} aria-hidden="true" className="rtl:-scale-x-100" />
            <span className="hidden sm:inline">{t.signOut}</span>
          </button>
        </div>
        <div
          role="tablist"
          aria-label={t.adminTitle}
          className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none] sm:px-6"
        >
          {TABS.map((id) => (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el
              }}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls="admin-panel"
              tabIndex={tab === id ? 0 : -1}
              onClick={() => void select(id)}
              onKeyDown={onTabKey}
              className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors ${
                tab === id ? 'bg-rose text-white' : 'text-plum hover:bg-blush-deep'
              }`}
            >
              {t.tabs[id]}
              {id === 'messages' && unread > 0 && (
                <span
                  className={`min-w-5 rounded-full px-1.5 text-xs leading-5 ${
                    tab === id ? 'bg-white text-rose-ink' : 'bg-rose text-white'
                  }`}
                >
                  {unread}
                  <span className="sr-only"> {t.messages.unread}</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main
        id="admin-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        tabIndex={-1}
        className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-8"
      >
        <h2 className="mb-5 text-2xl font-extrabold">{t.tabs[tab]}</h2>
        {tab === 'profile' && <ProfileTab />}
        {tab === 'skills' && <SkillsTab />}
        {tab === 'languages' && <LanguagesTab />}
        {tab === 'education' && <EducationTab />}
        {tab === 'projects' && <ProjectsTab />}
        {tab === 'publications' && <PublicationsTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'gallery' && <GalleryTab />}
        {tab === 'messages' && <MessagesTab onUnreadChange={setUnread} />}
      </main>
      <ChangePassword open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  )
}
