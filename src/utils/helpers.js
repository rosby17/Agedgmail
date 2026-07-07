import { BONUS_TIERS } from './constants';
import { CATEGORIES, GROUP_LABELS, AVATAR_COLORS, JUNK_CATEGORIES } from './constants';

export const categoryName = (cat) => CATEGORIES.find(c => c.id === cat)?.name || cat || 'Others';

export const hashStr = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

export const detectFromText = (text) => {
  const t = text;
  if (t.includes('youtube')) return 'youtube';
  if (t.includes('facebook')) return 'facebook';
  if (t.includes('github')) return 'github';
  if (t.includes('instagram')) return 'instagram';
  if (t.includes('tiktok') || t.includes('tik tok')) return 'tiktok';
  if (t.includes('reddit')) return 'reddit';
  if (t.includes('twitter') || t.includes('/x') || t === 'x' || / x[)\s]/.test(t)) return 'twitter';
  if (t.includes('discord')) return 'discord';
  if (t.includes('icloud') || t.includes('apple')) return 'apple';
  if (t.includes('telegram')) return 'telegram';
  if (t.includes('sms')) return 'sms';
  if (t.includes('snapchat')) return 'snapchat';
  if (t === 'email' || t.includes('gmail')) return 'gmail';
  if (t.includes('gmx') || t.includes('rambler') || t.includes('mail ru') || t.includes('mail.ru') || t.includes('hotmail') || t.includes('outlook')) return 'mail';
  if (t.includes('amazon')) return 'amazon';
  return null;
};

export const categoryVisual = (product = {}) => {
  if (typeof product === 'string') product = { category: product };
  const cat = String(product.category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  
  if (name.includes('github')) return 'github';

  const isJunkCategory = JUNK_CATEGORIES.some(j => cat === j || cat.includes(j));

  if (isJunkCategory) {
    return detectFromText(name) || detectFromText(cat) || 'other';
  }
  return detectFromText(cat) || detectFromText(name) || 'other';
};

export const displayCategoryLabel = (product = {}) => {
  const cat = String(product.category || '').toLowerCase();
  const isJunkCategory = JUNK_CATEGORIES.some(j => cat === j || cat.includes(j));
  if (isJunkCategory) return GROUP_LABELS[categoryVisual(product)] || categoryName(product.category);
  return categoryName(product.category);
};

export const cleanProductName = (raw, lang) => {
  if (!raw) return raw;
  if (!lang) lang = typeof window !== 'undefined' ? (localStorage.getItem('agedgmail_lang') || 'fr') : 'fr';
  let s = String(raw).trim();

  const toRemove = [
    /【[^】]+】/g,
    /\[[^\]]+\]/g,
    /\|.*$/,
    /\\.*$/,
    /-\s*$/,
    /^[-\s]+/
  ];

  toRemove.forEach(regex => {
    s = s.replace(regex, '').trim();
  });

  const words = s.split(/\s+/);
  if (words.length > 2 && words[0] === words[words.length - 1]) {
    words.pop();
    s = words.join(' ');
  }

  const parts = s.split(' - ');
  if (parts.length === 2 && parts[0] === parts[1]) {
    s = parts[0];
  }

  const isEmail = (str) => /^[a-zA-Z0-9]+(gmail|outlook|hotmail|mail|gmx)/i.test(str) && str.length < 20;
  if (isEmail(s)) {
    return lang === 'fr' ? 'Compte Email Aléatoire' : 'Random Email Account';
  }

  return s || raw;
};

export const getProductDetails = (product = {}) => {
  const c = String(product.category || '').toLowerCase();
  const n = String(product.name || '').toLowerCase();
  
  const has = (terms) => terms.some(t => c.includes(t) || n.includes(t));
  
  return {
    year: (n.match(/(?:20|19)\d{2}/) || c.match(/(?:20|19)\d{2}/))?.[0] || 'New',
    subscribers: (n.match(/(\d+[kK]?)\s*(?:sub|subs|subscriber)/) || c.match(/(\d+[kK]?)\s*(?:sub|subs|subscriber)/))?.[1] || '0',
    monetized: has(['monetized', 'monetization']),
    phoneVerified: has(['pva', 'phone verified', 'sms verified', 'number verified', 'number added']),
    emailVerified: has(['eva', 'email verified', 'email added']),
    twoFa: has(['2fa', '2 step']),
    cookies: has(['cookie', 'cookies', 'token', 'auth_token']),
    format: product.description?.match(/Format:\s*([^\n]+)/i)?.[1] || 'Email:Password:Recovery',
  };
};


export const friendlyAuthError = (raw = '') => {
  const m = raw.toLowerCase();
  if (m.includes('invalid login credentials')) return "Email ou mot de passe incorrect.";
  if (m.includes('email not confirmed')) return "Ton email n'est pas encore confirmé. Vérifie ta boîte mail (et les spams).";
  if (m.includes('user already registered') || m.includes('already been registered')) return "Un compte existe déjà avec cet email. Connecte-toi.";
  if (m.includes('password should be at least')) return "Le mot de passe doit contenir au moins 6 caractères.";
  if (m.includes('unable to validate email') || m.includes('invalid email')) return "Adresse email invalide.";
  if (m.includes('rate limit') || m.includes('too many')) return "Trop de tentatives. Patiente une minute avant de réessayer.";
  // Panne d'envoi d'email côté serveur (SMTP non configuré ou en échec) —
  // ne pas laisser le message technique brut de Supabase s'afficher.
  if (m.includes('error sending confirmation') || m.includes('error sending recovery') || m.includes('sending email')) {
    return "Impossible d'envoyer l'email pour le moment. Réessaie dans un instant ou contacte le support si le problème persiste.";
  }
  return raw || "Une erreur est survenue. Réessaie.";
};

export const resolveIcon = (product = {}) => {
  const cat = String(product.category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  const has = (s) => cat.includes(s) || name.includes(s);
  if (has('snapchat')) return 'snapchat';
  // categoryVisual must be defined before resolveIcon, which it is in helpers.js!
  const bucket = categoryVisual(product);
  if (bucket === 'mail' && (has('outlook') || has('hotmail'))) return 'outlook';
  return bucket;
};

export const shortOrderId = (uuid = '') => {
  const hex = String(uuid).replace(/-/g, '').slice(0, 8);
  const num = parseInt(hex, 16) || 0;
  return String(num % 1000000).padStart(6, '0');
};

export function sanitizeDescriptionHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

export const orderSupplierCost = (order, mappings = []) => {
  if (order.supplier_cost !== undefined && order.supplier_cost !== null) return order.supplier_cost;
  const m = mappings.find(map => map.product_id === order.product_id);
  if (m) return (m.supplier_rate || 0) * (order.quantity || 1);
  return 0;
};

export const netProfitOf = (ordersList, mappings = []) => {
  return ordersList.reduce((sum, o) => sum + (o.total_price || 0) - orderSupplierCost(o, mappings), 0);
};

export const bonusPercentFor = (amountUsd) => {
  return [...BONUS_TIERS].reverse().find(t => amountUsd >= t.amount)?.pct || 0;
};
