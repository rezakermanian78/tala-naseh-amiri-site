import { Camera, Clapperboard, Palette } from 'lucide-react'
import { site } from '../content/site'
import { useContent } from '../hooks/useContent'
import Card from './Card'
import Magnetic from './Magnetic'
import Reveal from './Reveal'
import Section from './Section'

const icons = [Camera, Clapperboard, Palette]

export default function ContentCreation() {
  const { contentCreation: cc } = useContent().content
  const instagram = site.socials.instagram
  return (
    <Section id="content" eyebrow={cc.eyebrow} title={cc.title} tone="blush">
      <Reveal>
        <p className="max-w-3xl text-base leading-relaxed sm:text-lg">{cc.intro}</p>
      </Reveal>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {cc.cards.map((c, i) => {
          const Icon = icons[i]
          return (
            <li key={c.title}>
              <Card delay={i * 0.1}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose/10 text-rose-ink">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-bold">{c.title}</h3>
                <p className="mt-2 leading-relaxed">{c.description}</p>
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
      {site.featuredWork.length > 0 && (
        <div className="mt-14">
          <h3 className="text-xl font-bold">{cc.featuredTitle}</h3>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {site.featuredWork.map((w, i) => (
              <li key={w.src}>
                <Reveal delay={i * 0.08}>
                  <img
                    src={w.src}
                    alt={w.alt}
                    loading="lazy"
                    className="aspect-square w-full rounded-2xl object-cover shadow-soft"
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  )
}
