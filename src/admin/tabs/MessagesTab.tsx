import { Loader2, Mail, MailOpen, RefreshCw, Reply, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { MessageRow } from '../../lib/database.types'
import { deleteMessage, fetchMessages, setMessageRead } from '../api'
import { errorText, useConfirm, useToast } from '../feedback'
import { useT } from '../i18n'

type Filter = 'all' | 'unread'

export default function MessagesTab({ onUnreadChange }: { onUnreadChange: (n: number) => void }) {
  const t = useT()
  const m = t.messages
  const toast = useToast()
  const confirm = useConfirm()
  const [items, setItems] = useState<MessageRow[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchNow = useCallback(
    () =>
      fetchMessages().then(
        (rows) => {
          setItems(rows)
          setLoadError('')
        },
        (err: unknown) => setLoadError(errorText(err)),
      ),
    [],
  )

  useEffect(() => {
    void fetchNow()
  }, [fetchNow])

  const load = () => {
    setRefreshing(true)
    void fetchNow().finally(() => setRefreshing(false))
  }

  useEffect(() => {
    if (items) onUnreadChange(items.filter((x) => !x.read).length)
  }, [items, onUnreadChange])

  const setRead = async (msg: MessageRow, read: boolean) => {
    setItems((xs) => xs && xs.map((x) => (x.id === msg.id ? { ...x, read } : x)))
    try {
      await setMessageRead(msg.id, read)
    } catch (err) {
      setItems((xs) => xs && xs.map((x) => (x.id === msg.id ? { ...x, read: !read } : x)))
      toast('error', `${t.saveFailed}: ${errorText(err)}`)
    }
  }

  const open = (msg: MessageRow) => {
    const next = openId === msg.id ? null : msg.id
    setOpenId(next)
    if (next && !msg.read) void setRead(msg, true)
  }

  const remove = async (msg: MessageRow) => {
    const ok = await confirm({
      title: m.deleteTitle,
      body: `${msg.name} <${msg.email}> — ${t.deleteBody}`,
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      danger: true,
    })
    if (!ok) return
    try {
      await deleteMessage(msg.id)
      setItems((xs) => xs && xs.filter((x) => x.id !== msg.id))
      toast('success', t.deleted)
    } catch (err) {
      toast('error', `${t.deleteFailed}: ${errorText(err)}`)
    }
  }

  const fmt = new Intl.DateTimeFormat(t.dir === 'rtl' ? 'fa-IR' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const shown = (items ?? []).filter((x) => filter === 'all' || !x.read)
  const unread = (items ?? []).filter((x) => !x.read).length

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="me-auto text-sm">{m.intro}</p>
        <div role="group" className="inline-flex rounded-full border border-line/25 p-1">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`min-h-9 rounded-full px-4 text-sm font-semibold ${
                filter === f ? 'bg-rose text-white' : 'text-plum hover:bg-blush-deep'
              }`}
            >
              {m[f]}
              {f === 'unread' && unread > 0 && ` (${unread})`}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="btn-ghost disabled:opacity-60"
        >
          <RefreshCw size={16} aria-hidden="true" className={refreshing ? 'animate-spin' : ''} />
          {m.refresh}
        </button>
      </div>

      {loadError ? (
        <div role="alert" className="mt-4 rounded-2xl border border-red-300 p-5">
          <p className="font-semibold text-plum">
            {t.loadFailed}: {loadError}
          </p>
          <button type="button" onClick={() => void load()} className="btn-ghost mt-4">
            {t.retry}
          </button>
        </div>
      ) : items === null ? (
        <p className="mt-6 flex items-center gap-2 text-sm" role="status">
          <Loader2 size={18} aria-hidden="true" className="animate-spin" />
          {t.loading}
        </p>
      ) : shown.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line/30 p-6 text-center">
          {filter === 'all' ? m.none : m.noneUnread}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {shown.map((msg) => {
            const isOpen = openId === msg.id
            return (
              <li
                key={msg.id}
                className={`overflow-hidden rounded-2xl border bg-surface shadow-soft ${
                  msg.read ? 'border-line/15' : 'border-rose/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => open(msg)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-3 p-4 text-start"
                >
                  {msg.read ? (
                    <MailOpen size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-muted" />
                  ) : (
                    <Mail size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-rose-ink" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className={`text-plum ${msg.read ? 'font-medium' : 'font-bold'}`} dir="auto">
                        {msg.name}
                      </span>
                      {!msg.read && (
                        <span className="rounded-full bg-rose px-2 py-0.5 text-xs font-bold text-white">
                          {m.newBadge}
                        </span>
                      )}
                      <span className="text-xs text-muted">{fmt.format(new Date(msg.created_at))}</span>
                    </span>
                    <span className="block truncate text-sm" dir="ltr">
                      {msg.email}
                    </span>
                    {!isOpen && (
                      <span className="mt-1 line-clamp-2 block text-sm" dir="auto">
                        {msg.message}
                      </span>
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-line/10 p-4">
                    <p className="whitespace-pre-wrap break-words text-plum" dir="auto">
                      {msg.message}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        className="btn-primary"
                        href={`mailto:${msg.email}?subject=${encodeURIComponent('Re: your message')}&body=${encodeURIComponent(
                          `\n\n> ${msg.message.split('\n').join('\n> ')}`,
                        )}`}
                      >
                        <Reply size={16} aria-hidden="true" className="rtl:-scale-x-100" />
                        {m.reply}
                      </a>
                      <button
                        type="button"
                        onClick={() => void setRead(msg, !msg.read)}
                        className="btn-ghost"
                      >
                        {msg.read ? m.markUnread : m.markRead}
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(msg)}
                        className="btn ms-auto text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        {t.delete}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
