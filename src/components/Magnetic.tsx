import { m, useMotionValue, useSpring } from 'framer-motion'
import type { ReactNode, PointerEvent } from 'react'
import { useDesktopFx } from '../hooks/useDesktopFx'

/** Pulls its child slightly toward the cursor (desktop only). */
export default function Magnetic({ children }: { children: ReactNode }) {
  const fx = useDesktopFx()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 })

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!fx) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <m.div
      className="inline-block"
      style={fx ? { x, y } : undefined}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </m.div>
  )
}
