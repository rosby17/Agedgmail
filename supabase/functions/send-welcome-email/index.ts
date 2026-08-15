// ============================================================
// send-welcome-email
// Envoie un email de bienvenue juste après l'inscription (appelé
// côté client depuis AuthView.jsx, immédiatement après signUp()).
// Distinct de l'email de confirmation d'adresse envoyé nativement par
// Supabase Auth (auth.signUp / auth.resend) — celui-ci est notre email de
// marque, pas soumis à opt-out (un seul envoi, jamais répété).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/supplier-db.ts'
import { sendEmail } from '../_shared/email.ts'
import { emailShell, ctaButton } from '../_shared/email-template.ts'

const SITE_NAME = 'AgedGmailYT'
const SITE_URL = 'https://agedgmail.tools-cl.com'

function buildEmailHtml(displayName: string): string {
  const body = `
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Salut${displayName ? ' ' + displayName : ''}, bienvenue sur AgedGmailYT !
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
      Ton compte est prêt. Tu peux dès maintenant recharger ton solde et acheter des comptes vérifiés,
      livrés automatiquement dans ton espace « Mes commandes ».
    </p>
    <div style="text-align:center;">
      ${ctaButton(`${SITE_URL}/shop`, 'Découvrir le catalogue')}
    </div>
  `
  return emailShell({
    preheader: 'Ton compte AgedGmailYT est prêt.',
    heroTitle: 'Bienvenue 👋',
    bodyHtml: body,
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email, displayName } = await req.json()
    if (!email) throw new Error('email requis')

    const result = await sendEmail({
      to: email,
      subject: `[${SITE_NAME}] Bienvenue !`,
      html: buildEmailHtml(displayName || ''),
      fromName: SITE_NAME,
    })

    return new Response(JSON.stringify({ ...result, email }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[send-welcome-email] Erreur:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
