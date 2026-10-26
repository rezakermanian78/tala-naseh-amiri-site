import type { FastifyBaseLogger } from 'fastify'
import type { Config } from '../config.js'

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c)

/**
 * Optional e-mail about a new contact message, via Resend. Only runs when RESEND_API_KEY and
 * NOTIFY_EMAIL are set. Fire-and-forget: it never delays or fails the visitor's request.
 */
export function notifyNewMessage(
  config: Config,
  log: FastifyBaseLogger,
  msg: { name: string; email: string; message: string },
) {
  if (!config.RESEND_API_KEY || !config.NOTIFY_EMAIL) return
  void fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
    headers: { Authorization: `Bearer ${config.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: config.NOTIFY_FROM,
      to: [config.NOTIFY_EMAIL],
      reply_to: msg.email,
      subject: `New message from ${msg.name}`,
      html: `<p><b>${escape(msg.name)}</b> &lt;${escape(msg.email)}&gt;</p><p style="white-space:pre-wrap">${escape(msg.message)}</p><p><a href="https://talanasehamiri.ir/admin?tab=messages">Open the inbox</a></p>`,
    }),
  })
    .then((res) => {
      if (!res.ok) log.warn({ status: res.status }, 'notification email failed')
    })
    .catch((err: unknown) => log.warn({ err }, 'notification email failed'))
}
