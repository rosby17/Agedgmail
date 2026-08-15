// Miroir frontend de supabase/functions/_shared/sms-services.ts — garder les
// deux fichiers synchronisés (runtimes Deno/Vite séparés dans ce projet).
// `iconSlug` = slug Simple Icons (cdn.simpleicons.org/<slug>) : reproductions
// officielles des logos de marque en SVG, licence libre — bien plus fidèle
// que des tracés SVG dessinés à la main.
export const SMS_SERVICES = [
  { id: 'youtube', labelFr: 'YouTube', labelEn: 'YouTube', isDefault: true, iconSlug: 'youtube', iconColor: 'FF0000' },
  { id: 'google', labelFr: 'Google', labelEn: 'Google', iconSlug: 'google', iconColor: '4285F4' },
  { id: 'whatsapp', labelFr: 'WhatsApp', labelEn: 'WhatsApp', iconSlug: 'whatsapp', iconColor: '25D366' },
  { id: 'telegram', labelFr: 'Telegram', labelEn: 'Telegram', iconSlug: 'telegram', iconColor: '26A5E4' },
  { id: 'discord', labelFr: 'Discord', labelEn: 'Discord', iconSlug: 'discord', iconColor: '5865F2' },
  { id: 'instagram', labelFr: 'Instagram', labelEn: 'Instagram', iconSlug: 'instagram', iconColor: 'E4405F' },
  { id: 'tiktok', labelFr: 'TikTok', labelEn: 'TikTok', iconSlug: 'tiktok', iconColor: '000000' },
];

export const DEFAULT_SMS_SERVICE = 'youtube';

export function getSmsService(id) {
  return SMS_SERVICES.find(s => s.id === id) || SMS_SERVICES.find(s => s.isDefault);
}
