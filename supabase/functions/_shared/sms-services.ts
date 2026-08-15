// ============================================================
// _shared/sms-services.ts
// Catalogue canonique des services SMS proposés (YouTube en défaut/mis en
// avant + 6 autres). Chaque entrée porte les identifiants réels par
// fournisseur, confirmés en direct (pas de valeur devinée) :
// - 5sim : slug produit (catalogue complet fourni par le client).
// - SMSCodes : ServiceID réel via GetServiceCodes (confirmé en direct).
// - PVAPins : substrings pour filtrer le champ texte libre `app` de
//   get_rates.php (confirmé en direct — tous les services suivent le même
//   pattern "Nom" + variantes numérotées, ex: "Whatsapp 44", "Telegram 11").
// Miroir manuel : src/utils/smsServices.js (runtimes Deno/Vite séparés, pas
// de partage de code direct dans ce projet — garder les deux en phase).
// ============================================================

export interface SmsServiceDef {
  id: string
  labelFr: string
  labelEn: string
  isDefault?: boolean
  fiveSimProduct: string
  smscodesServiceId: string
  pvaSubstrings: string[]
}

export const SMS_SERVICES: Record<string, SmsServiceDef> = {
  youtube: {
    id: 'youtube', labelFr: 'YouTube', labelEn: 'YouTube', isDefault: true,
    fiveSimProduct: 'google',
    smscodesServiceId: '8a97735e-9a14-427e-8a88-e9d999bf3429',
    pvaSubstrings: ['youtube'],
  },
  google: {
    id: 'google', labelFr: 'Google', labelEn: 'Google',
    fiveSimProduct: 'google',
    smscodesServiceId: '448bde1b-ac9c-4c19-a615-f135d3a13007', // "Google/Gmail"
    pvaSubstrings: ['google'],
  },
  whatsapp: {
    id: 'whatsapp', labelFr: 'WhatsApp', labelEn: 'WhatsApp',
    fiveSimProduct: 'whatsapp',
    smscodesServiceId: 'e3338bca-1954-4106-b187-cf6156e5ad55',
    pvaSubstrings: ['whatsapp'],
  },
  telegram: {
    id: 'telegram', labelFr: 'Telegram', labelEn: 'Telegram',
    fiveSimProduct: 'telegram',
    smscodesServiceId: '46647fac-4f5c-4bee-9869-ea2f2dba87cc',
    pvaSubstrings: ['telegram'],
  },
  discord: {
    id: 'discord', labelFr: 'Discord', labelEn: 'Discord',
    fiveSimProduct: 'discord',
    smscodesServiceId: '03b498e8-1fe8-4eff-b4d1-4a4a9e18978b',
    pvaSubstrings: ['discord'],
  },
  instagram: {
    id: 'instagram', labelFr: 'Instagram', labelEn: 'Instagram',
    fiveSimProduct: 'instagram',
    smscodesServiceId: '13946f2b-2cad-48d3-8231-4292b4235c27',
    pvaSubstrings: ['instagram'],
  },
  tiktok: {
    id: 'tiktok', labelFr: 'TikTok', labelEn: 'TikTok',
    fiveSimProduct: 'tiktok',
    smscodesServiceId: '0c735c63-6a11-4218-8f7c-142e3ef12478',
    pvaSubstrings: ['tiktok'],
  },
}

export const DEFAULT_SMS_SERVICE = 'youtube'

/** Résout un slug canonique envoyé par le client vers sa définition, avec repli sûr sur youtube. */
export function resolveSmsService(id: string | undefined | null): SmsServiceDef {
  return (id && SMS_SERVICES[id]) || SMS_SERVICES[DEFAULT_SMS_SERVICE]
}
