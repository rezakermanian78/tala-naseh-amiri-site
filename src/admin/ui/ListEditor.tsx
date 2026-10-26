import { Reorder, useDragControls } from 'framer-motion'
import { Eye, EyeOff, GripVertical, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import type { Draft, ListRows, ListTable } from '../../lib/types'
import { deleteRow, fetchRows, insertRow, removeMedia, saveOrder, updateRow } from '../api'
import { useDirtyFlag } from '../dirty'
import { errorText, useConfirm, useToast } from '../feedback'
import { useT } from '../i18n'

export type Summary = { title: string; subtitle?: string; image?: string }

type Props<T extends ListTable> = {
  table: T
  intro?: string
  addLabel: string
  /** A fresh, empty item (sort_order is filled in on save). */
  empty: () => Draft<T>
  summary: (row: Draft<T>) => Summary
  /** The form fields. `set` merges a partial change into the draft. */
  form: (draft: Draft<T>, set: (patch: Partial<Draft<T>>) => void, showErrors: boolean) => ReactNode
  /** Return false to block saving (the form highlights missing fields when showErrors). */
  isValid: (draft: Draft<T>) => boolean
  /** Uploaded image to clean up from storage when the item is deleted. */
  imageOf?: (row: ListRows[T]) => string
}

type Editing<T extends ListTable> = { key: string; draft: Draft<T>; original: Draft<T> }

const META = new Set(['id', 'created_at', 'updated_at'])
const toDraft = <T extends ListTable>(row: ListRows[T]) =>
  Object.fromEntries(Object.entries(row).filter(([k]) => !META.has(k))) as Draft<T>
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

const iconBtn =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-plum transition-colors hover:bg-blush-deep disabled:opacity-40'

export default function ListEditor<T extends ListTable>({
  table,
  intro,
  addLabel,
  empty,
  summary,
  form,
  isValid,
  imageOf,
}: Props<T>) {
  const t = useT()
  const toast = useToast()
  const confirm = useConfirm()
  const [rows, setRows] = useState<ListRows[T][] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState<Editing<T> | null>(null)
  const [saving, setSaving] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  // Latest rows for callbacks that fire after a re-render (drag end, keyboard moves).
  const rowsRef = useRef<ListRows[T][]>([])
  useEffect(() => {
    rowsRef.current = rows ?? []
  }, [rows])

  const dirty = editing !== null && !same(editing.draft, editing.original)
  useDirtyFlag(`list:${table}`, dirty)

  // State is only set once the request settles, so this is safe to call from an effect.
  const load = useCallback(
    () =>
      fetchRows(table).then(
        (r) => {
          setRows(r)
          setLoadError('')
        },
        (err: unknown) => setLoadError(errorText(err)),
      ),
    [table],
  )

  useEffect(() => {
    void load()
  }, [load])

  /** Asks before throwing away unsaved edits. Resolves true when it's OK to continue. */
  const okToLeaveEditor = async () =>
    !dirty ||
    confirm({
      title: t.unsavedTitle,
      body: t.unsavedBody,
      confirmLabel: t.discard,
      cancelLabel: t.keepEditing,
      danger: true,
    })

  const openEditor = async (key: string, draft: Draft<T>) => {
    if (editing?.key === key) return
    if (!(await okToLeaveEditor())) return
    setShowErrors(false)
    setEditing({ key, draft, original: draft })
  }

  const closeEditor = async () => {
    if (await okToLeaveEditor()) setEditing(null)
  }

  const persistOrder = async (ordered: ListRows[T][]) => {
    const changed = ordered.some((r, i) => r.sort_order !== (i + 1) * 10)
    if (!changed) return
    setRows(ordered.map((r, i) => ({ ...r, sort_order: (i + 1) * 10 })))
    try {
      await saveOrder(
        table,
        ordered.map((r) => r.id),
      )
      toast('success', t.orderSaved)
    } catch (err) {
      toast('error', `${t.orderFailed}: ${errorText(err)}`)
      void load()
    }
  }

  const move = (index: number, delta: number) => {
    const list = [...rowsRef.current]
    const to = index + delta
    if (to < 0 || to >= list.length) return
    const [item] = list.splice(index, 1)
    list.splice(to, 0, item)
    void persistOrder(list)
  }

  const toggleVisible = async (row: ListRows[T]) => {
    const visible = !row.visible
    setRows((rs) => rs && rs.map((r) => (r.id === row.id ? { ...r, visible } : r)))
    try {
      const patch: Partial<Draft<T>> = {}
      Object.assign(patch, { visible })
      await updateRow(table, row.id, patch)
      toast('success', visible ? t.shownNow : t.hiddenNow)
    } catch (err) {
      setRows((rs) => rs && rs.map((r) => (r.id === row.id ? { ...r, visible: !visible } : r)))
      toast('error', `${t.visibilityFailed}: ${errorText(err)}`)
    }
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    if (!isValid(editing.draft)) {
      setShowErrors(true)
      toast('error', t.required)
      return
    }
    setSaving(true)
    try {
      if (editing.key === 'new') {
        const maxOrder = rowsRef.current.reduce((m, r) => Math.max(m, r.sort_order), 0)
        const created = await insertRow(table, { ...editing.draft, sort_order: maxOrder + 10 })
        setRows((rs) => [...(rs ?? []), created])
      } else {
        // Order and visibility are controlled from the list itself, never from a stale draft.
        const patch: Partial<Draft<T>> = { ...editing.draft }
        delete patch.sort_order
        delete patch.visible
        const updated = await updateRow(table, editing.key, patch)
        setRows((rs) => rs && rs.map((r) => (r.id === updated.id ? updated : r)))
      }
      setEditing(null)
      toast('success', t.saved)
    } catch (err) {
      toast('error', `${t.saveFailed}: ${errorText(err)}`)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (row: ListRows[T]) => {
    const ok = await confirm({
      title: t.deleteTitle,
      body: `${summary(toDraft<T>(row)).title} — ${t.deleteBody}`,
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      danger: true,
    })
    if (!ok) return
    try {
      await deleteRow(table, row.id)
      setRows((rs) => rs && rs.filter((r) => r.id !== row.id))
      setEditing(null)
      toast('success', t.deleted)
      const img = imageOf?.(row)
      if (img) void removeMedia(img).catch(() => {})
    } catch (err) {
      toast('error', `${t.deleteFailed}: ${errorText(err)}`)
    }
  }

  const setDraft = (patch: Partial<Draft<T>>) =>
    setEditing((ed) => ed && { ...ed, draft: { ...ed.draft, ...patch } })

  const editorPanel = (row: ListRows[T] | null) =>
    editing && (
      <form
        onSubmit={save}
        noValidate
        className="space-y-5 border-t border-line/10 p-4 sm:p-5"
        aria-label={row ? summary(editing.draft).title || t.edit : t.newItem}
      >
        {form(editing.draft, setDraft, showErrors)}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving && <Loader2 size={16} aria-hidden="true" className="animate-spin" />}
            {saving ? t.saving : t.save}
          </button>
          <button type="button" onClick={() => void closeEditor()} className="btn-ghost">
            {t.cancel}
          </button>
          {dirty && (
            <span className="text-sm font-medium text-rose-ink" role="status">
              {t.unsavedBadge}
            </span>
          )}
          {row && (
            <button
              type="button"
              onClick={() => void remove(row)}
              className="btn ms-auto text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
            >
              <Trash2 size={16} aria-hidden="true" />
              {t.delete}
            </button>
          )}
        </div>
      </form>
    )

  if (loadError) {
    return (
      <div role="alert" className="rounded-2xl border border-red-300 p-5">
        <p className="font-semibold text-plum">
          {t.loadFailed}: {loadError}
        </p>
        <button type="button" onClick={() => void load()} className="btn-ghost mt-4">
          {t.retry}
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {intro && <p className="max-w-2xl text-sm">{intro}</p>}
        <button
          type="button"
          onClick={() => void openEditor('new', empty())}
          disabled={rows === null || editing?.key === 'new'}
          className="btn-primary ms-auto disabled:opacity-60"
        >
          <Plus size={18} aria-hidden="true" />
          {addLabel}
        </button>
      </div>

      {editing?.key === 'new' && (
        <div className="mt-4 rounded-2xl border-2 border-rose/50 bg-surface shadow-soft">
          <p className="px-4 pt-4 font-bold text-plum sm:px-5">{t.newItem}</p>
          {editorPanel(null)}
        </div>
      )}

      {rows === null ? (
        <div className="mt-6 flex items-center gap-2 text-sm" role="status">
          <Loader2 size={18} aria-hidden="true" className="animate-spin" />
          {t.loading}
        </div>
      ) : rows.length === 0 && editing?.key !== 'new' ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line/30 p-6 text-center">
          {t.empty}
        </p>
      ) : (
        <Reorder.Group
          axis="y"
          values={rows}
          onReorder={(next: ListRows[T][]) => setRows(next)}
          className="mt-4 space-y-3"
        >
          {rows.map((row, i) => (
            <Row
              key={row.id}
              row={row}
              summary={summary(toDraft<T>(row))}
              canDrag={editing === null}
              isEditing={editing?.key === row.id}
              isFirst={i === 0}
              isLast={i === rows.length - 1}
              onDragEnd={() => void persistOrder(rowsRef.current)}
              onMove={(delta) => move(i, delta)}
              onToggle={() => void toggleVisible(row)}
              onEdit={() =>
                editing?.key === row.id ? void closeEditor() : void openEditor(row.id, toDraft<T>(row))
              }
            >
              {editing?.key === row.id && editorPanel(row)}
            </Row>
          ))}
        </Reorder.Group>
      )}
    </div>
  )
}

type RowProps<R> = {
  row: R
  summary: Summary
  canDrag: boolean
  isEditing: boolean
  isFirst: boolean
  isLast: boolean
  onDragEnd: () => void
  onMove: (delta: number) => void
  onToggle: () => void
  onEdit: () => void
  children: ReactNode
}

function Row<R extends { id: string; visible: boolean }>({
  row,
  summary,
  canDrag,
  isEditing,
  isFirst,
  isLast,
  onDragEnd,
  onMove,
  onToggle,
  onEdit,
  children,
}: RowProps<R>) {
  const t = useT()
  const controls = useDragControls()

  const onHandleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowUp' && !isFirst) {
      e.preventDefault()
      onMove(-1)
    } else if (e.key === 'ArrowDown' && !isLast) {
      e.preventDefault()
      onMove(1)
    }
  }

  return (
    <Reorder.Item
      value={row}
      // Animate position only: scaling would blur the form while a card expands.
      layout="position"
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className={`list-none overflow-hidden rounded-2xl border bg-surface shadow-soft ${
        isEditing ? 'border-rose/60' : 'border-line/15'
      }`}
    >
      <div className="flex items-center gap-1 p-2 sm:gap-2 sm:p-3">
        <button
          type="button"
          aria-label={`${t.dragHandle} ${summary.title}`}
          disabled={!canDrag}
          onPointerDown={(e) => canDrag && controls.start(e)}
          onKeyDown={onHandleKey}
          style={{ touchAction: 'none' }}
          className={`${iconBtn} cursor-grab text-muted active:cursor-grabbing`}
        >
          <GripVertical size={20} aria-hidden="true" />
        </button>
        {summary.image && (
          <img
            src={summary.image}
            alt=""
            loading="lazy"
            className="h-11 w-11 shrink-0 rounded-lg object-cover"
          />
        )}
        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 flex-1 rounded-lg px-1 py-1 text-start"
          aria-expanded={isEditing}
        >
          <span
            className={`line-clamp-2 font-semibold ${row.visible ? 'text-plum' : 'text-muted line-through decoration-muted/50'}`}
          >
            {summary.title || '—'}
          </span>
          {summary.subtitle && (
            <span className="mt-0.5 line-clamp-1 block text-sm text-muted">{summary.subtitle}</span>
          )}
        </button>
        {!row.visible && (
          <span className="hidden rounded-full bg-blush-deep px-2.5 py-1 text-xs font-semibold text-muted sm:inline">
            {t.hidden}
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={`${row.visible ? t.hide : t.show}: ${summary.title}`}
          title={row.visible ? t.hide : t.show}
          className={iconBtn}
        >
          {row.visible ? (
            <Eye size={19} aria-hidden="true" />
          ) : (
            <EyeOff size={19} aria-hidden="true" className="text-muted" />
          )}
        </button>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`${t.edit}: ${summary.title}`}
          aria-expanded={isEditing}
          className={`${iconBtn} ${isEditing ? 'bg-rose text-white hover:bg-rose' : ''}`}
        >
          <Pencil size={18} aria-hidden="true" />
        </button>
      </div>
      {children}
    </Reorder.Item>
  )
}
