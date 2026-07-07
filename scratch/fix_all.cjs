const fs = require('fs');

// 1. Fix constants.js
let cleanConstants = fs.readFileSync('scratch/constants_clean.js', 'utf8');
cleanConstants += `\nexport const SUPPLIER_LABEL = { ytseller: 'YTSeller', smmshiba: 'SMMSHIBA' };\n`;
fs.writeFileSync('src/utils/constants.js', cleanConstants);

// 2. Add missing imports safely
function addImportSafe(file, importStr) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes(importStr)) {
    // Find the first import React... line
    content = content.replace(/(import React.*?from ['"]react['"];?)/, `$1\n${importStr}`);
    fs.writeFileSync(file, content);
  }
}

addImportSafe('src/App.jsx', "import { PRODUCTS as PRODUCTS_RAW } from './productsData';\nimport ProductView from './views/ProductView';");
addImportSafe('src/views/LandingView.jsx', "import FAQSection from '../components/ui/FAQSection';");
['src/views/AuthView.jsx', 'src/views/SettingsTab.jsx', 'src/views/ResetPasswordView.jsx'].forEach(f => {
  addImportSafe(f, "import { friendlyAuthError } from '../utils/helpers';");
});
addImportSafe('src/views/SupplierAdmin.jsx', "import { SUPPLIER_LABEL } from '../utils/constants';");

// 3. Ensure App.jsx has no FAQSection
let appContent = fs.readFileSync('src/App.jsx', 'utf8');
appContent = appContent.replace(/const FAQSection = [\s\S]*?^};\n/m, '');
fs.writeFileSync('src/App.jsx', appContent);

console.log('Fixed completely');
