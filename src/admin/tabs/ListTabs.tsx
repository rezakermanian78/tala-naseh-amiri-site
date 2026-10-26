import { useId } from 'react'
import type { Draft } from '../../lib/database.types'
import { useT } from '../i18n'
import { BiTagsField, BiTextField, LevelField, TextField } from '../ui/fields'
import ListEditor from '../ui/ListEditor'
import { ImageField } from '../ui/Media'

const base = { sort_order: 0, visible: true }
const filled = (s: string) => s.trim().length > 0
const pickTitle = (en: string, fa: string) => en || fa

export function SkillsTab() {
  const t = useT()
  const listId = useId()
  return (
    <ListEditor
      table="skills"
      intro={t.skills.intro}
      addLabel={t.skills.add}
      empty={(): Draft<'skills'> => ({
        ...base,
        group_en: '',
        group_fa: '',
        name_en: '',
        name_fa: '',
        level: null,
      })}
      summary={(r) => ({
        title: pickTitle(r.name_en, r.name_fa),
        subtitle: pickTitle(r.group_en, r.group_fa),
      })}
      isValid={(d) => filled(d.name_en) && filled(d.group_en)}
      form={(d, set, showErrors) => (
        <>
          <BiTextField
            label={t.skills.group}
            hint={t.skills.groupHint}
            required
            invalid={showErrors}
            en={d.group_en}
            fa={d.group_fa}
            onEn={(v) => set({ group_en: v })}
            onFa={(v) => set({ group_fa: v })}
            list={{ en: `${listId}-en`, fa: `${listId}-fa` }}
          />
          <GroupSuggestions id={listId} />
          <BiTextField
            label={t.skills.name}
            required
            invalid={showErrors}
            en={d.name_en}
            fa={d.name_fa}
            onEn={(v) => set({ name_en: v })}
            onFa={(v) => set({ name_fa: v })}
          />
        </>
      )}
    />
  )
}

