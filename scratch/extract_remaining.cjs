const fs = require('fs');

const oldApp = fs.readFileSync('scratch/old_app.jsx', 'utf8');

function extractFunc(name) {
  const match = oldApp.match(new RegExp(`const ${name} = [\\s\\S]*?^};`, 'm')) || oldApp.match(new RegExp(`const ${name} =.*?;`, 'm'));
  return match ? match[0] : null;
}
function extractArray(name) {
  const match = oldApp.match(new RegExp(`const ${name} = \\[\\s\\S]*?^\\];`, 'm')) || oldApp.match(new RegExp(`const ${name} =.*?;`, 'm'));
  return match ? match[0] : null;
}

// Extract to helpers.js
let helpers = fs.readFileSync('src/utils/helpers.js', 'utf8');
['resolveIcon', 'netProfitOf', 'orderSupplierCost', 'shortOrderId', 'sanitizeDescriptionHtml', 'bonusPercentFor'].forEach(fn => {
  if (!helpers.includes(fn)) {
    const code = extractFunc(fn);
    if (code) helpers += '\n\n' + code.replace(`const ${fn}`, `export const ${fn}`);
  }
});
fs.writeFileSync('src/utils/helpers.js', helpers);

// Extract to constants.js
let constants = fs.readFileSync('src/utils/constants.js', 'utf8');
['PAYMENT_GATEWAYS', 'BONUS_TIERS'].forEach(arr => {
  if (!constants.includes(arr)) {
    const code = extractArray(arr);
    if (code) constants += '\n\n' + code.replace(`const ${arr}`, `export const ${arr}`);
  }
});
fs.writeFileSync('src/utils/constants.js', constants);

// Add missing imports
function prependImport(file, importStr) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes(importStr.split(' ')[1])) {
    content = content.replace(/(import React.*?;?)/, `$1\n${importStr}`);
    fs.writeFileSync(file, content);
  }
}

// App.jsx
prependImport('src/App.jsx', "import { X, MessageCircle, Headphones, Send } from 'lucide-react';");
// DeliveredAccountCard.jsx
prependImport('src/components/ui/DeliveredAccountCard.jsx', "import { parseAccountDelivery } from '../../lib/parseAccountDelivery';");
// ProductVisual.jsx
prependImport('src/components/ui/ProductVisual.jsx', "import { resolveIcon } from '../../utils/helpers';");
// AdminView.jsx
prependImport('src/views/AdminView.jsx', "import { netProfitOf, orderSupplierCost } from '../utils/helpers';");
let adminContent = fs.readFileSync('src/views/AdminView.jsx', 'utf8');
adminContent = adminContent.replace('const RevenueChart = ({', 'const RevenueChart = ({ lang,'); // fix lang in RevenueChart
fs.writeFileSync('src/views/AdminView.jsx', adminContent);

// MyOrdersView.jsx
prependImport('src/views/MyOrdersView.jsx', "import { shortOrderId } from '../utils/helpers';");

// ProductView.jsx
prependImport('src/views/ProductView.jsx', "import { displayCategoryLabel, cleanProductName, sanitizeDescriptionHtml } from '../utils/helpers';");
prependImport('src/views/ProductView.jsx', "import { Package, Minus, Plus, ShieldAlert } from 'lucide-react';");

// RechargeView.jsx
prependImport('src/views/RechargeView.jsx', "import { bonusPercentFor } from '../utils/helpers';\nimport { PAYMENT_GATEWAYS, BONUS_TIERS } from '../utils/constants';");

// SupplierAdmin.jsx -> wait, lang is not defined. Where is it used? In RevenueChart? No, SupplierAdmin doesn't take lang!
// We'll replace `lang` in SupplierAdmin with `'en'` since it doesn't take lang as prop.
let supplierAdmin = fs.readFileSync('src/views/SupplierAdmin.jsx', 'utf8');
supplierAdmin = supplierAdmin.replace(/\]\?\.\[lang\]/g, "]?.['en']");
supplierAdmin = supplierAdmin.replace(/\?\.\[lang\]/g, "?\.['en']");
supplierAdmin = supplierAdmin.replace(/\[lang\]/g, "['en']"); // fallback
fs.writeFileSync('src/views/SupplierAdmin.jsx', supplierAdmin);

console.log('Fixed remaining errors');
