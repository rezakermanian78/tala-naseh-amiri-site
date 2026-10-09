import { m } from 'framer-motion'
import { useContent } from '../hooks/useContent'
import Card from './Card'
import Section from './Section'

export default function Skills() {
  const { skills } = useContent().content
  return (
    <Section id="skills" eyebrow={skills.eyebrow} title={skills.title}>
      <div className="grid gap-6 md:grid-cols-3">
        {skills.groups.map((g, gi) => (
          <Card key={g.name} delay={gi * 0.1}>
            <h3 className="text-xl font-bold">{g.name}</h3>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {g.items.map((item, i) => (
                <m.li
                  key={`${item}-${i}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 16,
                    delay: 0.15 + i * 0.07,
                  }}
                  whileHover={{ y: -4 }}
                  className="rounded-full bg-blush-deep px-4 py-2 text-sm font-medium text-plum"
                >
                  {item}
                </m.li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  )
}
