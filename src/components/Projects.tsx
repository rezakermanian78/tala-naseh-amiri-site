import { ArrowUpRight } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import Card from './Card'
import Section from './Section'

export default function Projects() {
  const { projects } = useContent().content
  const single = projects.items.length === 1
  return (
    <Section id="projects" eyebrow={projects.eyebrow} title={projects.title} tone="plum">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.items.map((p, i) => (
          <li key={i} className={single ? 'sm:col-span-2 lg:col-span-3' : ''}>
            <Card delay={i * 0.1} className="max-w-4xl">
              <p className="w-fit rounded-full bg-rose/10 px-3.5 py-1.5 text-sm font-semibold text-rose-ink">
                {p.badge}
              </p>
              <h3 className="mt-4 text-xl font-bold leading-snug sm:text-2xl">{p.title}</h3>
              <p className="mt-3">
                <span className="font-semibold text-plum">{projects.coauthorsLabel}: </span>
                {p.coauthors}
              </p>
              <p className="mt-3 text-base leading-relaxed">{p.description}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full bg-blush-deep px-3 py-1.5 text-sm font-medium text-plum"
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
                  className="link-underline mt-6 inline-flex min-h-11 items-center gap-1 font-semibold text-rose-ink"
                >
                  {projects.linkLabel}
                  <ArrowUpRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
                </a>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  )
}
