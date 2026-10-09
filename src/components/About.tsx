import { useContent } from '../hooks/useContent'
import Card from './Card'
import Counter from './Counter'
import Reveal from './Reveal'
import Section from './Section'

export default function About() {
  const { about } = useContent().content
  return (
    <Section id="about" eyebrow={about.eyebrow} title={about.title}>
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:gap-14">
        <div className="space-y-5 text-base leading-relaxed sm:text-lg">
          {about.paragraphs.map((p, i) => (
            <Reveal key={p} delay={i * 0.08}>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
        <Card delay={0.1}>
          <dl className="space-y-5">
            {about.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-semibold uppercase tracking-widest text-rose-ink">
                  {f.label}
                </dt>
                <dd className="mt-1 text-base font-semibold text-plum">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-4 min-[480px]:grid-cols-3 sm:mt-16 sm:gap-6">
        {about.stats.map((s, i) => (
          <li key={s.label}>
            <Reveal delay={i * 0.1} className="h-full">
              <div className="h-full rounded-2xl border border-line/15 bg-blush/70 px-6 py-5 text-center">
                <p className="bg-gradient-to-r from-rose-ink to-rose bg-clip-text text-5xl font-extrabold text-transparent">
                  <Counter to={s.value} />
                </p>
                <p className="mt-1 text-sm font-medium text-muted">{s.label}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
