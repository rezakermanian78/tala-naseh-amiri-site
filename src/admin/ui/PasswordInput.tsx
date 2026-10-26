import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'
import { useT } from '../i18n'
import { inputClass } from './fields'

/** Password field with a show/hide toggle (handy when typing on a phone). */
export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const t = useT()
  const [shown, setShown] = useState(false)
  return (
    <div className="relative">
      <input
        {...props}
        type={shown ? 'text' : 'password'}
        dir="ltr"
        autoCapitalize="none"
        spellCheck={false}
        className={`${inputClass} pe-12 text-left`}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? t.login.hidePassword : t.login.showPassword}
        aria-pressed={shown}
        className="absolute end-1 top-1/2 inline-flex h-10 w-10 -translate-y-[calc(50%-0.1875rem)] items-center justify-center rounded-full text-muted hover:text-plum"
      >
        {shown ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  )
}
