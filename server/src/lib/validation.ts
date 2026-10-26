import { z } from 'zod'

const text = (max = 5000) => z.string().max(max)
const short = () => text(300)
/** Empty, an http(s) URL, or a site-relative path — never javascript: or data: URLs. */
const link = () =>
  z
    .string()
    .trim()
    .max(2000)
    .refine((v) => v === '' || /^https?:\/\/[^\s]+$/i.test(v) || /^\/(?!\/)[^\s]*$/.test(v), {
      message: 'Must be empty, an http(s) URL or a path starting with /',
    })
const tags = () => z.array(z.string().trim().min(1).max(100)).max(50)
const level = () => z.number().int().min(0).max(5)

const listMeta = { sort_order: z.number().int().min(0).max(1_000_000), visible: z.boolean() }

// Every field is optional (database defaults apply on create); unknown keys are rejected.
const resource = <T extends z.ZodRawShape>(shape: T) => z.object({ ...listMeta, ...shape }).partial().strict()

export const resourceSchemas = {
  skills: resource({
    group_en: short(),
    group_fa: short(),
    name_en: short(),
    name_fa: short(),
    level: level().nullable(),
  }),
  languages: resource({
    name_en: short(),
    name_fa: short(),
    native_en: short(),
    native_fa: short(),
    level: level(),
    level_en: short(),
    level_fa: short(),
  }),
  education: resource({
    title_en: short(),
    title_fa: short(),
    institution_en: short(),
    institution_fa: short(),
    field_en: short(),
    field_fa: short(),
    start_date: text(50),
    end_date: text(50),
    description_en: text(),
    description_fa: text(),
  }),
  projects: resource({
    title_en: text(500),
    title_fa: text(500),
    badge_en: short(),
    badge_fa: short(),
    coauthors_en: text(500),
    coauthors_fa: text(500),
    description_en: text(),
    description_fa: text(),
    link: link(),
    image_url: link(),
    tags_en: tags(),
    tags_fa: tags(),
  }),
  publications: resource({
    title: text(500),
    authors: text(1000),
    venue_en: short(),
    venue_fa: short(),
    status_en: short(),
    status_fa: short(),
    year: text(20),
    link: link(),
  }),
  content_work: resource({
    title_en: short(),
    title_fa: short(),
    description_en: text(),
    description_fa: text(),
    link: link(),
    image_url: link(),
  }),
  gallery: resource({ image_url: link(), caption_en: short(), caption_fa: short() }),
} as const

export const settingsSchema = z
  .object({
    name_en: short(),
    name_fa: short(),
    headline_en: short(),
    headline_fa: short(),
    tagline_en: text(1000),
    tagline_fa: text(1000),
    status_en: short(),
    status_fa: short(),
    bio_en: text(20_000),
    bio_fa: text(20_000),
    content_intro_en: text(),
    content_intro_fa: text(),
    goals_intro_en: text(),
    goals_intro_fa: text(),
    research_interests_en: tags(),
    research_interests_fa: tags(),
    email: z.union([z.literal(''), z.string().trim().max(254).pipe(z.email())]),
    linkedin_url: link(),
    github_url: link(),
    instagram_url: link(),
    avatar_url: link(),
    cv_url: link(),
    seo_title_en: short(),
    seo_title_fa: short(),
    seo_description_en: text(500),
    seo_description_fa: text(500),
  })
  .partial()
  .strict()

export const messageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(254).pipe(z.email()),
  message: z.string().trim().min(1).max(5000),
  /** Honeypot: real people never fill this in. */
  website: z.string().max(500).optional(),
})

export const idParam = z.object({ id: z.uuid() })
export const reorderSchema = z.object({ ids: z.array(z.uuid()).max(1000) }).strict()
export const readSchema = z.object({ read: z.boolean() }).strict()

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254),
  password: z.string().max(200),
})
export const changePasswordSchema = z.object({
  currentPassword: z.string().max(200),
  newPassword: z
    .string()
    .min(12, 'The new password must be at least 12 characters.')
    .max(200),
})
