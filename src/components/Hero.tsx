import { Download, Mail } from 'lucide-react'
import {
  m,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useRef, type PointerEvent } from 'react'
import { site } from '../content/site'
import { useContent } from '../hooks/useContent'
import { useDesktopFx } from '../hooks/useDesktopFx'
import { INTRO_MS, introActive } from '../lib/intro'
import Magnetic from './Magnetic'
import NeuralNetwork from './NeuralNetwork'

const base = introActive ? INTRO_MS / 1000 - 0.15 : 0.1

export default function Hero() {
  const { content } = useContent()
  const { hero } = content
  const fx = useDesktopFx()
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const k = fx ? 1 : 0
  const blobA = useTransform(scrollYProgress, [0, 1], [0, 180 * k])
  const blobB = useTransform(scrollYProgress, [0, 1], [0, -140 * k])
  const net = useTransform(scrollYProgress, [0, 1], [0, 90 * k])

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 50, damping: 18 })
  const py = useSpring(my, { stiffness: 50, damping: 18 })
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!fx) return
    mx.set((e.clientX / window.innerWidth - 0.5) * 2)
    my.set((e.clientY / window.innerHeight - 0.5) * 2)
  }

  const words = hero.name.split(' ')
  const lastWord = words.length - 1
  const rise = reduced ? { opacity: 0 } : { y: '110%', opacity: 0 }
  const fade = (d: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: base + d, ease: [0.2, 0.7, 0.2, 1] as const },
  })

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={onMove}
      aria-labelledby="hero-title"
      className="grain relative isolate flex min-h-svh items-center overflow-hidden bg-gradient-to-b from-blush via-blush to-canvas pb-16 pt-24 sm:pt-28"
    >
      <m.div
        style={{ y: blobA }}
        aria-hidden="true"
        className="absolute -start-20 -top-20 -z-10 sm:-start-28 sm:-top-28"
      >
        <div className="h-64 w-64 rounded-full bg-rose-soft/35 blur-3xl sm:h-96 sm:w-96 motion-safe:md:animate-float-slow" />
      </m.div>
      <m.div style={{ y: blobB }} aria-hidden="true" className="absolute -bottom-16 -end-16 -z-10">
        <div className="h-60 w-60 rounded-full bg-rose/20 blur-3xl sm:h-80 sm:w-80 motion-safe:md:animate-float" />
      </m.div>
      <m.div style={{ y: net }} aria-hidden="true" className="absolute inset-0 -z-10">
        <NeuralNetwork
          px={px}
          py={py}
          className="h-full w-full opacity-60 [mask-image:radial-gradient(ellipse_at_72%_45%,black_12%,transparent_58%)] sm:opacity-80"
        />
      </m.div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 sm:px-8 md:grid-cols-[1.25fr_1fr] md:gap-8">
        <div className="order-2 md:order-1">
          <m.p
            {...fade(0)}
            className="inline-flex items-center gap-2.5 rounded-full border border-line/20 bg-surface/70 px-4 py-2 text-sm font-semibold text-plum shadow-soft backdrop-blur"
          >
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inset-0 rounded-full bg-emerald-500 motion-safe:animate-ping2" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            {hero.status}
          </m.p>

          <h1 id="hero-title" className="mt-6 text-display font-extrabold">
            {words.map((w, i) => (
              <span
                key={i}
                className="-mb-[0.1em] me-[0.25em] inline-block overflow-hidden pb-[0.25em] align-bottom"
              >
                <m.span
                  className={`-mb-[0.2em] inline-block pb-[0.2em] ${i === lastWord ? 'bg-gradient-to-r from-rose-ink to-rose bg-clip-text text-transparent' : ''}`}
                  initial={rise}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: base + 0.1 + i * 0.12,
                    ease: [0.2, 0.7, 0.2, 1],
                  }}
                >
                  {w}
                </m.span>
              </span>
            ))}
          </h1>
          <m.p
            {...fade(0.5)}
            dir="auto"
            className="mt-2 text-xl font-medium text-muted sm:text-2xl"
          >
            <bdi>{hero.nativeName}</bdi>
          </m.p>
          <m.p {...fade(0.6)} className="mt-6 text-lg font-semibold text-rose-ink sm:text-xl">
            {hero.title}
          </m.p>
          <m.p {...fade(0.7)} className="mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
            {hero.tagline}
          </m.p>
          <m.div {...fade(0.85)} className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <a href="#contact" className="btn-primary">
                <Mail size={18} aria-hidden="true" />
                {hero.contact}
              </a>
            </Magnetic>
            <Magnetic>
              <a href={site.cvPath} download className="btn-ghost">
                <Download size={18} aria-hidden="true" />
                {hero.cv}
              </a>
            </Magnetic>
          </m.div>
        </div>

        <div className="order-1 flex justify-center md:order-2">
          <div className="relative h-44 w-44 min-[400px]:h-52 min-[400px]:w-52 sm:h-72 sm:w-72 lg:h-80 lg:w-80">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-full bg-rose/30 blur-2xl motion-safe:animate-glow"
            />
            <div
              aria-hidden="true"
              className="absolute -inset-1.5 rounded-full bg-[conic-gradient(from_0deg,rgb(var(--rose)),rgb(var(--rose-soft)),transparent_55%,rgb(var(--rose)))] motion-safe:animate-ring"
            />
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-full border border-dashed border-rose-soft/60"
            />
            <picture>
              <source
                type="image/webp"
                srcSet="/avatar-640.webp 640w, /avatar.webp 1200w"
                sizes="(min-width: 640px) 320px, 208px"
              />
              <img
                src="/avatar-640.jpg"
                alt={hero.avatarAlt}
                width={640}
                height={506}
                fetchPriority="high"
                decoding="async"
                className="relative h-full w-full rounded-full border-4 border-canvas object-cover shadow-lift [object-position:0%_20%]"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  )
}
