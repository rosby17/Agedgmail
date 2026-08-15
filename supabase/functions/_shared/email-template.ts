// ============================================================
// Gabarit HTML commun pour tous les emails transactionnels — reprend
// l'identité visuelle réelle du site (logo, vert de marque #0D7A52,
// pied de page) au lieu d'un email générique sans design.
// ============================================================
const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA2ZF5zZB5llhXjTZgvs64In3ytJg2FF_ek-KSm4bibJfw782IYaJSOV0Knvsmsuy_-PYMZlJp2iWO-tS2m2PBLuOiMGjhAV8_kzD9iQWOs6_dhwuhZCfBob0ZTq-oO131Htvb8G1tMAbz5fJlbqj4KbpEnBj0OIpWFUJmpCPQHQnv6k5fK9-FlMxX9UCNKVjE4jBej0HcFQB6je4WpnxANg0kP-0szIcnPZVSjDhlYnscIx5TNK88H1o1znlvXYZ7gV59gR7BNZDe'
const BRAND_GREEN = '#0D7A52'
const BRAND_GREEN_DARK = '#0A5F40'
const SITE_URL = 'https://agedgmail.tools-cl.com'
const WHATSAPP_URL = 'https://chat.whatsapp.com/DiQ6InUNSDeFDbEjQAu6Ax?mode=gi_t'

export function escapeHtml(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Enveloppe un contenu (bodyHtml) dans l'habillage complet AgedGmailYT. */
export function emailShell(opts: { preheader: string; heroTitle: string; heroSubtitle?: string; bodyHtml: string }): string {
  const { preheader, heroTitle, heroSubtitle, bodyHtml } = opts
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(heroTitle)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f5;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,122,82,0.08);">

        <!-- Header : logo + marque -->
        <tr><td style="background:#0B1F17;padding:28px 40px;text-align:center;">
          <img src="${LOGO_URL}" alt="AgedGmailYT" width="40" height="40" style="display:inline-block;vertical-align:middle;border-radius:8px;">
          <span style="display:inline-block;vertical-align:middle;margin-left:12px;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.3px;">AgedGmailYT</span>
        </td></tr>

        <!-- Bandeau titre -->
        <tr><td style="background:linear-gradient(135deg,${BRAND_GREEN} 0%,${BRAND_GREEN_DARK} 100%);padding:36px 40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.4px;">${escapeHtml(heroTitle)}</h1>
          ${heroSubtitle ? `<p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">${escapeHtml(heroSubtitle)}</p>` : ''}
        </td></tr>

        <!-- Corps -->
        <tr><td style="padding:36px 40px;">
          ${bodyHtml}
        </td></tr>

        <!-- Pied de page -->
        <tr><td style="background:#F7FAF9;padding:28px 40px;border-top:1px solid #E7EFEC;">
          <p style="margin:0 0 12px;color:#6B7C75;font-size:12px;line-height:1.7;text-align:center;">
            Une question ? Utilise le chat sur le site ou rejoins notre
            <a href="${WHATSAPP_URL}" style="color:${BRAND_GREEN};font-weight:700;text-decoration:none;">groupe WhatsApp</a>.
          </p>
          <p style="margin:0;color:#9AA79F;font-size:11px;text-align:center;">
            © 2026 AgedGmailYT. Tous droits réservés. ·
            <a href="${SITE_URL}" style="color:#9AA79F;text-decoration:underline;">${SITE_URL.replace('https://', '')}</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/** Ligne "clé / valeur" dans un encart, réutilisée par les différents emails. */
export function infoBox(rows: Array<{ label: string; value: string; big?: boolean; accent?: boolean }>): string {
  const rowsHtml = rows.map(r => `
    <tr>
      <td style="padding:${r.big ? '10px' : '6px'} 0;color:#6B7C75;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(r.label)}</td>
      <td style="padding:${r.big ? '10px' : '6px'} 0;color:${r.accent ? BRAND_GREEN : '#111827'};font-size:${r.big ? '20px' : '14px'};font-weight:${r.big ? '900' : '700'};text-align:right;">${r.value}</td>
    </tr>`).join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7FAF9;border:1px solid #E7EFEC;border-radius:12px;padding:20px 20px;margin:0 0 24px;">${rowsHtml}</table>`
}

export function ctaButton(href: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr><td style="background:${BRAND_GREEN};border-radius:10px;">
      <a href="${href}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`
}
