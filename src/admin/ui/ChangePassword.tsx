import { KeyRound, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../../lib/api'
import { changePassword } from '../api'
import { errorText, useToast } from '../feedback'
import { useT } from '../i18n'
import PasswordInput from './PasswordInput'

const MIN = 12

export default function ChangePassword({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT()
  const a = t.account
  const toast = useToast()
  const ref = useRef<HTMLDialogElement>(null)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const close = () => {
    setCurrent('')
    setNext('')
    setRepeat('')
    setError('')
    onClose()
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (next.length < MIN) return setError(a.tooShort)
    if (next !== repeat) return setError(a.mismatch)
    setBusy(true)
    setError('')
    try {
      await changePassword(current, next)
      toast('success', a.changed)
      close()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'wrong_password') setError(a.wrongCurrent)
      else setError(`${a.failed}: ${errorText(err)}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
      aria-labelledby="change-password-title"
      className="w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-line/15 bg-surface p-0 text-muted shadow-lift backdrop:bg-plum/40 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} noValidate className="space-y-4 p-6">
        <h2 id="change-password-title" className="flex items-center gap-2 text-lg font-bold">
          <KeyRound size={20} aria-hidden="true" className="text-rose-ink" />
          {a.changePassword}
        </h2>
        <div>
          <label htmlFor="pw-current" className="block text-sm font-semibold text-plum">
            {a.current}
          </label>
          <PasswordInput
            id="pw-current"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pw-new" className="block text-sm font-semibold text-plum">
            {a.new}
          </label>
          <PasswordInput
            id="pw-new"
            autoComplete="new-password"
            minLength={MIN}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            aria-describedby="pw-hint"
          />
          <span id="pw-hint" className="mt-1 block text-xs text-muted">
            {a.hint}
          </span>
        </div>
        <div>
          <label htmlFor="pw-repeat" className="block text-sm font-semibold text-plum">
            {a.confirm}
          </label>
          <PasswordInput
            id="pw-repeat"
            autoComplete="new-password"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button type="button" onClick={close} className="btn-ghost">
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={busy || !current || !next || !repeat}
            className="btn-primary disabled:opacity-60"
          >
            {busy && <Loader2 size={16} aria-hidden="true" className="animate-spin" />}
            {busy ? t.saving : a.changePassword}
          </button>
        </div>
      </form>
    </dialog>
  )
}
