import { Briefcase, Camera, Code, Mail, Send } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import * as z from 'zod/mini'
import { useContent } from '../hooks/useContent'
import { useSiteContent } from '../hooks/useSiteContent'
import { getPublicDb, supabaseConfigured } from '../lib/supabase'
import Card from './Card'
import Magnetic from './Magnetic'
import Reveal from './Reveal'
import Section from './Section'

type Status = 'idle' | 'sending' | 'success' | 'error' | 'rateLimited'
type FieldName = 'name' | 'email' | 'message'

const socialIcons = { linkedin: Briefcase, github: Code, instagram: Camera } as const

const field =
  'mt-1.5 min-h-12 w-full rounded-xl border border-line/30 bg-canvas px-4 py-3 text-base text-plum transition-shadow placeholder:text-muted/70 focus:border-rose aria-[invalid=true]:border-rose-ink'

// Mirrors the CHECK constraints on public.messages. (zod/mini keeps this chunk small.)
// Values are trimmed before parsing.
const schema = z.object({
  name: z.string().check(z.minLength(1), z.maxLength(120)),
  email: z.email().check(z.maxLength(254)),
  message: z.string().check(z.minLength(1), z.maxLength(5000)),
})

const value = (data: FormData, key: string) => String(data.get(key) ?? '').trim()

// Client-side throttle (the database enforces its own limit too).
const SENT_KEY = 'contact-sent'
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 3

function recentSends(): number[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(SENT_KEY) ?? '[]')
    const now = Date.now()
    return Array.isArray(raw)
      ? raw.filter((t): t is number => typeof t === 'number' && now - t < WINDOW_MS)
      : []
  } catch {
    return []
  }
}

function rememberSend() {
  try {
    localStorage.setItem(SENT_KEY, JSON.stringify([...recentSends(), Date.now()]))
  } catch {
    /* storage unavailable */
  }
}

export default function Contact() {
  const { contact } = useContent().content
  const { profile } = useSiteContent()
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [mountedAt] = useState(() => Date.now())
  const formRef = useRef<HTMLFormElement>(null)

  const messages: Record<FieldName, string> = {
    name: contact.form.invalidName,
    email: contact.form.invalidEmail,
    message: contact.form.invalidMessage,
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const parsed = schema.safeParse({
      name: value(data, 'name'),
      email: value(data, 'email'),
      message: value(data, 'message'),
    })
    if (!parsed.success) {
      const next: Partial<Record<FieldName, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (key === 'name' || key === 'email' || key === 'message') next[key] = messages[key]
      }
      setErrors(next)
      setStatus('idle')
      const first = (['name', 'email', 'message'] as const).find((k) => next[k])
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setErrors({})

    // Honeypot filled in, or submitted faster than a person can type: quietly "succeed".
    if (String(data.get('website') ?? '') !== '' || Date.now() - mountedAt < 2000) {
      form.reset()
      setStatus('success')
      return
    }

    if (!supabaseConfigured) {
      const { name, email, message } = parsed.data
      const body = `${message}\n\n— ${name} (${email})`
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(contact.form.mailtoSubject)}&body=${encodeURIComponent(body)}`
      return
    }

    if (recentSends().length >= MAX_PER_WINDOW) {
      setStatus('rateLimited')
      return
    }

    setStatus('sending')
    try {
      const db = await getPublicDb()
      const { error } = await db.from('messages').insert(parsed.data)
      if (error) {
        setStatus(error.message.includes('rate_limited') ? 'rateLimited' : 'error')
        return
      }
      rememberSend()
      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const socials = (['linkedin', 'github', 'instagram'] as const).map((key) => ({
    key,
    label: contact[key],
    href: profile.socials[key],
    Icon: socialIcons[key],
  }))

  const describedBy = (k: FieldName) => (errors[k] ? `contact-${k}-error` : undefined)
  const errorText = (k: FieldName) =>
    errors[k] && (
      <span id={`contact-${k}-error`} className="mt-1 block text-sm font-medium text-rose-ink">
        {errors[k]}
      </span>
    )

  return (
    <Section id="contact" eyebrow={contact.eyebrow} title={contact.title} tone="plum">
      <div className="grid gap-10 md:grid-cols-2">
        <Reveal>
          <p className="text-base leading-relaxed sm:text-lg">{contact.intro}</p>
          <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-rose-ink">
            {contact.channelsTitle}
          </h3>
          <ul className="mt-4 space-y-1">
            <li className="flex min-h-11 items-center gap-3">
              <Mail size={20} aria-hidden="true" className="text-rose-ink" />
              {profile.email ? (
                <a href={`mailto:${profile.email}`} className="link-underline font-medium text-plum">
                  {profile.email}
                </a>
              ) : (
                <span>
                  {contact.email}: {contact.todoLink}
                </span>
              )}
            </li>
            {socials.map(({ key, label, href, Icon }) => (
              <li key={key} className="flex min-h-11 items-center gap-3">
                <Icon size={20} aria-hidden="true" className="text-rose-ink" />
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline font-medium text-plum"
                  >
                    {label}
                  </a>
                ) : (
                  <span>
                    {label}: {contact.todoLink}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Reveal>

        <Card delay={0.1}>
          <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-4">
            <label className="block text-sm font-semibold text-plum">
              {contact.form.name}
              <input
                name="name"
                type="text"
                required
                maxLength={120}
                autoComplete="name"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={describedBy('name')}
                className={field}
              />
              {errorText('name')}
            </label>
            <label className="block text-sm font-semibold text-plum">
              {contact.form.email}
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                dir="ltr"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={describedBy('email')}
                className={`${field} rtl:text-right`}
              />
              {errorText('email')}
            </label>
            <label className="block text-sm font-semibold text-plum">
              {contact.form.message}
              <textarea
                name="message"
                required
                rows={5}
                maxLength={5000}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={describedBy('message')}
                className={field}
              />
              {errorText('message')}
            </label>
            {/* Honeypot: invisible to people, tempting to bots. */}
            <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
              <label>
                Website
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <Magnetic>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-primary disabled:opacity-60"
              >
                <Send size={18} aria-hidden="true" className="rtl:-scale-x-100" />
                {status === 'sending' ? contact.form.sending : contact.form.send}
              </button>
            </Magnetic>
            <p role="status" aria-live="polite" className="min-h-6 font-medium text-rose-ink">
              {status === 'success' && contact.form.success}
              {status === 'error' && contact.form.error}
              {status === 'rateLimited' && contact.form.rateLimited}
            </p>
          </form>
        </Card>
      </div>
    </Section>
  )
}
