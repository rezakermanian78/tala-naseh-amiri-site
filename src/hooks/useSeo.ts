import { useEffect } from 'react'
import { seo } from '../content/fallback'
import { useSiteData } from '../lib/siteData'
import { useContent } from './useContent'

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  const el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (el && value) el.content = value
}

/**
 * Keeps <title>, meta description, Open Graph tags and the JSON-LD Person in sync with
 * site_settings (falling back to the static values). index.html keeps static defaults for
 * crawlers that don't run JavaScript.
 */
export function useSeo() {
  const { lang } = useContent()
  const { status, data } = useSiteData()
  const s = data.settings

  useEffect(() => {
    if (status === 'loading') return
    const fa = lang === 'fa'
    const title = (fa ? s.seo_title_fa : '') || s.seo_title_en || (fa ? seo.titleFa : seo.titleEn)
    const description =
      (fa ? s.seo_description_fa : '') ||
      s.seo_description_en ||
      (fa ? seo.descriptionFa : seo.descriptionEn)
    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    if (s.avatar_url) setMeta('property', 'og:image', s.avatar_url)

    const ld = document.head.querySelector('script[type="application/ld+json"]')
    if (!ld?.textContent) return
    try {
      const person: unknown = JSON.parse(ld.textContent)
      if (typeof person !== 'object' || person === null) return
      const sameAs = [s.linkedin_url, s.github_url, s.instagram_url].filter(Boolean)
      ld.textContent = JSON.stringify({
        ...person,
        ...(s.name_en && { name: s.name_en }),
        ...(s.name_fa && { alternateName: s.name_fa }),
        ...(s.email && { email: `mailto:${s.email}` }),
        ...(sameAs.length && { sameAs }),
        ...(s.avatar_url && { image: s.avatar_url }),
      })
    } catch {
      /* leave the static JSON-LD in place */
    }
  }, [status, lang, s])
}
