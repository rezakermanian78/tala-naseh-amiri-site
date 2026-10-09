import { ArrowUpRight } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import Reveal from './Reveal'
import Section from './Section'

export default function Projects() {
  const { projects } = useContent().content
  return (
    <Section id="projects" eyebrow={projects.eyebrow} title={projects.title} tinted>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.items.map((p, i) => (
          <li key={i}>
            <Reveal
              delay={i * 0.08}
              className="card flex h-full flex-col transition hover:-translate-y-1"
            >
              <h3 className="text-lg font-bold">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed">{p.description}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full bg-blush-deep px-2.5 py-1 text-xs font-medium text-plum"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              {p.href && (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-rose-ink hover:underline"
                >
                  {projects.linkLabel}
                  <ArrowUpRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
                </a>
              )}
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
