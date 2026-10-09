import { Brain, Sparkles } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import Card from './Card'
import Reveal from './Reveal'
import Section from './Section'

export default function Goals() {
  const { goals } = useContent().content
  const lists = [
    { title: goals.interestsTitle, items: goals.interests, Icon: Sparkles },
    { title: goals.areasTitle, items: goals.areas, Icon: Brain },
  ]
  return (
    <Section id="goals" eyebrow={goals.eyebrow} title={goals.title} tone="blush">
      <Reveal>
        <p className="max-w-3xl text-base leading-relaxed sm:text-lg">{goals.intro}</p>
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {lists.map(({ title, items, Icon }, i) => (
          <Card key={title} delay={i * 0.1}>
            <h3 className="flex items-center gap-3 text-xl font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose/10 text-rose-ink">
                <Icon size={20} aria-hidden="true" />
              </span>
              {title}
            </h3>
            <ul className="mt-5 space-y-3">
              {items.map((it, n) => (
                <li key={`${it}-${n}`} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose"
                  />
                  {it}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  )
}
