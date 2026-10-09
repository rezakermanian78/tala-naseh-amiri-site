import { Briefcase, Camera, Code, Mail, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { site, type SocialKey } from '../content/site'
import { useContent } from '../hooks/useContent'
import Reveal from './Reveal'
import Section from './Section'

type Status = 'idle' | 'sending' | 'success' | 'error'

const socialIcons = { linkedin: Briefcase, github: Code, instagram: Camera } as const

const field =
  'mt-1 w-full rounded-xl border border-line/30 bg-canvas px-4 py-3 text-plum placeholder:text-muted/70'

export default function Contact() {
  const { contact } = useContent().content
  const [status, setStatus] = useState<Status>('idle')

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    if (!site.formspreeId) {
      const body = `${String(data.get('message'))}\n\n— ${String(data.get('name'))} (${String(data.get('email'))})`
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(contact.form.mailtoSubject)}&body=${encodeURIComponent(body)}`
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${site.formspreeId}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const socials = (Object.keys(site.socials) as SocialKey[]).map((key) => ({
    key,
    label: contact[key],
    href: site.socials[key],
    Icon: socialIcons[key],
  }))

  return (
    <Section id="contact" eyebrow={contact.eyebrow} title={contact.title}>
      <div className="grid gap-10 md:grid-cols-2">
        <Reveal>
          <p className="text-lg leading-relaxed">{contact.intro}</p>
          <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-rose-ink">
            {contact.channelsTitle}
          </h3>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center gap-3">
              <Mail size={20} aria-hidden="true" className="text-rose-ink" />
              {site.email ? (
                <a href={`mailto:${site.email}`} className="font-medium text-plum hover:underline">
                  {site.email}
                </a>
              ) : (
                <span>
                  {contact.email}: {contact.todoLink}
                </span>
              )}
            </li>
            {socials.map(({ key, label, href, Icon }) => (
              <li key={key} className="flex items-center gap-3">
                <Icon size={20} aria-hidden="true" className="text-rose-ink" />
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-plum hover:underline"
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

        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="card space-y-4">
            <label className="block text-sm font-semibold text-plum">
              {contact.form.name}
              <input name="name" type="text" required autoComplete="name" className={field} />
            </label>
            <label className="block text-sm font-semibold text-plum">
              {contact.form.email}
              <input name="email" type="email" required autoComplete="email" className={field} />
            </label>
            <label className="block text-sm font-semibold text-plum">
              {contact.form.message}
              <textarea name="message" required rows={5} className={field} />
            </label>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="btn-primary disabled:opacity-60"
            >
              <Send size={18} aria-hidden="true" className="rtl:-scale-x-100" />
              {status === 'sending' ? contact.form.sending : contact.form.send}
            </button>
            <p
              role="status"
              aria-live="polite"
              className="min-h-6 text-sm font-medium text-rose-ink"
            >
              {status === 'success' && contact.form.success}
              {status === 'error' && contact.form.error}
            </p>
          </form>
        </Reveal>
      </div>
    </Section>
  )
}
