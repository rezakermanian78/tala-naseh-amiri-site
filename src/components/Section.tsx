import type { ReactNode } from 'react'
import Reveal from './Reveal'

export default function Section({
  id,
  eyebrow,
  title,
  tinted = false,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  tinted?: boolean
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`py-20 sm:py-28 ${tinted ? 'bg-blush' : ''}`}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-3 text-3xl font-extrabold sm:text-4xl">
            {title}
          </h2>
        </Reveal>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}
