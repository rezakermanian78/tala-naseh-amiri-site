import { useEffect, useState } from 'react'

/** Id of the section crossing ~40% of the viewport. Scroll-based so lazily mounted sections work. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')
  const key = ids.join(',')

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const line = window.innerHeight * 0.4
      let current = ''
      for (const id of key.split(',')) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [key])

  return active
}
