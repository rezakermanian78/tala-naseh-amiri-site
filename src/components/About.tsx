import { useContent } from '../hooks/useContent'
import Reveal from './Reveal'
import Section from './Section'

export default function About() {
  const { about } = useContent().content
  return (
    <Section id="about" eyebrow={about.eyebrow} title={about.title}>
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <Reveal className="space-y-5 text-lg leading-relaxed">
          {about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Reveal>
        <Reveal delay={0.1}>
          <dl className="card space-y-5">
            {about.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-semibold uppercase tracking-widest text-rose-ink">
                  {f.label}
                </dt>
                <dd className="mt-1 font-semibold text-plum">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  )
}
