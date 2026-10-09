import { useReducedMotion } from 'framer-motion'
import { useSyncExternalStore } from 'react'

const query = '(hover: hover) and (pointer: fine) and (min-width: 768px)'

function subscribe(cb: () => void) {
  const m = matchMedia(query)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}

/** True only for large, fine-pointer screens without reduced motion — gate heavy effects on this. */
export function useDesktopFx() {
  const fine = useSyncExternalStore(
    subscribe,
    () => matchMedia(query).matches,
    () => false,
  )
  const reduced = useReducedMotion()
  return fine && !reduced
}
