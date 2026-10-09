import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'
import { useContent } from '../hooks/useContent'

export default function Counter({ to }: { to: number }) {
  const { lang } = useContent()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduced = useReducedMotion()
  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US'), [lang])

  useEffect(() => {
    const el = ref.current
    if (!el || !inView) return
    if (reduced) {
      el.textContent = fmt.format(to)
      return
    }
    const controls = animate(0, to, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate: (v) => {
        el.textContent = fmt.format(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [inView, reduced, to, fmt])

  return <span ref={ref}>{fmt.format(0)}</span>
}
