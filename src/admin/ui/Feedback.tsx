import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ConfirmContext,
  ToastContext,
  type ConfirmOptions,
  type ToastKind,
} from '../feedback'
import { useT } from '../i18n'

type Toast = { id: number; kind: ToastKind; text: string }
type Pending = ConfirmOptions & { resolve: (ok: boolean) => void }

let nextId = 1

export default function FeedbackProvider({ children }: { children: ReactNode }) {
  const t = useT()
  const [toasts, setToasts] = useState<Toast[]>([])
  const [pending, setPending] = useState<Pending | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const dismiss = useCallback((id: number) => setToasts((ts) => ts.filter((x) => x.id !== id)), [])

  const toast = useCallback(
    (kind: ToastKind, text: string) => {
      const id = nextId++
      setToasts((ts) => [...ts.slice(-3), { id, kind, text }])
      window.setTimeout(() => dismiss(id), kind === 'error' ? 8000 : 4000)
    },
    [dismiss],
  )

  const confirm = useCallback(
    (opts: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...opts, resolve })),
    [],
  )

  useEffect(() => {
    const d = dialogRef.current
    if (pending && d && !d.open) d.showModal()
  }, [pending])

  const answer = (ok: boolean) => {
    pending?.resolve(ok)
    setPending(null)
    dialogRef.current?.close()
  }

  return (
    <ToastContext.Provider value={toast}>
      <ConfirmContext.Provider value={confirm}>
        {children}

        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
        >
          {toasts.map((x) => (
            <div
              key={x.id}
              role={x.kind === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lift ${
                x.kind === 'error'
                  ? 'border-red-300 bg-red-50 text-red-900 dark:border-red-400/40 dark:bg-red-950 dark:text-red-100'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-950 dark:text-emerald-100'
              }`}
            >
              {x.kind === 'error' ? (
                <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
              )}
              <p className="flex-1 break-words">{x.text}</p>
              <button
                type="button"
                onClick={() => dismiss(x.id)}
                aria-label={t.close}
                className="-m-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <dialog
          ref={dialogRef}
          onCancel={(e) => {
            e.preventDefault()
            answer(false)
          }}
          aria-labelledby="confirm-title"
          className="w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-line/15 bg-surface p-0 text-muted shadow-lift backdrop:bg-plum/40 backdrop:backdrop-blur-sm"
        >
          {pending && (
            <div className="p-6">
              <h2 id="confirm-title" className="text-lg font-bold">
                {pending.title}
              </h2>
              {pending.body && <p className="mt-2">{pending.body}</p>}
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button type="button" className="btn-ghost" onClick={() => answer(false)} autoFocus>
                  {pending.cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => answer(true)}
                  className={
                    pending.danger
                      ? 'btn bg-red-600 text-white hover:bg-red-700'
                      : 'btn-primary'
                  }
                >
                  {pending.confirmLabel}
                </button>
              </div>
            </div>
          )}
        </dialog>
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  )
}
