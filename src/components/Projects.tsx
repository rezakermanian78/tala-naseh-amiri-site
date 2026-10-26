import { ArrowUpRight, BookOpen } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import { useSiteContent } from '../hooks/useSiteContent'
import Card from './Card'
import Reveal from './Reveal'
import Section from './Section'
import { SkeletonCard } from './Skeleton'

const linkClass =
  'link-underline inline-flex min-h-11 items-center gap-1 font-semibold text-rose-ink'

export default function Projects() {
  const { projects } = useContent().content
  const { projects: items, publications, loading } = useSiteContent()
  const single = items.length === 1
  return (
    <Section
      id="projects"
      eyebrow={projects.eyebrow}
      title={projects.title}
      tone="plum"
      busy={loading}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <li aria-hidden="true" className="sm:col-span-2 lg:col-span-3">
            <SkeletonCard className="max-w-4xl" />
          </li>
        )}
        {items.map((p, i) => (
          <li key={p.id} className={single ? 'sm:col-span-2 lg:col-span-3' : ''}>
            <Card delay={i * 0.1} className="max-w-4xl">
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="mb-5 aspect-video w-full rounded-xl object-cover"
                />
              )}
              {p.badge && (
                <p className="w-fit rounded-full bg-rose/10 px-3.5 py-1.5 text-sm font-semibold text-rose-ink">
                  {p.badge}
                </p>
              )}
              <h3 className="mt-4 text-xl font-bold leading-snug sm:text-2xl">{p.title}</h3>
              {p.coauthors && (
                <p className="mt-3">
                  <span className="font-semibold text-plum">{projects.coauthorsLabel}: </span>
                  {p.coauthors}
                </p>
              )}
              <p className="mt-3 text-base leading-relaxed">{p.description}</p>
              {p.tags.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.tags.map((t, ti) => (
                    <li
                      key={`${t}-${ti}`}
                      className="rounded-full bg-blush-deep px-3 py-1.5 text-sm font-medium text-plum"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              {p.link && (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} mt-6`}
                >
                  {projects.linkLabel}
                  <ArrowUpRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
                </a>
              )}
            </Card>
          </li>
        ))}
      </ul>

      {publications.length > 0 && (
        <div className="mt-14">
          <Reveal>
            <h3 className="flex items-center gap-3 text-xl font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose/10 text-rose-ink">
                <BookOpen size={20} aria-hidden="true" />
              </span>
              {projects.publicationsTitle}
            </h3>
          </Reveal>
          <ol className="mt-6 space-y-4">
            {publications.map((p, i) => (
              <li key={p.id}>
                <Reveal delay={i * 0.06}>
                  <div className="rounded-2xl border border-line/15 bg-surface/75 p-5 sm:p-6">
                    <p dir="auto" className="font-bold leading-snug text-plum">
                      {p.title}
                    </p>
                    {p.authors && (
                      <p dir="auto" className="mt-1 text-sm">
                        {p.authors}
                      </p>
                    )}
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      {[p.venue, p.year].filter(Boolean).join(' · ')}
                      {p.status && (
                        <span className="rounded-full bg-rose/10 px-3 py-1 font-semibold text-rose-ink">
                          {p.status}
                        </span>
                      )}
                    </p>
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${linkClass} mt-2`}
                      >
                        {projects.readLabel}
                        <ArrowUpRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
                      </a>
                    )}
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Section>
  )
}
