import { Download, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { site } from '../content/site'
import { useContent } from '../hooks/useContent'
import CircuitBackdrop from './CircuitBackdrop'

export default function Hero() {
  const { content } = useContent()
  const { hero } = content

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-gradient-to-b from-blush to-canvas pb-20 pt-32 sm:pt-40"
    >
      <div
        aria-hidden="true"
        className="absolute -start-24 -top-24 -z-10 h-96 w-96 rounded-full bg-rose-soft/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-10 end-0 -z-10 h-80 w-80 rounded-full bg-rose/20 blur-3xl"
      />
      <CircuitBackdrop className="absolute inset-x-0 top-24 -z-10 mx-auto w-full max-w-4xl opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 md:grid-cols-[1.3fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow">{hero.greeting}</p>
          <h1 id="hero-title" className="mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">
            {hero.name}
          </h1>
          <p dir="auto" className="mt-2 text-xl text-muted">
            {hero.nativeName}
          </p>
          <p className="mt-6 text-lg font-semibold text-rose-ink sm:text-xl">{hero.title}</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed sm:text-lg">{hero.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contact" className="btn-primary">
              <Mail size={18} aria-hidden="true" />
              {hero.contact}
            </a>
            <a href={site.cvPath} download className="btn-ghost">
              <Download size={18} aria-hidden="true" />
              {hero.cv}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto h-64 w-64 sm:h-80 sm:w-80"
        >
          <div
            aria-hidden="true"
            className="absolute -inset-3 rounded-full border-2 border-dashed border-rose-soft/70"
          />
          <div
            aria-hidden="true"
            className="absolute -inset-7 rounded-full border border-rose/20"
          />
          <picture>
            <source srcSet="/avatar.webp" type="image/webp" />
            <img
              src="/avatar.jpg"
              alt={hero.avatarAlt}
              width={1200}
              height={948}
              fetchPriority="high"
              className="h-full w-full rounded-full object-cover shadow-soft [object-position:0%_20%]"
            />
          </picture>
        </motion.div>
      </div>
    </section>
  )
}
