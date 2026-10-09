import { AnimatePresence, motion } from 'framer-motion'
import { Languages, Menu, Moon, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContent } from '../hooks/useContent'
import { useTheme } from '../hooks/useTheme'

const iconBtn =
  'inline-flex h-10 w-10 items-center justify-center rounded-full text-plum transition hover:bg-blush-deep'

export default function Navbar() {
  const { content, lang } = useContent()
  const { i18n } = useTranslation()
  const { dark, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const { nav } = content

  const switchLang = () => {
    const next = lang === 'en' ? 'fa' : 'en'
    void i18n.changeLanguage(next)
    document.documentElement.lang = next
    document.documentElement.dir = next === 'fa' ? 'rtl' : 'ltr'
    try {
      localStorage.setItem('lang', next)
    } catch {
      /* storage unavailable */
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/15 bg-canvas/70 backdrop-blur-lg">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <a href="#top" className="flex items-center gap-2 font-extrabold text-plum">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose text-white"
          >
            {content.meta.monogram}
          </span>
          <span className="hidden sm:inline">{content.meta.name}</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {nav.links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:text-rose-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={switchLang}
            aria-label={nav.toggleLangLabel}
            className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-plum transition hover:bg-blush-deep"
          >
            <Languages size={16} aria-hidden="true" />
            {nav.toggleLang}
          </button>
          <button type="button" onClick={toggle} aria-label={nav.toggleTheme} className={iconBtn}>
            {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={nav.menu}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className={`${iconBtn} lg:hidden`}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line/15 bg-canvas/95 px-5 lg:hidden"
          >
            {nav.links.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-base font-medium text-plum"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
