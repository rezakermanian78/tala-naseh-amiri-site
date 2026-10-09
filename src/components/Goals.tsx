import { Brain, Sparkles } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import Reveal from './Reveal'
import Section from './Section'

export default function Goals() {
  const { goals } = useContent().content
  const lists = [
    { title: goals.interestsTitle, items: goals.interests, Icon: Sparkles },
    { title: goals.areasTitle, items: goals.areas, Icon: Brain },
  ]
  return (
    <Section id="goals" eyebrow={goals.eyebrow} title={goals.title} tinted>
      <Reveal>
        <p className="max-w-3xl text-lg leading-relaxed">{goals.intro}</p>
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {lists.map(({ title, items, Icon }, i) => (
          <Reveal key={title} delay={i * 0.1} className="card">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Icon size={20} aria-hidden="true" className="text-rose-ink" />
              {title}
            </h3>
            <ul className="mt-4 space-y-2">
              {items.map((it, n) => (
                <li key={`${it}-${n}`} className="flex gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose"
                  />
                  {it}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
