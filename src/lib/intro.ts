// Decided once per page load: the intro plays only on the first visit of a session
// and never with reduced motion.
function shouldPlay() {
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    if (sessionStorage.getItem('intro-seen')) return false
    sessionStorage.setItem('intro-seen', '1')
    return true
  } catch {
    return false
  }
}

export const introActive = shouldPlay()
export const INTRO_MS = 800
