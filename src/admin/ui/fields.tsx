import { X } from 'lucide-react'
import { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useT } from '../i18n'

export const inputClass =
  'mt-1.5 block min-h-11 w-full rounded-xl border border-line/30 bg-canvas px-3.5 py-2.5 text-base text-plum placeholder:text-muted/60 focus:border-rose aria-[invalid=true]:border-red-500'

const labelClass = 'block text-sm font-semibold text-plum'
const hintClass = 'mt-1 block text-xs text-muted'

type Common = {
  label: string
  hint?: string
  required?: boolean
  invalid?: boolean
}

function LabelText({ label, required }: { label: string; required?: boolean }) {
  return (
    <>
      {label}
      {required && (
        <span aria-hidden="true" className="text-rose-ink">
          {' '}
          *
        </span>
      )}
    </>
  )
}

function CharCount({ value, max }: { value: string; max?: number }) {
  const t = useT()
  if (!max) return null
  const over = value.length > max
  return (
    <span className={`${hintClass} ${over ? 'font-semibold text-red-600' : ''}`}>
      {value.length} / {max} {t.profile.chars}
    </span>
  )
}

type TextProps = Common & {
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'url' | 'email'
  dir?: 'ltr' | 'rtl' | 'auto'
  lang?: string
  multiline?: boolean
  rows?: number
  placeholder?: string
  list?: string
  /** Soft limit: shows a counter, doesn't block typing. */
  recommendedMax?: number
}

export function TextField({
  label,
  hint,
  required,
  invalid,
  value,
  onChange,
  type = 'text',
  dir,
  lang,
  multiline,
  rows = 4,
  placeholder,
  list,
  recommendedMax,
}: TextProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const shared = {
    id,
    value,
    dir,
    lang,
    placeholder,
    required,
    'aria-invalid': invalid || undefined,
    'aria-describedby': hintId,
    className: `${inputClass} ${dir === 'ltr' ? 'text-left' : ''}`,
  }
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        <LabelText label={label} required={required} />
      </label>
      {multiline ? (
        <textarea {...shared} rows={rows} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input
          {...shared}
          type={type}
          list={list}
          inputMode={type === 'url' ? 'url' : type === 'email' ? 'email' : undefined}
          autoCapitalize={type === 'text' ? undefined : 'none'}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && (
        <span id={hintId} className={hintClass}>
          {hint}
        </span>
      )}
      <CharCount value={value} max={recommendedMax} />
    </div>
  )
}

type BiProps = Common & {
  en: string
  fa: string
  onEn: (v: string) => void
  onFa: (v: string) => void
  multiline?: boolean
  rows?: number
  list?: { en: string; fa: string }
  recommendedMax?: number
}

/** English and Persian versions of one field, side by side (stacked on phones). */
export function BiTextField({
  label,
  hint,
  required,
  invalid,
  en,
  fa,
  onEn,
  onFa,
  multiline,
  rows,
  list,
  recommendedMax,
}: BiProps) {
  const t = useT()
  const id = useId()
  return (
    <fieldset aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend className={labelClass}>
        <LabelText label={label} required={required} />
      </legend>
      {hint && (
        <span id={`${id}-hint`} className={hintClass}>
          {hint}
        </span>
      )}
      <div className="mt-1 grid gap-3 sm:grid-cols-2">
        <SubField>
          <TextField
            label={t.english}
            value={en}
            onChange={onEn}
            dir="ltr"
            lang="en"
            multiline={multiline}
            rows={rows}
            invalid={invalid && !en.trim()}
            required={required}
            list={list?.en}
            recommendedMax={recommendedMax}
          />
        </SubField>
        <SubField>
          <TextField
            label={t.persian}
            value={fa}
            onChange={onFa}
            dir="rtl"
            lang="fa"
            multiline={multiline}
            rows={rows}
            list={list?.fa}
            recommendedMax={recommendedMax}
          />
        </SubField>
      </div>
    </fieldset>
  )
}

// Visually lighter label for the EN/FA halves of a bilingual field.
function SubField({ children }: { children: ReactNode }) {
  return <div className="[&>div>label]:text-xs [&>div>label]:font-medium [&>div>label]:text-muted">{children}</div>
}

type TagsProps = {
  label: string
  value: string[]
  onChange: (v: string[]) => void
  dir: 'ltr' | 'rtl'
  lang: string
}

export function TagsField({ label, value, onChange, dir, lang }: TagsProps) {
  const t = useT()
  const id = useId()
  const [text, setText] = useState('')

  const commit = (raw: string) => {
    const parts = raw
      .split(/[,،\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))])
    setText('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(text)
    } else if (e.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div dir={dir} lang={lang}>
      <label htmlFor={id} className="block text-xs font-medium text-muted">
        {label}
      </label>
      <div className={`${inputClass} flex flex-wrap items-center gap-1.5 focus-within:border-rose`}>
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-blush-deep py-1 pe-1 ps-3 text-sm text-plum"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, n) => n !== i))}
              aria-label={`${t.removeTag}: ${tag}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-rose/15"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          onChange={(e) => {
            const v = e.target.value
            if (/[,،]/.test(v)) commit(v)
            else setText(v)
          }}
          onKeyDown={onKeyDown}
          onBlur={() => text && commit(text)}
          aria-describedby={`${id}-hint`}
          className="min-w-[8rem] flex-1 bg-transparent py-1 outline-none focus-visible:ring-0"
          enterKeyHint="enter"
        />
      </div>
      <span id={`${id}-hint`} className={hintClass}>
        {t.tagsHint}
      </span>
    </div>
  )
}

export function BiTagsField({
  label,
  en,
  fa,
  onEn,
  onFa,
}: {
  label: string
  en: string[]
  fa: string[]
  onEn: (v: string[]) => void
  onFa: (v: string[]) => void
}) {
  const t = useT()
  return (
    <fieldset>
      <legend className={labelClass}>{label}</legend>
      <div className="mt-1 grid gap-3 sm:grid-cols-2">
        <TagsField label={t.english} value={en} onChange={onEn} dir="ltr" lang="en" />
        <TagsField label={t.persian} value={fa} onChange={onFa} dir="rtl" lang="fa" />
      </div>
    </fieldset>
  )
}

export function LevelField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const name = useId()
  return (
    <fieldset>
      <legend className={labelClass}>{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border text-base font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rose-ink ${
              value === n
                ? 'border-rose bg-rose text-white'
                : 'border-line/30 bg-canvas text-plum hover:border-rose'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="sr-only"
            />
            {n}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** A titled group of fields (Profile tab). */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line/15 bg-surface p-4 shadow-soft sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  )
}
