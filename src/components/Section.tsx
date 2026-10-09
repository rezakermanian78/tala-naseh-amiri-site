import type { ReactNode } from 'react'
import Reveal from './Reveal'

const tones = { canvas: '', blush: 'bg-blush', plum: 'bg-plum/[0.045]' } as const

export default function Section({
  id,
  eyebrow,
  title,
  tone = 'canvas',
  children,
}: {
  id: string
  eyebrow: string
  title: string
  tone?: keyof typeof tones
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative py-20 sm:py-28 lg:py-32 ${tones[tone]}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose/40 to-transparent"
      />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-4 text-h2 font-extrabold">
            {title}
          </h2>
        </Reveal>
        <div className="mt-10 sm:mt-14">{children}</div>
      </div>
    </section>
  )
}
