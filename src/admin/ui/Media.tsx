import { FileText, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { useEffect, useId, useState, type ChangeEvent } from 'react'
import { uploadMedia } from '../api'
import { errorText, useToast } from '../feedback'
import { useT } from '../i18n'
import { compressImage } from '../image'

const pickerClass =
  'btn-ghost cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rose-ink has-[:disabled]:cursor-wait has-[:disabled]:opacity-60'

type ImageProps = {
  label: string
  hint?: string
  value: string
  onChange: (url: string) => void
  folder: string
  /** Longest side in pixels after resizing. */
  maxSize?: number
  required?: boolean
  invalid?: boolean
}

export function ImageField({
  label,
  hint,
  value,
  onChange,
  folder,
  maxSize = 1600,
  required,
  invalid,
}: ImageProps) {
  const t = useT()
  const toast = useToast()
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview)
  }, [localPreview])

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('error', t.notAnImage)
      return
    }
    setBusy(true)
    try {
      const { blob, ext } = await compressImage(file, maxSize)
      setLocalPreview(URL.createObjectURL(blob))
      const url = await uploadMedia(folder, blob, ext, blob.type)
      onChange(url)
    } catch (err) {
      toast('error', `${t.uploadFailed}: ${errorText(err)}`)
    } finally {
      setBusy(false)
      setLocalPreview(null)
    }
  }

  const shown = localPreview ?? value
  return (
    <div>
      <p id={`${id}-label`} className="text-sm font-semibold text-plum">
        {label}
        {required && (
          <span aria-hidden="true" className="text-rose-ink">
            {' '}
            *
          </span>
        )}
      </p>
      <div
        className={`mt-1.5 flex flex-col gap-3 rounded-xl border border-dashed p-3 sm:flex-row sm:items-center ${
          invalid && !value ? 'border-red-500' : 'border-line/30'
        }`}
      >
        <div className="relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-lg bg-blush-deep">
          {shown ? (
            <img src={shown} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={28} aria-hidden="true" className="text-muted" />
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-canvas/70">
              <Loader2 size={24} aria-hidden="true" className="animate-spin text-rose-ink" />
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className={pickerClass}>
            <Upload size={16} aria-hidden="true" />
            {busy ? t.uploading : value ? t.replaceImage : t.uploadImage}
            <input
              type="file"
              accept="image/*"
              onChange={onPick}
              disabled={busy}
              aria-describedby={`${id}-label ${id}-hint`}
              className="sr-only"
            />
          </label>
          {value && !busy && (
            <button type="button" onClick={() => onChange('')} className="btn-ghost">
              <Trash2 size={16} aria-hidden="true" />
              {t.removeImage}
            </button>
          )}
        </div>
      </div>
      <span id={`${id}-hint`} className="mt-1 block text-xs text-muted">
        {hint ? `${hint} ` : ''}
        {t.imageHint}
      </span>
      <span aria-live="polite" className="sr-only">
        {busy ? t.uploading : ''}
      </span>
    </div>
  )
}

const MAX_PDF = 10 * 1024 * 1024

export function PdfField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (url: string) => void
}) {
  const t = useT()
  const toast = useToast()
  const id = useId()
  const [busy, setBusy] = useState(false)

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf' || file.size > MAX_PDF) {
      toast('error', t.pdfOnly)
      return
    }
    setBusy(true)
    try {
      onChange(await uploadMedia('cv', file, 'pdf', 'application/pdf'))
    } catch (err) {
      toast('error', `${t.uploadFailed}: ${errorText(err)}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p id={`${id}-label`} className="text-sm font-semibold text-plum">
        {label}
      </p>
      <div className="mt-1.5 flex flex-col gap-3 rounded-xl border border-dashed border-line/30 p-3 sm:flex-row sm:items-center">
        <FileText size={28} aria-hidden="true" className="shrink-0 text-rose-ink" />
        <div className="min-w-0 flex-1 text-sm">
          {value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline break-all font-medium text-rose-ink"
            >
              {t.openFile}
            </a>
          ) : (
            <span>{t.noFile}</span>
          )}
        </div>
        <label className={pickerClass}>
          {busy ? (
            <Loader2 size={16} aria-hidden="true" className="animate-spin" />
          ) : (
            <Upload size={16} aria-hidden="true" />
          )}
          {busy ? t.uploading : value ? t.replacePdf : t.uploadPdf}
          <input
            type="file"
            accept="application/pdf"
            onChange={onPick}
            disabled={busy}
            aria-describedby={`${id}-label`}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  )
}
