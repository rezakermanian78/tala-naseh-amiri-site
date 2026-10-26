import { Brain } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import { useSiteContent } from '../hooks/useSiteContent'
import Card from './Card'
import Reveal from './Reveal'
import Section from './Section'
import { SkeletonText } from './Skeleton'

export default function Goals() {
  const { goals } = useContent().content
  const { profile, loading } = useSiteContent()
  const lists = [{ title: goals.areasTitle, items: profile.researchInterests, Icon: Brain }].filter(
    (l) => loading || l.items.length > 0,
  )
  return (
    <Section id="goals" eyebrow={goals.eyebrow} title={goals.title} tone="blush" busy={loading}>
      <Reveal>
        {loading ? (
          <SkeletonText lines={3} className="max-w-3xl" />
        ) : (
          <p className="max-w-3xl text-base leading-relaxed sm:text-lg">{profile.goalsIntro}</p>
        )}
      </Reveal>
      <div className="mt-10 grid gap-6">
        {lists.map(({ title, items, Icon }, i) => (
          <Card key={title} delay={i * 0.1}>
            <h3 className="flex items-center gap-3 text-xl font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose/10 text-rose-ink">
                <Icon size={20} aria-hidden="true" />
              </span>
              {title}
            </h3>
            {loading && <SkeletonText lines={3} className="mt-5" />}
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
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
