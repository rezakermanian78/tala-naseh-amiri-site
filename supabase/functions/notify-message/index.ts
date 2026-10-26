// OPTIONAL: emails Tala when a new contact message arrives.
// Deploy:  supabase functions deploy notify-message --no-verify-jwt
// Secrets: supabase secrets set RESEND_API_KEY=... NOTIFY_TO=talanasehamiri@gmail.com WEBHOOK_SECRET=...
// Then: Database → Webhooks → Create: table public.messages, event INSERT, type "Supabase Edge
// Functions" → notify-message, add HTTP header  x-webhook-secret: <WEBHOOK_SECRET>.
// (Runs on Deno in Supabase, not part of the Vite build.)

type Payload = {
  type: 'INSERT'
  table: string
  record: { name: string; email: string; message: string; created_at: string }
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c)

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('forbidden', { status: 403 })
  }
  const { record } = (await req.json()) as Payload
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Website <onboarding@resend.dev>',
      to: [Deno.env.get('NOTIFY_TO')],
      reply_to: record.email,
      subject: `New message from ${record.name}`,
      html: `<p><b>${escape(record.name)}</b> &lt;${escape(record.email)}&gt;</p><p style="white-space:pre-wrap">${escape(record.message)}</p><p><a href="https://talanasehamiri.ir/admin?tab=messages">Open the inbox</a></p>`,
    }),
  })
  return new Response(res.ok ? 'sent' : await res.text(), { status: res.ok ? 200 : 502 })
})
