// Miroir frontend de supabase/functions/_shared/sms-services.ts — garder les
// deux fichiers synchronisés (runtimes Deno/Vite séparés dans ce projet).
export const SMS_SERVICES = [
  { id: 'youtube', labelFr: 'YouTube', labelEn: 'YouTube', isDefault: true, icon: 'YouTubeLogo' },
  { id: 'google', labelFr: 'Google', labelEn: 'Google', icon: 'GoogleLogo' },
  { id: 'whatsapp', labelFr: 'WhatsApp', labelEn: 'WhatsApp', icon: 'WhatsAppLogo' },
  { id: 'telegram', labelFr: 'Telegram', labelEn: 'Telegram', icon: 'TelegramLogo' },
  { id: 'discord', labelFr: 'Discord', labelEn: 'Discord', icon: 'DiscordLogo' },
  { id: 'instagram', labelFr: 'Instagram', labelEn: 'Instagram', icon: 'InstagramLogo' },
  { id: 'tiktok', labelFr: 'TikTok', labelEn: 'TikTok', icon: 'TikTokLogo' },
];

export const DEFAULT_SMS_SERVICE = 'youtube';

export function getSmsService(id) {
  return SMS_SERVICES.find(s => s.id === id) || SMS_SERVICES.find(s => s.isDefault);
}
