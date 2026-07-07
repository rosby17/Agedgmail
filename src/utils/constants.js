export const ADMIN_EMAIL = "rooseveltmkr@gmail.com";

export const CATEGORIES = [
  { id: 'all', name: 'All products' },
  { id: 'email', name: 'Email (Gmail)' },
  { id: 'youtube_aged', name: 'Aged Youtube Channels' },
  { id: 'youtube_monetized', name: 'Monetized Channels' },
  { id: 'youtube_not_monetized', name: 'Non-Monetized Channels' },
  { id: 'youtube_cpa', name: 'Special Channels' },
  { id: 'facebook', name: 'Facebook Page' },
];

export const GROUP_LABELS = {
  gmail: 'Gmail', mail: 'Outlook & Mail', youtube: 'Youtube', discord: 'Discord', facebook: 'Facebook',
  instagram: 'Instagram', twitter: 'Twitter X', reddit: 'Reddit', tiktok: 'Tiktok', apple: 'Apple ID',
  telegram: 'Telegram', snapchat: 'Snapchat', github: 'GitHub', amazon: 'Amazon', other: 'Others',
};

export const GROUP_ORDER = ['gmail', 'mail', 'youtube', 'discord', 'facebook', 'instagram', 'twitter', 'reddit', 'tiktok', 'apple', 'telegram', 'snapchat', 'github', 'amazon', 'other'];

export const AVATAR_COLORS = ['#0D7A52', '#B45309', '#1D4ED8', '#BE185D', '#4338CA', '#0E7490', '#7C3AED'];

export const JUNK_CATEGORIES = ['accounts-telegram', 'amazon'];

export const SUPPLIERS = ['ytseller', 'smmshiba'];

export const API_BASE_URL = 'https://agedgmail.tools-cl.com/api/v2';

export const SUPPLIER_LABEL = { ytseller: 'YTSeller', smmshiba: 'SMMSHIBA' };

export const PAYMENT_GATEWAYS = [
  { id: 'binance_pay', name: 'Binance Pay', sub: 'Pay ID Binance', enabled: true, recommended: true, manual: false, icons: ['https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=032'], min: 0.5, fee: 0 },
  { id: 'usdt_trc20', name: 'USDT', sub: 'TRC20', enabled: true, manual: true, icons: ['https://cryptologos.cc/logos/tether-usdt-logo.svg?v=032'], min: 0.5, fee: 0 },
  { id: 'mobile_money', name: 'Mobile Money', sub: 'Orange, MTN, Wave...', enabled: true, manual: false, icons: ['https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg', 'https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg'], min: 2, fee: 10 },
];

export const BONUS_TIERS = [
  { amount: 5, pct: 0 },
  { amount: 10, pct: 0 },
  { amount: 50, pct: 1 },
  { amount: 100, pct: 2 },
];
