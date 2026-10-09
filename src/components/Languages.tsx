import { useContent } from '../hooks/useContent'
import Reveal from './Reveal'
import Section from './Section'

const MAX = 5

export default function Languages() {
  const { languages } = useContent().content
  return (
    <Section id="languages" eyebrow={languages.eyebrow} title={languages.title}>
      <ul className="grid gap-6 sm:grid-cols-2">
        {languages.items.map((l, i) => (
          <li key={l.name}>
            <Reveal delay={i * 0.07} className="card">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold">{l.name}</h3>
                <span dir="auto" className="text-sm">
                  {l.native}
                </span>
              </div>
              <div
                role="img"
                aria-label={`${languages.levelLabel}: ${l.level}/${MAX}`}
                className="mt-4 flex gap-1.5"
              >
                {Array.from({ length: MAX }, (_, n) => (
                  <span
                    key={n}
                    className={`h-2 flex-1 rounded-full ${n < l.level ? 'bg-rose' : 'bg-blush-deep'}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm font-medium text-rose-ink">{l.levelText}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
