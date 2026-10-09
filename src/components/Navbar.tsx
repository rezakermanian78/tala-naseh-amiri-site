import { AnimatePresence, m, useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import { Languages, Menu, Moon, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useActiveSection } from '../hooks/useActiveSection'
import { useContent } from '../hooks/useContent'
import { useTheme } from '../hooks/useTheme'

const iconBtn =
  'inline-flex h-11 w-11 items-center justify-center rounded-full text-plum transition-colors hover:bg-blush-deep'

export default function Navbar() {
  const { content, lang, isRtl } = useContent()
  const { i18n } = useTranslation()
  const { dark, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { nav } = content
  const active = useActiveSection(nav.links.map((l) => l.id))
  const listRef = useRef<HTMLUListElement>(null)
  const [bar, setBar] = useState({ x: 0, scale: 0 })

  useEffect(() => {
    const ul = listRef.current
    const link = ul?.querySelector<HTMLElement>('a[aria-current]')
    if (!ul || !link) return setBar((b) => ({ ...b, scale: 0 }))
    setBar({ x: link.offsetLeft + 14, scale: (link.offsetWidth - 28) / ul.offsetWidth })
  }, [active, lang, scrolled])

  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [open])

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
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-lg transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled ? 'border-line/15 bg-canvas/80 shadow-soft' : 'border-transparent bg-canvas/40'
      }`}
    >
      <nav
        aria-label="Primary"
        className={`mx-auto flex max-w-6xl items-center justify-between px-4 transition-[height] duration-300 sm:px-8 ${
          scrolled ? 'h-14' : 'h-[4.5rem]'
        }`}
      >
        <a
          href="#top"
          aria-label={content.meta.name}
          className="flex min-h-11 items-center gap-2 font-extrabold text-plum"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose text-white"
          >
            {content.meta.monogram}
          </span>
          <span className="hidden sm:inline">{content.meta.name}</span>
        </a>

        <ul ref={listRef} className="relative hidden items-center gap-1 lg:flex">
          {nav.links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                aria-current={active === l.id ? 'true' : undefined}
                className={`relative inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium transition-colors ${
                  active === l.id ? 'text-rose-ink' : 'text-muted hover:text-plum'
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
          <span
            aria-hidden="true"
            className="absolute bottom-1.5 left-0 h-0.5 w-full origin-left rounded-full bg-rose transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${bar.x}px) scaleX(${bar.scale})` }}
          />
        </ul>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={switchLang}
            aria-label={nav.toggleLangLabel}
            className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-plum transition-colors hover:bg-blush-deep"
          >
            <Languages size={16} aria-hidden="true" />
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={lang}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {nav.toggleLang}
              </m.span>
            </AnimatePresence>
          </button>
          <button type="button" onClick={toggle} aria-label={nav.toggleTheme} className={iconBtn}>
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={dark ? 'sun' : 'moon'}
                initial={{ opacity: 0, rotate: -80, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 80, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                {dark ? (
                  <Sun size={19} aria-hidden="true" />
                ) : (
                  <Moon size={19} aria-hidden="true" />
                )}
              </m.span>
            </AnimatePresence>
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={nav.menu}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className={`${iconBtn} lg:hidden`}
          >
            <Menu size={21} aria-hidden="true" />
          </button>
        </div>
      </nav>

      <m.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-rose-soft to-rose rtl:origin-right"
      />

      <AnimatePresence>
        {open && (
          <>
            <m.button
              type="button"
              aria-label={nav.close}
              tabIndex={-1}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 h-dvh bg-plum/40 backdrop-blur-sm lg:hidden"
            />
            <m.div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={nav.menu}
              initial={{ x: isRtl ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '-100%' : '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 36 }}
              className="fixed inset-y-0 end-0 z-50 flex h-dvh w-[min(20rem,85vw)] flex-col bg-canvas p-5 shadow-lift lg:hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={nav.close}
                className={`${iconBtn} self-end`}
              >
                <X size={22} aria-hidden="true" />
              </button>
              <ul className="mt-4 flex flex-col">
                {nav.links.map((l, i) => (
                  <m.li
                    key={l.id}
                    initial={{ opacity: 0, x: isRtl ? -24 : 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                  >
                    <a
                      href={`#${l.id}`}
                      onClick={() => setOpen(false)}
                      aria-current={active === l.id ? 'true' : undefined}
                      className={`flex min-h-12 items-center border-b border-line/10 text-xl font-bold ${
                        active === l.id ? 'text-rose-ink' : 'text-plum'
                      }`}
                    >
                      {l.label}
                    </a>
                  </m.li>
                ))}
              </ul>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
