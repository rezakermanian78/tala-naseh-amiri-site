import { GraduationCap } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import Reveal from './Reveal'
import Section from './Section'

export default function Education() {
  const { education } = useContent().content
  return (
    <Section id="education" eyebrow={education.eyebrow} title={education.title} tinted>
      <ol className="relative space-y-8 border-s-2 border-rose-soft/50 ps-8">
        {education.items.map((item) => (
          <li key={item.degree} className="relative">
            <span
              aria-hidden="true"
              className="absolute -start-[2.9rem] top-5 flex h-9 w-9 items-center justify-center rounded-full bg-rose text-white ring-4 ring-blush"
            >
              <GraduationCap size={18} />
            </span>
            <Reveal className="card">
              <p className="text-sm font-semibold text-rose-ink">{item.period}</p>
              <h3 className="mt-1 text-xl font-bold">{item.degree}</h3>
              <p className="font-medium">{item.school}</p>
              <p className="mt-2 text-sm">{item.details}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}
