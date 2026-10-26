// Port of the original supabase/migrations/0001_init.sql. Property names match the column
// names (snake_case) so the JSON the API returns is exactly what the frontend already expects.
import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: 'string' }).notNull().defaultNow()
const str = (name: string) => text(name).notNull().default('')
const strArray = (name: string) => text(name).array().notNull().default(sql`'{}'::text[]`)

// Shared by every list section.
const listMeta = {
  id: uuid('id').primaryKey().defaultRandom(),
  sort_order: integer('sort_order').notNull().default(0),
  visible: boolean('visible').notNull().default(true),
  created_at: ts('created_at'),
  updated_at: ts('updated_at'),
}

// ── Profile & SEO (exactly one row, id = 1) ──
export const siteSettings = pgTable(
  'site_settings',
  {
    id: smallint('id').primaryKey().default(1),
    name_en: str('name_en'),
    name_fa: str('name_fa'),
    headline_en: str('headline_en'),
    headline_fa: str('headline_fa'),
    tagline_en: str('tagline_en'),
    tagline_fa: str('tagline_fa'),
    status_en: str('status_en'),
    status_fa: str('status_fa'),
    // About section; paragraphs are separated by a blank line.
    bio_en: str('bio_en'),
    bio_fa: str('bio_fa'),
    content_intro_en: str('content_intro_en'),
    content_intro_fa: str('content_intro_fa'),
    goals_intro_en: str('goals_intro_en'),
    goals_intro_fa: str('goals_intro_fa'),
    research_interests_en: strArray('research_interests_en'),
    research_interests_fa: strArray('research_interests_fa'),
    email: str('email'),
    linkedin_url: str('linkedin_url'),
    github_url: str('github_url'),
    instagram_url: str('instagram_url'),
    avatar_url: str('avatar_url'),
    cv_url: str('cv_url'),
    seo_title_en: str('seo_title_en'),
    seo_title_fa: str('seo_title_fa'),
    seo_description_en: str('seo_description_en'),
    seo_description_fa: str('seo_description_fa'),
    updated_at: ts('updated_at'),
  },
  (t) => [check('site_settings_singleton', sql`${t.id} = 1`)],
)

// ── List sections ──
export const skills = pgTable(
  'skills',
  {
    ...listMeta,
    group_en: str('group_en'),
    group_fa: str('group_fa'),
    name_en: str('name_en'),
    name_fa: str('name_fa'),
    level: smallint('level'),
  },
  (t) => [check('skills_level', sql`${t.level} between 0 and 5`)],
)

export const languages = pgTable(
  'languages',
  {
    ...listMeta,
    name_en: str('name_en'),
    name_fa: str('name_fa'),
    // Shown next to the name, e.g. the language's own name ("Deutsch").
    native_en: str('native_en'),
    native_fa: str('native_fa'),
    level: smallint('level').notNull().default(3),
    level_en: str('level_en'),
    level_fa: str('level_fa'),
  },
  (t) => [check('languages_level', sql`${t.level} between 0 and 5`)],
)

export const education = pgTable('education', {
  ...listMeta,
  title_en: str('title_en'),
  title_fa: str('title_fa'),
  institution_en: str('institution_en'),
  institution_fa: str('institution_fa'),
  field_en: str('field_en'),
  field_fa: str('field_fa'),
  // Free text so "2019", "Sep 2019" or "Present" all work.
  start_date: str('start_date'),
  end_date: str('end_date'),
  description_en: str('description_en'),
  description_fa: str('description_fa'),
})

export const projects = pgTable('projects', {
  ...listMeta,
  title_en: str('title_en'),
  title_fa: str('title_fa'),
  badge_en: str('badge_en'),
  badge_fa: str('badge_fa'),
  coauthors_en: str('coauthors_en'),
  coauthors_fa: str('coauthors_fa'),
  description_en: str('description_en'),
  description_fa: str('description_fa'),
  link: str('link'),
  image_url: str('image_url'),
  tags_en: strArray('tags_en'),
  tags_fa: strArray('tags_fa'),
})

export const publications = pgTable('publications', {
  ...listMeta,
  title: str('title'),
  authors: str('authors'),
  venue_en: str('venue_en'),
  venue_fa: str('venue_fa'),
  status_en: str('status_en'),
  status_fa: str('status_fa'),
  year: str('year'),
  link: str('link'),
})

export const contentWork = pgTable('content_work', {
  ...listMeta,
  title_en: str('title_en'),
  title_fa: str('title_fa'),
  description_en: str('description_en'),
  description_fa: str('description_fa'),
  link: str('link'),
  image_url: str('image_url'),
})

export const gallery = pgTable('gallery', {
  ...listMeta,
  image_url: str('image_url'),
  caption_en: str('caption_en'),
  caption_fa: str('caption_fa'),
})

// ── Contact messages ──
export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    message: text('message').notNull(),
    read: boolean('read').notNull().default(false),
    created_at: ts('created_at'),
  },
  (t) => [
    check('messages_name_len', sql`char_length(${t.name}) between 1 and 120`),
    check('messages_email_len', sql`char_length(${t.email}) between 3 and 254`),
    check('messages_message_len', sql`char_length(${t.message}) between 1 and 5000`),
    index('messages_created_at_idx').on(t.created_at.desc()),
  ],
)

// ── The single admin account ──
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  // Bumped on password change: every session issued before then stops working.
  token_version: integer('token_version').notNull().default(1),
  created_at: ts('created_at'),
  updated_at: ts('updated_at'),
})

export const listTables = {
  skills,
  languages,
  education,
  projects,
  publications,
  content_work: contentWork,
  gallery,
} as const
export type ListResource = keyof typeof listTables