// The groups that exist on the live site today, as typing suggestions.
function GroupSuggestions({ id }: { id: string }) {
  const en = ['Engineering', 'Programming & AI', 'Content & Creative', 'Tools']
  const fa = ['مهندسی', 'برنامه‌نویسی و هوش مصنوعی', 'محتوا و خلاقیت', 'ابزارها']
  return (
    <>
      <datalist id={`${id}-en`}>
        {en.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>
      <datalist id={`${id}-fa`}>
        {fa.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>
    </>
  )
}

export function LanguagesTab() {
  const t = useT()
  return (
    <ListEditor
      table="languages"
      addLabel={t.languages.add}
      empty={(): Draft<'languages'> => ({
        ...base,
        name_en: '',
        name_fa: '',
        native_en: '',
        native_fa: '',
        level: 3,
        level_en: '',
        level_fa: '',
      })}
      summary={(r) => ({
        title: pickTitle(r.name_en, r.name_fa),
        subtitle: `${'●'.repeat(r.level)}${'○'.repeat(5 - r.level)}  ${pickTitle(r.level_en, r.level_fa)}`,
      })}
      isValid={(d) => filled(d.name_en)}
      form={(d, set, showErrors) => (
        <>
          <BiTextField
            label={t.languages.name}
            required
            invalid={showErrors}
            en={d.name_en}
            fa={d.name_fa}
            onEn={(v) => set({ name_en: v })}
            onFa={(v) => set({ name_fa: v })}
          />
          <BiTextField
            label={t.languages.native}
            en={d.native_en}
            fa={d.native_fa}
            onEn={(v) => set({ native_en: v })}
            onFa={(v) => set({ native_fa: v })}
          />
          <LevelField
            label={t.languages.level}
            value={d.level}
            onChange={(v) => set({ level: v })}
          />
          <BiTextField
            label={t.languages.levelText}
            en={d.level_en}
            fa={d.level_fa}
            onEn={(v) => set({ level_en: v })}
            onFa={(v) => set({ level_fa: v })}
          />
        </>
      )}
    />
  )
}

export function EducationTab() {
  const t = useT()
  return (
    <ListEditor
      table="education"
      addLabel={t.education.add}
      empty={(): Draft<'education'> => ({
        ...base,
        title_en: '',
        title_fa: '',
        institution_en: '',
        institution_fa: '',
        field_en: '',
        field_fa: '',
        start_date: '',
        end_date: '',
        description_en: '',
        description_fa: '',
      })}
      summary={(r) => ({
        title: pickTitle(r.title_en, r.title_fa),
        subtitle: [pickTitle(r.institution_en, r.institution_fa), [r.start_date, r.end_date].filter(Boolean).join(' – ')]
          .filter(Boolean)
          .join(' · '),
      })}
      isValid={(d) => filled(d.title_en)}
      form={(d, set, showErrors) => (
        <>
          <BiTextField
            label={t.education.title}
            required
            invalid={showErrors}
            en={d.title_en}
            fa={d.title_fa}
            onEn={(v) => set({ title_en: v })}
            onFa={(v) => set({ title_fa: v })}
          />
          <BiTextField
            label={t.education.institution}
            en={d.institution_en}
            fa={d.institution_fa}
            onEn={(v) => set({ institution_en: v })}
            onFa={(v) => set({ institution_fa: v })}
          />
          <BiTextField
            label={t.education.field}
            en={d.field_en}
            fa={d.field_fa}
            onEn={(v) => set({ field_en: v })}
            onFa={(v) => set({ field_fa: v })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label={t.education.start}
              hint={t.education.datesHint}
              value={d.start_date}
              onChange={(v) => set({ start_date: v })}
              dir="auto"
            />
            <TextField
              label={t.education.end}
              value={d.end_date}
              onChange={(v) => set({ end_date: v })}
              dir="auto"
            />
          </div>
          <BiTextField
            label={`${t.education.description} (${t.optional})`}
            multiline
            rows={3}
            en={d.description_en}
            fa={d.description_fa}
            onEn={(v) => set({ description_en: v })}
            onFa={(v) => set({ description_fa: v })}
          />
        </>
      )}
    />
  )
}

export function ProjectsTab() {
  const t = useT()
  return (
    <ListEditor
      table="projects"
      addLabel={t.projects.add}
      empty={(): Draft<'projects'> => ({
        ...base,
        title_en: '',
        title_fa: '',
        badge_en: '',
        badge_fa: '',
        coauthors_en: '',
        coauthors_fa: '',
        description_en: '',
        description_fa: '',
        link: '',
        image_url: '',
        tags_en: [],
        tags_fa: [],
      })}
      summary={(r) => ({
        title: pickTitle(r.title_en, r.title_fa),
        subtitle: pickTitle(r.badge_en, r.badge_fa),
        image: r.image_url,
      })}
      imageOf={(r) => r.image_url}
      isValid={(d) => filled(d.title_en)}
      form={(d, set, showErrors) => (
        <>
          <BiTextField
            label={t.projects.title}
            required
            invalid={showErrors}
            multiline
            rows={2}
            en={d.title_en}
            fa={d.title_fa}
            onEn={(v) => set({ title_en: v })}
            onFa={(v) => set({ title_fa: v })}
          />
          <BiTextField
            label={t.projects.badge}
            en={d.badge_en}
            fa={d.badge_fa}
            onEn={(v) => set({ badge_en: v })}
            onFa={(v) => set({ badge_fa: v })}
          />
          <BiTextField
            label={t.projects.coauthors}
            en={d.coauthors_en}
            fa={d.coauthors_fa}
            onEn={(v) => set({ coauthors_en: v })}
            onFa={(v) => set({ coauthors_fa: v })}
          />
          <BiTextField
            label={t.projects.description}
            multiline
            rows={5}
            en={d.description_en}
            fa={d.description_fa}
            onEn={(v) => set({ description_en: v })}
            onFa={(v) => set({ description_fa: v })}
          />
          <BiTagsField
            label={t.projects.tags}
            en={d.tags_en}
            fa={d.tags_fa}
            onEn={(v) => set({ tags_en: v })}
            onFa={(v) => set({ tags_fa: v })}
          />
          <TextField
            label={`${t.projects.link} (${t.optional})`}
            type="url"
            dir="ltr"
            placeholder="https://"
            value={d.link}
            onChange={(v) => set({ link: v })}
          />
          <ImageField
            label={`${t.projects.image} (${t.optional})`}
            folder="projects"
            value={d.image_url}
            onChange={(v) => set({ image_url: v })}
          />
        </>
      )}
    />
  )
}

export function PublicationsTab() {
  const t = useT()
  return (
    <ListEditor
      table="publications"
      intro={t.publications.intro}
      addLabel={t.publications.add}
      empty={(): Draft<'publications'> => ({
        ...base,
        title: '',
        authors: '',
        venue_en: '',
        venue_fa: '',
        status_en: '',
        status_fa: '',
        year: '',
        link: '',
      })}
      summary={(r) => ({
        title: r.title,
        subtitle: [pickTitle(r.venue_en, r.venue_fa), r.year].filter(Boolean).join(' · '),
      })}
      isValid={(d) => filled(d.title)}
      form={(d, set, showErrors) => (
        <>
          <TextField
            label={t.publications.title}
            required
            invalid={showErrors && !filled(d.title)}
            multiline
            rows={2}
            dir="auto"
            value={d.title}
            onChange={(v) => set({ title: v })}
          />
          <TextField
            label={t.publications.authors}
            dir="auto"
            value={d.authors}
            onChange={(v) => set({ authors: v })}
          />
          <BiTextField
            label={t.publications.venue}
            en={d.venue_en}
            fa={d.venue_fa}
            onEn={(v) => set({ venue_en: v })}
            onFa={(v) => set({ venue_fa: v })}
          />
          <BiTextField
            label={t.publications.status}
            en={d.status_en}
            fa={d.status_fa}
            onEn={(v) => set({ status_en: v })}
            onFa={(v) => set({ status_fa: v })}
          />
          <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <TextField
              label={t.publications.year}
              dir="ltr"
              value={d.year}
              onChange={(v) => set({ year: v })}
            />
            <TextField
              label={`${t.publications.link} (${t.optional})`}
              type="url"
              dir="ltr"
              placeholder="https://"
              value={d.link}
              onChange={(v) => set({ link: v })}
            />
          </div>
        </>
      )}
    />
  )
}

export function ContentTab() {
  const t = useT()
  return (
    <ListEditor
      table="content_work"
      intro={t.content.intro}
      addLabel={t.content.add}
      empty={(): Draft<'content_work'> => ({
        ...base,
        title_en: '',
        title_fa: '',
        description_en: '',
        description_fa: '',
        link: '',
        image_url: '',
      })}
      summary={(r) => ({
        title: pickTitle(r.title_en, r.title_fa),
        subtitle: pickTitle(r.description_en, r.description_fa),
        image: r.image_url,
      })}
      imageOf={(r) => r.image_url}
      isValid={(d) => filled(d.title_en)}
      form={(d, set, showErrors) => (
        <>
          <BiTextField
            label={t.content.title}
            required
            invalid={showErrors}
            en={d.title_en}
            fa={d.title_fa}
            onEn={(v) => set({ title_en: v })}
            onFa={(v) => set({ title_fa: v })}
          />
          <BiTextField
            label={t.content.description}
            multiline
            rows={3}
            en={d.description_en}
            fa={d.description_fa}
            onEn={(v) => set({ description_en: v })}
            onFa={(v) => set({ description_fa: v })}
          />
          <TextField
            label={`${t.content.link} (${t.optional})`}
            type="url"
            dir="ltr"
            placeholder="https://www.instagram.com/p/…"
            value={d.link}
            onChange={(v) => set({ link: v })}
          />
          <ImageField
            label={`${t.content.image} (${t.optional})`}
            folder="content"
            value={d.image_url}
            onChange={(v) => set({ image_url: v })}
          />
        </>
      )}
    />
  )
}

export function GalleryTab() {
  const t = useT()
  return (
    <ListEditor
      table="gallery"
      intro={t.gallery.intro}
      addLabel={t.gallery.add}
      empty={(): Draft<'gallery'> => ({ ...base, image_url: '', caption_en: '', caption_fa: '' })}
      summary={(r) => ({
        title: pickTitle(r.caption_en, r.caption_fa) || t.gallery.image,
        image: r.image_url,
      })}
      imageOf={(r) => r.image_url}
      isValid={(d) => filled(d.image_url)}
      form={(d, set, showErrors) => (
        <>
          <ImageField
            label={t.gallery.image}
            hint={showErrors && !d.image_url ? t.gallery.imageRequired : undefined}
            required
            invalid={showErrors}
            folder="gallery"
            maxSize={1400}
            value={d.image_url}
            onChange={(v) => set({ image_url: v })}
          />
          <BiTextField
            label={t.gallery.caption}
            en={d.caption_en}
            fa={d.caption_fa}
            onEn={(v) => set({ caption_en: v })}
            onFa={(v) => set({ caption_fa: v })}
          />
        </>
      )}
    />
  )
}
