import { GraduationCap } from 'lucide-react'
import { m, useScroll, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { useContent } from '../hooks/useContent'
import { useSiteContent } from '../hooks/useSiteContent'
import Card from './Card'
import Section from './Section'
import { SkeletonCard } from './Skeleton'

export default function Education() {
  const { education } = useContent().content
  const { education: items, loading } = useSiteContent()
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] })
  const draw = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })

  return (
    <Section
      id="education"
      eyebrow={education.eyebrow}
      title={education.title}
      tone="blush"
      busy={loading}
    >
      <ol ref={ref} className="relative space-y-8 ps-12 sm:ps-14">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 start-[1.1rem] w-0.5 bg-rose-soft/25 sm:start-[1.35rem]"
        />
        <m.span
          aria-hidden="true"
          style={{ scaleY: draw }}
          className="absolute inset-y-0 start-[1.1rem] w-0.5 origin-top bg-gradient-to-b from-rose-soft to-rose sm:start-[1.35rem]"
        />
        {loading && (
          <li aria-hidden="true">
            <SkeletonCard className="max-w-3xl" />
          </li>
        )}
        {items.map((item) => (
          <li key={item.id} className="relative">
            <span
              aria-hidden="true"
              className="absolute -start-12 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-rose text-white ring-4 ring-blush sm:-start-14 sm:h-11 sm:w-11"
            >
              <GraduationCap size={19} />
            </span>
            <Card className="max-w-3xl">
              <p className="text-sm font-semibold text-rose-ink">{item.period}</p>
              <h3 className="mt-1 text-xl font-bold sm:text-2xl">{item.title}</h3>
              <p className="font-medium text-plum">{item.institution}</p>
              {item.field && <p className="mt-2">{item.field}</p>}
              {item.description && <p className="mt-2 leading-relaxed">{item.description}</p>}
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  )
}
