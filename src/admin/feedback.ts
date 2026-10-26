import { createContext, useContext } from 'react'

export type ToastKind = 'success' | 'error'
export type ConfirmOptions = {
  title: string
  body?: string
  confirmLabel: string
  cancelLabel: string
  danger?: boolean
}

export const ToastContext = createContext<(kind: ToastKind, text: string) => void>(() => {})
export const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(() =>
  Promise.resolve(false),
)

export const useToast = () => useContext(ToastContext)
export const useConfirm = () => useContext(ConfirmContext)

/** Turns any thrown value / Supabase error into readable text. */
export function errorText(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as { message: unknown }).message
    if (typeof m === 'string') return m
  }
  return String(err)
}
