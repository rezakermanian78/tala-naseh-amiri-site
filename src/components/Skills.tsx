import { motion } from 'framer-motion'
import { useContent } from '../hooks/useContent'
import Reveal from './Reveal'
import Section from './Section'

export default function Skills() {
  const { skills } = useContent().content
  return (
    <Section id="skills" eyebrow={skills.eyebrow} title={skills.title}>
      <div className="grid gap-6 md:grid-cols-3">
        {skills.groups.map((g, gi) => (
          <Reveal key={g.name} delay={gi * 0.08} className="card">
            <h3 className="text-lg font-bold">{g.name}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {g.items.map((item, i) => (
                <motion.li
                  key={`${item}-${i}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  whileHover={{ y: -2 }}
                  className="rounded-full bg-blush-deep px-3 py-1.5 text-sm font-medium text-plum"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
