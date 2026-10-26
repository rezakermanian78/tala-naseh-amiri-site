import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import type { SiteSettingsRow } from '../../lib/types'
import { fetchSettings, saveSettings } from '../api'
import { useDirtyFlag } from '../dirty'
import { errorText, useToast } from '../feedback'
import { useT } from '../i18n'
import { BiTagsField, BiTextField, FormSection, TextField } from '../ui/fields'
import { ImageField, PdfField } from '../ui/Media'

type Settings = Omit<SiteSettingsRow, 'id' | 'updated_at'>

const toSettings = (row: SiteSettingsRow): Settings => {
  const copy: Partial<SiteSettingsRow> = { ...row }
  delete copy.id
  delete copy.updated_at
  return copy as Settings
}

export default function ProfileTab() {
  const t = useT()
  const p = t.profile
  const toast = useToast()
  const [original, setOriginal] = useState<Settings | null>(null)
  const [draft, setDraft] = useState<Settings | null>(null)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)

  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(original)
  useDirtyFlag('profile', dirty)

  const load = useCallback(
    () =>
      fetchSettings().then(
        (row) => {
          const s = toSettings(row)
          setOriginal(s)
          setDraft(s)
          setLoadError('')
        },
        (err: unknown) => setLoadError(errorText(err)),
      ),
    [],
  )

  useEffect(() => {
    void load()
  }, [load])

  if (loadError) {
    return (
      <div role="alert" className="rounded-2xl border border-red-300 p-5">
        <p className="font-semibold text-plum">
          {t.loadFailed}: {loadError}
        </p>
        <button type="button" onClick={() => void load()} className="btn-ghost mt-4">
          {t.retry}
        </button>
      </div>
    )
  }
  if (!draft) {
    return (
      <p className="flex items-center gap-2 text-sm" role="status">
        <Loader2 size={18} aria-hidden="true" className="animate-spin" />
        {t.loading}
      </p>
    )
  }

  const set = (patch: Partial<Settings>) => setDraft((d) => d && { ...d, ...patch })
  const bi = (key: 'name' | 'headline' | 'tagline' | 'status' | 'bio' | 'content_intro' | 'goals_intro' | 'seo_title' | 'seo_description') => ({
    en: draft[`${key}_en`],
    fa: draft[`${key}_fa`],
    onEn: (v: string) => set({ [`${key}_en`]: v }),
    onFa: (v: string) => set({ [`${key}_fa`]: v }),
  })

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft.name_en.trim()) {
      toast('error', `${t.required}: ${p.name}`)
      return
    }
    setSaving(true)
    try {
      const saved = toSettings(await saveSettings(draft))
      setOriginal(saved)
      setDraft(saved)
      toast('success', t.saved)
    } catch (err) {
      toast('error', `${t.saveFailed}: ${errorText(err)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6 pb-24">
      <FormSection title={p.identity}>
        <BiTextField label={p.name} required {...bi('name')} />
        <BiTextField label={p.headline} {...bi('headline')} />
        <BiTextField label={p.tagline} multiline rows={3} {...bi('tagline')} />
        <BiTextField label={p.status} {...bi('status')} />
      </FormSection>

      <FormSection title={p.about}>
        <BiTextField label={p.bio} hint={p.bioHint} multiline rows={10} {...bi('bio')} />
      </FormSection>

      <FormSection title={p.sections}>
        <BiTextField label={p.contentIntro} multiline rows={3} {...bi('content_intro')} />
        <BiTextField label={p.goalsIntro} multiline rows={4} {...bi('goals_intro')} />
        <BiTagsField
          label={p.research}
          en={draft.research_interests_en}
          fa={draft.research_interests_fa}
          onEn={(v) => set({ research_interests_en: v })}
          onFa={(v) => set({ research_interests_fa: v })}
        />
      </FormSection>

      <FormSection title={p.contact}>
        <TextField
          label={p.email}
          type="email"
          dir="ltr"
          value={draft.email}
          onChange={(v) => set({ email: v })}
        />
        {(['linkedin', 'github', 'instagram'] as const).map((k) => (
          <TextField
            key={k}
            label={p[k]}
            hint={p.socialHint}
            type="url"
            dir="ltr"
            placeholder="https://"
            value={draft[`${k}_url`]}
            onChange={(v) => set({ [`${k}_url`]: v })}
          />
        ))}
      </FormSection>

      <FormSection title={p.media}>
        <ImageField
          label={p.avatar}
          hint={p.avatarHint}
          folder="avatar"
          maxSize={800}
          value={draft.avatar_url}
          onChange={(v) => set({ avatar_url: v })}
        />
        <PdfField label={p.cv} value={draft.cv_url} onChange={(v) => set({ cv_url: v })} />
      </FormSection>

      <FormSection title={p.seo}>
        <p className="text-sm">{p.seoHint}</p>
        <BiTextField label={p.seoTitle} recommendedMax={60} {...bi('seo_title')} />
        <BiTextField
          label={p.seoDescription}
          multiline
          rows={3}
          recommendedMax={160}
          {...bi('seo_description')}
        />
      </FormSection>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line/15 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <button type="submit" disabled={saving || !dirty} className="btn-primary disabled:opacity-60">
            {saving && <Loader2 size={16} aria-hidden="true" className="animate-spin" />}
            {saving ? t.saving : t.save}
          </button>
          {dirty && (
            <>
              <button type="button" onClick={() => setDraft(original)} className="btn-ghost">
                {t.cancel}
              </button>
              <span className="text-sm font-medium text-rose-ink" role="status">
                {t.unsavedBadge}
              </span>
            </>
          )}
        </div>
      </div>
    </form>
  )
}
