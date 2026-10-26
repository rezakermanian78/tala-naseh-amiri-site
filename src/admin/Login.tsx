import { Loader2, LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '../lib/api'
import { login } from './api'
import { errorText, useToast } from './feedback'
import { useT } from './i18n'
import { inputClass } from './ui/fields'
import PasswordInput from './ui/PasswordInput'

export default function Login({
  onSignedIn,
  notice,
}: {
  onSignedIn: (email: string) => void
  /** Shown above the form, e.g. "your session expired". */
  notice?: string
}) {
  const t = useT()
  const l = t.login
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setBusy(true)
    setError('')
    try {
      const res = await login(email.trim(), password)
      setPassword('')
      onSignedIn(res.email)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'invalid_credentials') setError(l.invalid)
      else if (err instanceof ApiError && err.code === 'rate_limited') setError(l.tooMany)
      else if (err instanceof ApiError && err.code === 'network_error') setError(l.network)
      else toast('error', errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-line/15 bg-surface p-6 shadow-lift sm:p-8">
      <span
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose text-2xl font-extrabold text-white"
      >
        T
      </span>
      <h1 className="mt-5 text-2xl font-extrabold">{l.title}</h1>
      {notice && (
        <p role="status" className="mt-3 rounded-2xl bg-blush p-3 text-sm font-medium text-plum">
          {notice}
        </p>
      )}
      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor="admin-email" className="block text-sm font-semibold text-plum">
            {l.email}
          </label>
          <input
            id="admin-email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
            className={`${inputClass} text-left`}
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-sm font-semibold text-plum">
            {l.password}
          </label>
          <PasswordInput
            id="admin-password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>
        {error && (
          <p id="login-error" role="alert" className="text-sm font-semibold text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || !email.trim() || !password}
          className="btn-primary w-full disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={18} aria-hidden="true" className="animate-spin" />
          ) : (
            <LogIn size={18} aria-hidden="true" className="rtl:-scale-x-100" />
          )}
          {busy ? l.submitting : l.submit}
        </button>
      </form>
    </div>
  )
}
