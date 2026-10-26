// Hand-written to match supabase/migrations/0001_init.sql. Keep the two in sync.
// (Equivalent to the output of `supabase gen types typescript`.)

type Timestamps = { created_at: string; updated_at: string }
type ListMeta = { id: string; sort_order: number; visible: boolean } & Timestamps

export type SiteSettingsRow = {
  id: number
  name_en: string
  name_fa: string
  headline_en: string
  headline_fa: string
  tagline_en: string
  tagline_fa: string
  status_en: string
  status_fa: string
  bio_en: string
  bio_fa: string
  content_intro_en: string
  content_intro_fa: string
  goals_intro_en: string
  goals_intro_fa: string
  research_interests_en: string[]
  research_interests_fa: string[]
  email: string
  linkedin_url: string
  github_url: string
  instagram_url: string
  avatar_url: string
  cv_url: string
  seo_title_en: string
  seo_title_fa: string
  seo_description_en: string
  seo_description_fa: string
  updated_at: string
}

export type SkillRow = ListMeta & {
  group_en: string
  group_fa: string
  name_en: string
  name_fa: string
  level: number | null
}

export type LanguageRow = ListMeta & {
  name_en: string
  name_fa: string
  native_en: string
  native_fa: string
  level: number
  level_en: string
  level_fa: string
}

export type EducationRow = ListMeta & {
  title_en: string
  title_fa: string
  institution_en: string
  institution_fa: string
  field_en: string
  field_fa: string
  start_date: string
  end_date: string
  description_en: string
  description_fa: string
}

export type ProjectRow = ListMeta & {
  title_en: string
  title_fa: string
  badge_en: string
  badge_fa: string
  coauthors_en: string
  coauthors_fa: string
  description_en: string
  description_fa: string
  link: string
  image_url: string
  tags_en: string[]
  tags_fa: string[]
}

export type PublicationRow = ListMeta & {
  title: string
  authors: string
  venue_en: string
  venue_fa: string
  status_en: string
  status_fa: string
  year: string
  link: string
}

export type ContentWorkRow = ListMeta & {
  title_en: string
  title_fa: string
  description_en: string
  description_fa: string
  link: string
  image_url: string
}

export type GalleryRow = ListMeta & {
  image_url: string
  caption_en: string
  caption_fa: string
}

export type MessageRow = {
  id: string
  name: string
  email: string
  message: string
  read: boolean
  ip_hash: string | null
  created_at: string
}

type Generated = 'id' | 'created_at' | 'updated_at'
type Table<Row, Insert = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Partial<Row>
  Relationships: []
}

export type ListRows = {
  skills: SkillRow
  languages: LanguageRow
  education: EducationRow
  projects: ProjectRow
  publications: PublicationRow
  content_work: ContentWorkRow
  gallery: GalleryRow
}
export type ListTable = keyof ListRows
/** A list row without the columns the database fills in. */
export type Draft<T extends ListTable> = Omit<ListRows[T], Generated>

export type Database = {
  public: {
    Tables: {
      site_settings: Table<SiteSettingsRow>
      skills: Table<SkillRow>
      languages: Table<LanguageRow>
      education: Table<EducationRow>
      projects: Table<ProjectRow>
      publications: Table<PublicationRow>
      content_work: Table<ContentWorkRow>
      gallery: Table<GalleryRow>
      messages: Table<MessageRow, Pick<MessageRow, 'name' | 'email' | 'message'>>
    }
    Views: Record<never, never>
    Functions: { is_admin: { Args: Record<never, never>; Returns: boolean } }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
