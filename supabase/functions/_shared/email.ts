// ============================================================
// Envoi d'email via un relais HTTP hébergé sur Vercel (api/send-email.js,
// runtime Node.js classique), pas directement via SMTP depuis cette
// fonction : les Supabase Edge Functions tournent dans un sandbox Deno qui
// plante sur la négociation TLS/STARTTLS nécessaire pour parler SMTP en
// direct. Node, lui, gère ça normalement — d'où le relais.
//
// Secrets requis : EMAIL_RELAY_URL (ex: https://agedgmail.tools-cl.com/api/send-email),
// EMAIL_RELAY_SECRET (même valeur que côté Vercel, header x-relay-secret).
// ============================================================

const RELAY_URL = Deno.env.get('EMAIL_RELAY_URL') ?? ''
const RELAY_SECRET = Deno.env.get('EMAIL_RELAY_SECRET') ?? ''

export async function sendEmail(opts: { to: string; subject: string; html: string; fromName?: string }) {
  if (!RELAY_URL || !RELAY_SECRET) {
    console.warn('[sendEmail] EMAIL_RELAY_URL/EMAIL_RELAY_SECRET non configurés — email non envoyé à', opts.to)
    return { ok: true, skipped: true, reason: 'no_relay_config' }
  }

  const res = await fetch(RELAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-relay-secret': RELAY_SECRET,
    },
    body: JSON.stringify({
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      fromName: opts.fromName ?? 'AgedGmail',
    }),
  })

  const body = await res.json()
  if (!res.ok) throw new Error(`email relay error (${res.status}): ${JSON.stringify(body)}`)
  return body
}
