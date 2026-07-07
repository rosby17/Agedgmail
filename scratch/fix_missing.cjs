const fs = require('fs');

const oldApp = fs.readFileSync('scratch/old_app.jsx', 'utf8');

function extractFunc(name) {
  const regex = new RegExp(`const ${name} = [\\s\\S]*?^};`, 'm');
  const match = oldApp.match(regex);
  return match ? match[0] : '';
}

// 1. friendlyAuthError -> utils/helpers.js
let helpers = fs.readFileSync('src/utils/helpers.js', 'utf8');
const friendlyAuthErrorMatch = oldApp.match(/(const friendlyAuthError = [\s\S]*?^};)/m);
if (friendlyAuthErrorMatch && !helpers.includes('friendlyAuthError')) {
  helpers += '\n\n' + friendlyAuthErrorMatch[1].replace('const friendlyAuthError', 'export const friendlyAuthError');
  fs.writeFileSync('src/utils/helpers.js', helpers);
}

// 2. SUPPLIER_LABEL -> utils/constants.js
let constants = fs.readFileSync('src/utils/constants.js', 'utf8');
const supplierLabelMatch = oldApp.match(/(const SUPPLIER_LABEL = [\s\S]*?^};)/m);
if (supplierLabelMatch && !constants.includes('SUPPLIER_LABEL')) {
  constants += '\n\n' + supplierLabelMatch[1].replace('const SUPPLIER_LABEL', 'export const SUPPLIER_LABEL');
  fs.writeFileSync('src/utils/constants.js', constants);
}

// 3. FAQSection -> components/ui/FAQSection.jsx
const faqSectionCode = extractFunc('FAQSection');
if (faqSectionCode && !fs.existsSync('src/components/ui/FAQSection.jsx')) {
  const faqFile = `import React, { useState } from 'react';\n\n${faqSectionCode}\n\nexport default FAQSection;`;
  fs.writeFileSync('src/components/ui/FAQSection.jsx', faqFile);
}

// 4. ProductView -> views/ProductView.jsx
const productViewCode = oldApp.match(/(const ProductView = [\s\S]*?^};)/m);
if (productViewCode && !fs.existsSync('src/views/ProductView.jsx')) {
  const pvFile = `import React, { useState, useEffect } from 'react';\nimport { ShoppingCart, Share2, Copy, CheckCircle, Info, Hash, Star } from 'lucide-react';\nimport { hashStr, getProductDetails } from '../utils/helpers';\nimport ProductVisual from '../components/ui/ProductVisual';\n\n${productViewCode[1]}\n\nexport default ProductView;`;
  fs.writeFileSync('src/views/ProductView.jsx', pvFile);
}

// 5. RevenueChart, RecentActivityTable, ClientManagement -> AdminView.jsx
const revenueChartCode = extractFunc('RevenueChart');
const recentActivityTableCode = extractFunc('RecentActivityTable');
const clientManagementCode = extractFunc('ClientManagement');

let adminView = fs.readFileSync('src/views/AdminView.jsx', 'utf8');
// remove the broken ProductView from AdminView
adminView = adminView.replace(/const ProductView = [\s\S]*?^};/m, '');

if (revenueChartCode && !adminView.includes('RevenueChart =')) {
  adminView = adminView.replace('const AdminView =', `${revenueChartCode}\n\n${recentActivityTableCode}\n\n${clientManagementCode}\n\nconst AdminView =`);
}
fs.writeFileSync('src/views/AdminView.jsx', adminView);

console.log('Done');
