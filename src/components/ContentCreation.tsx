import { ArrowUpRight, Camera, Clapperboard, Palette } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import { useSiteContent } from '../hooks/useSiteContent'
import Card from './Card'
import Magnetic from './Magnetic'
import Reveal from './Reveal'
import Section from './Section'
import { SkeletonCard, SkeletonText } from './Skeleton'

const icons = [Camera, Clapperboard, Palette]

export default function ContentCreation() {
  const { contentCreation: cc } = useContent().content
  const { profile, contentWork, gallery, loading } = useSiteContent()
  const instagram = profile.socials.instagram
  return (
    <Section id="content" eyebrow={cc.eyebrow} title={cc.title} tone="blush" busy={loading}>
      <Reveal>
        {loading ? (
          <SkeletonText lines={2} className="max-w-3xl" />
        ) : (
          <p className="max-w-3xl text-base leading-relaxed sm:text-lg">{profile.contentIntro}</p>
        )}
      </Reveal>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {loading &&
          [0, 1, 2].map((i) => (
            <li key={i} aria-hidden="true">
              <SkeletonCard />
            </li>
          ))}
        {contentWork.map((c, i) => {
          const Icon = icons[i % icons.length]
          return (
            <li key={c.id}>
              <Card delay={i * 0.1}>
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose/10 text-rose-ink">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                )}
                <h3 className="mt-5 text-xl font-bold">{c.title}</h3>
                <p className="mt-2 leading-relaxed">{c.description}</p>
                {c.link && (
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-rose-ink"
                  >
                    {cc.viewPost}
                    <span className="sr-only">: {c.title}</span>
                    <ArrowUpRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
                  </a>
                )}
              </Card>
            </li>
          )
        })}
      </ul>
      {instagram && (
        <Reveal className="mt-10 flex justify-center sm:justify-start">
          <Magnetic>
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <Camera size={18} aria-hidden="true" />
              {cc.follow}
            </a>
          </Magnetic>
        </Reveal>
      )}
      {gallery.length > 0 && (
        <div className="mt-14">
          <h3 className="text-xl font-bold">{cc.featuredTitle}</h3>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {gallery.map((w, i) => (
              <li key={w.id}>
                <Reveal delay={i * 0.08}>
                  <figure>
                    <img
                      src={w.imageUrl}
                      alt={w.caption}
                      loading="lazy"
                      decoding="async"
                      className="aspect-square w-full rounded-2xl object-cover shadow-soft"
                    />
                    {w.caption && (
                      <figcaption aria-hidden="true" className="mt-2 text-sm">
                        {w.caption}
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  )
}
