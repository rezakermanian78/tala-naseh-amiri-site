import { m } from 'framer-motion'
import { useContent } from '../hooks/useContent'
import Card from './Card'
import Section from './Section'

const MAX = 5

export default function Languages() {
  const { content, isRtl } = useContent()
  const { languages } = content
  return (
    <Section id="languages" eyebrow={languages.eyebrow} title={languages.title}>
      <ul className="grid gap-6 sm:grid-cols-2">
        {languages.items.map((l, i) => (
          <li key={l.name} className="sm:[&:last-child:nth-child(odd)]:col-span-2">
            <Card delay={i * 0.08}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-xl font-bold">{l.name}</h3>
                <span dir="auto" className="text-base">
                  {l.native}
                </span>
              </div>
              <div
                role="img"
                aria-label={`${languages.levelLabel}: ${l.level}/${MAX}`}
                className="mt-5 flex gap-1.5"
              >
                {Array.from({ length: MAX }, (_, n) => (
                  <m.span
                    key={n}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-blush-deep"
                  >
                    {n < l.level && (
                      <m.span
                        variants={{
                          hidden: { scaleX: 0 },
                          show: {
                            scaleX: 1,
                            transition: {
                              duration: 0.5,
                              delay: 0.25 + i * 0.1 + n * 0.12,
                              ease: 'easeOut',
                            },
                          },
                        }}
                        style={{ originX: isRtl ? 1 : 0 }}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-soft to-rose"
                      />
                    )}
                  </m.span>
                ))}
              </div>
              <p className="mt-3 font-semibold text-rose-ink">{l.levelText}</p>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  )
}
