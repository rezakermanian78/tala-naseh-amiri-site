import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useState } from 'react'
import { INTRO_MS, introActive } from '../lib/intro'
import { useContent } from '../hooks/useContent'

/** Sub-second branded intro. Click, tap or any key skips it. */
export default function Intro() {
  const [show, setShow] = useState(introActive)
  const { content } = useContent()

  useEffect(() => {
    if (!show) return
    const t = window.setTimeout(() => setShow(false), INTRO_MS)
    const skip = () => setShow(false)
    window.addEventListener('keydown', skip)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', skip)
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <m.div
          key="intro"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-canvas"
        >
          <m.div
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            aria-hidden="true"
            className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose text-4xl font-extrabold text-white shadow-lift"
          >
            {content.meta.monogram}
          </m.div>
          <m.span
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: INTRO_MS / 1000, ease: 'easeInOut' }}
            className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-rose rtl:origin-right"
          />
          <button
            type="button"
            onClick={() => setShow(false)}
            className="absolute bottom-8 min-h-11 rounded-full px-4 text-sm font-semibold text-muted hover:text-rose-ink"
          >
            {content.nav.skipIntro}
          </button>
        </m.div>
      )}
    </AnimatePresence>
  )
}
