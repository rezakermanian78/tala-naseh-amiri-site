import { KeyRound, Loader2, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ADMIN_EMAIL } from '../lib/supabase'
import { getSupabase } from '../lib/supabaseAdmin'
import { errorText, useToast } from './feedback'
import { useT } from './i18n'
import { inputClass } from './ui/fields'

export default function Login() {
  const t = useT()
  const l = t.login
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const send = async (e: FormEvent) => {
    e.preventDefault()
    const address = email.trim().toLowerCase()
    // The admin address is public (it's on the site), so saying "not allowed" leaks nothing
    // and saves waiting for an email that will never come. The database enforces it anyway.
    if (address !== ADMIN_EMAIL) {
      toast('error', l.notAuthorized)
      return
    }
    setBusy(true)
    try {
      const sb = await getSupabase()
      const { error } = await sb.auth.signInWithOtp({
        email: address,
        options: { emailRedirectTo: `${window.location.origin}/admin`, shouldCreateUser: false },
      })
      if (error) throw error
      setSentTo(address)
    } catch (err) {
      toast('error', `${l.sendFailed}: ${errorText(err)}`)
    } finally {
      setBusy(false)
    }
  }

  const verify = async (e: FormEvent) => {
    e.preventDefault()
    const token = code.replace(/\D/g, '')
    if (token.length < 6) return
    setBusy(true)
    try {
      const sb = await getSupabase()
      const { error } = await sb.auth.verifyOtp({ email: sentTo, token, type: 'email' })
      if (error) throw error
      // onAuthStateChange in AdminApp takes it from here.
    } catch {
      toast('error', l.codeFailed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-blush px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-line/15 bg-surface p-6 shadow-lift sm:p-8">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose text-2xl font-extrabold text-white"
        >
          T
        </span>
        <h1 className="mt-5 text-2xl font-extrabold">{l.title}</h1>

        {!sentTo ? (
          <form onSubmit={send} className="mt-4 space-y-4">
            <p>{l.intro}</p>
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold text-plum">
                {l.email}
              </label>
              <input
                id="admin-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} text-left`}
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
              {busy ? (
                <Loader2 size={18} aria-hidden="true" className="animate-spin" />
              ) : (
                <Mail size={18} aria-hidden="true" />
              )}
              {busy ? l.sending : l.send}
            </button>
          </form>
        ) : (
          <div className="mt-4 space-y-5">
            <p role="status" className="rounded-2xl bg-blush p-4 font-medium text-plum">
              {l.sent}
            </p>
            <form onSubmit={verify} className="space-y-3">
              <label htmlFor="admin-code" className="block text-sm font-semibold text-plum">
                {l.codeLabel}
              </label>
              <input
                id="admin-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={10}
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`${inputClass} text-center font-mono text-xl tracking-[0.4em]`}
              />
              <button
                type="submit"
                disabled={busy || code.replace(/\D/g, '').length < 6}
                className="btn-primary w-full disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 size={18} aria-hidden="true" className="animate-spin" />
                ) : (
                  <KeyRound size={18} aria-hidden="true" />
                )}
                {busy ? l.verifying : l.verify}
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                setSentTo('')
                setCode('')
              }}
              className="text-sm font-semibold text-rose-ink underline-offset-4 hover:underline"
            >
              {l.useDifferent}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
