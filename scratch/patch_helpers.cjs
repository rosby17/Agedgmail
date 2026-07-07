const fs = require('fs');

let helpers = fs.readFileSync('src/utils/helpers.js', 'utf8');

if (!helpers.includes('import { BONUS_TIERS }')) {
  helpers = "import { BONUS_TIERS } from './constants';\n" + helpers;
}

const missingHelpers = `

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
    .replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '')
    .replace(/on\\w+="[^"]*"/gi, '')
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
`;

if (!helpers.includes('resolveIcon')) {
  helpers += missingHelpers;
  fs.writeFileSync('src/utils/helpers.js', helpers);
}

let constants = fs.readFileSync('src/utils/constants.js', 'utf8');
const missingConstants = `

export const PAYMENT_GATEWAYS = [
  { id: 'binance_pay', name: 'Binance Pay', sub: 'Pay ID Binance', enabled: true, symbol: '🅑', min: 0.5, recommended: true },
  { id: 'usdt_trc20', name: 'USDT', sub: 'TRC20', enabled: true, symbol: '₮', manual: true, min: 0.5 },
  { id: 'mobile_money', name: 'Mobile Money', sub: 'Bientôt', enabled: false, symbol: '📱' },
];

export const BONUS_TIERS = [
  { amount: 100, pct: 1 },
  { amount: 500, pct: 2 },
  { amount: 1000, pct: 3 },
  { amount: 10000, pct: 4 },
];
`;
if (!constants.includes('PAYMENT_GATEWAYS')) {
  constants += missingConstants;
  fs.writeFileSync('src/utils/constants.js', constants);
}

// Ensure the files importing them are updated
function addImportSafe(file, importStr) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes(importStr.split(' ')[1]) && !content.includes(importStr.split(' ')[3])) {
    content = content.replace(/(import React.*?from ['"]react['"];?)/, `$1\n${importStr}`);
    fs.writeFileSync(file, content);
  }
}

addImportSafe('src/components/ui/ProductVisual.jsx', "import { resolveIcon } from '../../utils/helpers';");
addImportSafe('src/views/MyOrdersView.jsx', "import { shortOrderId } from '../utils/helpers';");
addImportSafe('src/views/ProductView.jsx', "import { sanitizeDescriptionHtml } from '../utils/helpers';");
addImportSafe('src/views/AdminView.jsx', "import { netProfitOf, orderSupplierCost } from '../utils/helpers';");
addImportSafe('src/views/RechargeView.jsx', "import { bonusPercentFor } from '../utils/helpers';\nimport { PAYMENT_GATEWAYS, BONUS_TIERS } from '../utils/constants';");

// Missing parseAccountDelivery in DeliveredAccountCard.jsx
addImportSafe('src/components/ui/DeliveredAccountCard.jsx', "import { parseAccountDelivery } from '../../lib/parseAccountDelivery';");

// Missing icons in App.jsx
addImportSafe('src/App.jsx', "import { X, MessageCircle, Headphones, Send } from 'lucide-react';");

console.log('Helpers and constants patched.');
