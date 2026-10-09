import { m, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { ReactNode, PointerEvent } from 'react'
import { useDesktopFx } from '../hooks/useDesktopFx'
import Reveal from './Reveal'

/** Glass card: reveal on scroll, 3D tilt + spotlight on desktop, press feedback on touch. */
export default function Card({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const fx = useDesktopFx()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 200, damping: 20 })
  const sy = useSpring(py, { stiffness: 200, damping: 20 })
  const rotateX = useTransform(sy, [0, 1], [5, -5])
  const rotateY = useTransform(sx, [0, 1], [-5, 5])

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!fx) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    px.set(x)
    py.set(y)
    e.currentTarget.style.setProperty('--mx', `${x * 100}%`)
    e.currentTarget.style.setProperty('--my', `${y * 100}%`)
  }
  const onLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <Reveal delay={delay} className="h-full">
      <m.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        whileTap={{ scale: 0.98 }}
        style={fx ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
        className={`card group h-full ${className}`}
      >
        {fx && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgb(var(--rose) / 0.14), transparent 65%)',
            }}
          />
        )}
        <div className="relative">{children}</div>
      </m.div>
    </Reveal>
  )
}
