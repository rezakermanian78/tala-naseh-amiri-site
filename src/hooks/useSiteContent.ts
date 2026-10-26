import { useMemo } from 'react'
import type { SiteData } from '../content/fallback'
import type { Lang } from '../i18n'
import { useSiteData, type SiteDataStatus } from '../lib/siteData'
import { useContent } from './useContent'

type Bi<K extends string> = Record<`${K}_en` | `${K}_fa`, string>
type BiList<K extends string> = Record<`${K}_en` | `${K}_fa`, string[]>

/** Field in the current language, falling back to English when the Persian one is empty. */
const text = <K extends string>(row: Bi<K>, key: K, lang: Lang): string =>
  (lang === 'fa' ? row[`${key}_fa`] : '') || row[`${key}_en`]

const list = <K extends string>(row: BiList<K>, key: K, lang: Lang): string[] =>
  lang === 'fa' && row[`${key}_fa`].length ? row[`${key}_fa`] : row[`${key}_en`]

const paragraphs = (s: string) =>
  s
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

function localize(data: SiteData, lang: Lang, periodTodo: string) {
  const s = data.settings
  const otherName = lang === 'fa' ? s.name_en : s.name_fa

  const skillGroups: { name: string; items: string[] }[] = []
  for (const sk of data.skills) {
    const name = text(sk, 'group', lang)
    const item = text(sk, 'name', lang)
    const group = skillGroups.find((g) => g.name === name)
    if (group) group.items.push(item)
    else skillGroups.push({ name, items: [item] })
  }

  return {
    profile: {
      name: text(s, 'name', lang),
      nativeName: otherName,
      headline: text(s, 'headline', lang),
      tagline: text(s, 'tagline', lang),
      status: text(s, 'status', lang),
      bio: paragraphs(text(s, 'bio', lang)),
      contentIntro: text(s, 'content_intro', lang),
      goalsIntro: text(s, 'goals_intro', lang),
      researchInterests: list(s, 'research_interests', lang),
      email: s.email,
      socials: { linkedin: s.linkedin_url, github: s.github_url, instagram: s.instagram_url },
      avatarUrl: s.avatar_url,
      cvUrl: s.cv_url || '/cv.pdf',
      seoTitle: text(s, 'seo_title', lang),
      seoDescription: text(s, 'seo_description', lang),
    },
    skillGroups,
    languages: data.languages.map((l) => ({
      id: l.id,
      name: text(l, 'name', lang),
      native: text(l, 'native', lang),
      level: Math.max(0, Math.min(5, l.level)),
      levelText: text(l, 'level', lang),
    })),
    education: data.education.map((e) => ({
      id: e.id,
      title: text(e, 'title', lang),
      institution: text(e, 'institution', lang),
      field: text(e, 'field', lang),
      description: text(e, 'description', lang),
      period:
        e.start_date || e.end_date
          ? [e.start_date, e.end_date].filter(Boolean).join(' – ')
          : periodTodo,
    })),
    projects: data.projects.map((p) => ({
      id: p.id,
      title: text(p, 'title', lang),
      badge: text(p, 'badge', lang),
      coauthors: text(p, 'coauthors', lang),
      description: text(p, 'description', lang),
      link: p.link,
      imageUrl: p.image_url,
      tags: list(p, 'tags', lang),
    })),
    publications: data.publications.map((p) => ({
      id: p.id,
      title: p.title,
      authors: p.authors,
      venue: text(p, 'venue', lang),
      status: text(p, 'status', lang),
      year: p.year,
      link: p.link,
    })),
    contentWork: data.contentWork.map((c) => ({
      id: c.id,
      title: text(c, 'title', lang),
      description: text(c, 'description', lang),
      link: c.link,
      imageUrl: c.image_url,
    })),
    gallery: data.gallery.map((g) => ({
      id: g.id,
      imageUrl: g.image_url,
      caption: text(g, 'caption', lang),
    })),
  }
}

export type SiteView = ReturnType<typeof localize> & { status: SiteDataStatus; loading: boolean }

/** Editable site content (Supabase, or the static fallback) in the current language. */
export function useSiteContent(): SiteView {
  const { lang, content } = useContent()
  const { status, data } = useSiteData()
  const periodTodo = content.education.periodTodo
  const view = useMemo(() => localize(data, lang, periodTodo), [data, lang, periodTodo])
  return { ...view, status, loading: status === 'loading' }
}
