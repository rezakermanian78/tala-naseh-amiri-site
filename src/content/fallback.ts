// Builds the site data from the static files in src/content. Used when the API is not
// configured or unreachable, and by scripts/gen-seed.ts to produce server/src/db/seed-data.json,
// so the database starts out identical to what the site shows today.
import type {
  ContentWorkRow,
  EducationRow,
  GalleryRow,
  LanguageRow,
  ProjectRow,
  PublicationRow,
  SiteSettingsRow,
  SkillRow,
} from '../lib/types'
import { en } from './en'
import { fa } from './fa'
import { site } from './site'

export type SiteData = {
  settings: SiteSettingsRow
  skills: SkillRow[]
  languages: LanguageRow[]
  education: EducationRow[]
  projects: ProjectRow[]
  publications: PublicationRow[]
  contentWork: ContentWorkRow[]
  gallery: GalleryRow[]
}

const meta = (prefix: string, i: number) => ({
  id: `${prefix}-${i}`,
  sort_order: (i + 1) * 10,
  visible: true,
  created_at: '',
  updated_at: '',
})

export const seo = {
  titleEn: 'Tala Naseh Amiri — Electrical Engineer · Aspiring AI Researcher',
  titleFa: 'طلا ناصح امیری — مهندس برق · پژوهشگر آینده‌دار هوش مصنوعی',
  descriptionEn:
    "Tala Naseh Amiri, electrical engineering (Power Systems) graduate of the University of Tabriz, pursuing a Master's degree in Artificial Intelligence, and a professional Instagram content creator.",
  descriptionFa:
    'طلا ناصح امیری، فارغ‌التحصیل مهندسی برق (گرایش قدرت) از دانشگاه تبریز، در مسیر کارشناسی ارشد هوش مصنوعی و تولیدکننده حرفه‌ای محتوا در اینستاگرام.',
}

const settings: SiteSettingsRow = {
  id: 1,
  name_en: en.hero.name,
  name_fa: fa.hero.name,
  headline_en: en.hero.title,
  headline_fa: fa.hero.title,
  tagline_en: en.hero.tagline,
  tagline_fa: fa.hero.tagline,
  status_en: en.hero.status,
  status_fa: fa.hero.status,
  bio_en: en.about.paragraphs.join('\n\n'),
  bio_fa: fa.about.paragraphs.join('\n\n'),
  content_intro_en: en.contentCreation.intro,
  content_intro_fa: fa.contentCreation.intro,
  goals_intro_en: en.goals.intro,
  goals_intro_fa: fa.goals.intro,
  research_interests_en: [...en.goals.areas],
  research_interests_fa: [...fa.goals.areas],
  email: site.email,
  linkedin_url: site.socials.linkedin,
  github_url: site.socials.github,
  instagram_url: site.socials.instagram,
  avatar_url: '',
  cv_url: site.cvPath,
  seo_title_en: seo.titleEn,
  seo_title_fa: seo.titleFa,
  seo_description_en: seo.descriptionEn,
  seo_description_fa: seo.descriptionFa,
  updated_at: '',
}

const skills: SkillRow[] = en.skills.groups.flatMap((g, gi) =>
  g.items.map((name, ii) => ({ g, gi, name, ii })),
).map(({ g, gi, name, ii }, i) => ({
  ...meta('skill', i),
  group_en: g.name,
  group_fa: fa.skills.groups[gi].name,
  name_en: name,
  name_fa: fa.skills.groups[gi].items[ii],
  level: null,
}))

const languages: LanguageRow[] = en.languages.items.map((l, i) => ({
  ...meta('language', i),
  name_en: l.name,
  name_fa: fa.languages.items[i].name,
  native_en: l.native,
  native_fa: fa.languages.items[i].native,
  level: l.level,
  level_en: l.levelText,
  level_fa: fa.languages.items[i].levelText,
}))

const education: EducationRow[] = en.education.items.map((e, i) => ({
  ...meta('education', i),
  title_en: e.degree,
  title_fa: fa.education.items[i].degree,
  institution_en: e.school,
  institution_fa: fa.education.items[i].school,
  field_en: e.details,
  field_fa: fa.education.items[i].details,
  start_date: '',
  end_date: '',
  description_en: '',
  description_fa: '',
}))

const projects: ProjectRow[] = en.projects.items.map((p, i) => ({
  ...meta('project', i),
  title_en: p.title,
  title_fa: fa.projects.items[i].title,
  badge_en: p.badge,
  badge_fa: fa.projects.items[i].badge,
  coauthors_en: p.coauthors,
  coauthors_fa: fa.projects.items[i].coauthors,
  description_en: p.description,
  description_fa: fa.projects.items[i].description,
  link: p.href,
  image_url: '',
  tags_en: [...p.tags],
  tags_fa: [...fa.projects.items[i].tags],
}))

const contentWork: ContentWorkRow[] = en.contentCreation.cards.map((c, i) => ({
  ...meta('content', i),
  title_en: c.title,
  title_fa: fa.contentCreation.cards[i].title,
  description_en: c.description,
  description_fa: fa.contentCreation.cards[i].description,
  link: '',
  image_url: '',
}))

const gallery: GalleryRow[] = site.featuredWork.map((w, i) => ({
  ...meta('gallery', i),
  image_url: w.src,
  caption_en: w.alt,
  caption_fa: w.alt,
}))

export const fallbackData: SiteData = {
  settings,
  skills,
  languages,
  education,
  projects,
  publications: [],
  contentWork,
  gallery,
}
