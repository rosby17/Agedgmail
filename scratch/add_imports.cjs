const fs = require('fs');

function addImport(file, importStr) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes(importStr)) {
    content = content.replace(/(import .*?;?)/, `$1\n${importStr}`);
    fs.writeFileSync(file, content);
  }
}

// App.jsx
addImport('src/App.jsx', "import { PRODUCTS as PRODUCTS_RAW } from './productsData';\nimport ProductView from './views/ProductView';");

// LandingView.jsx
addImport('src/views/LandingView.jsx', "import FAQSection from '../components/ui/FAQSection';");

// AuthView.jsx, SettingsTab.jsx, ResetPasswordView.jsx
['src/views/AuthView.jsx', 'src/views/SettingsTab.jsx', 'src/views/ResetPasswordView.jsx'].forEach(f => {
  addImport(f, "import { friendlyAuthError } from '../utils/helpers';");
});

// SupplierAdmin.jsx
addImport('src/views/SupplierAdmin.jsx', "import { SUPPLIER_LABEL } from '../utils/constants';");

// And we need to remove FAQSection from App.jsx if it is still there!
let appContent = fs.readFileSync('src/App.jsx', 'utf8');
appContent = appContent.replace(/const FAQSection = [\s\S]*?^};\n/m, '');
fs.writeFileSync('src/App.jsx', appContent);

console.log('Imports added');
