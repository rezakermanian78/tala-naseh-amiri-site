import { LazyMotion, MotionConfig } from 'framer-motion'
import { lazy, Suspense } from 'react'
import About from './components/About'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Navbar from './components/Navbar'
import { useContent } from './hooks/useContent'

const Education = lazy(() => import('./components/Education'))
const Skills = lazy(() => import('./components/Skills'))
const Projects = lazy(() => import('./components/Projects'))
const Languages = lazy(() => import('./components/Languages'))
const Goals = lazy(() => import('./components/Goals'))
const Contact = lazy(() => import('./components/Contact'))

const loadFeatures = () => import('./lib/motionFeatures').then((mod) => mod.default)

export default function App() {
  const { content } = useContent()
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <Intro />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-rose focus:px-4 focus:py-2 focus:text-white"
        >
          {content.nav.skip}
        </a>
        <Navbar />
        <main id="main">
          <Hero />
          <About />
          <Suspense fallback={<div className="min-h-[60svh]" aria-hidden="true" />}>
            <Education />
            <Skills />
            <Projects />
            <Languages />
            <Goals />
            <Contact />
          </Suspense>
        </main>
        <Footer />
      </MotionConfig>
    </LazyMotion>
  )
}
