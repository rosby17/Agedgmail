const fs = require('fs');

function prepend(file, line) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes(line.split(' ')[1])) {
    fs.writeFileSync(file, line + '\n' + content);
  }
}

prepend('src/components/ui/ProductVisual.jsx', "import { resolveIcon } from '../../utils/helpers';");
prepend('src/views/MyOrdersView.jsx', "import { shortOrderId } from '../utils/helpers';");
prepend('src/views/ProductView.jsx', "import { sanitizeDescriptionHtml, displayCategoryLabel, cleanProductName } from '../utils/helpers';\nimport { Package, Minus, Plus, ShieldAlert } from 'lucide-react';");
prepend('src/views/AdminView.jsx', "import { netProfitOf, orderSupplierCost } from '../utils/helpers';");
prepend('src/views/RechargeView.jsx', "import { bonusPercentFor } from '../utils/helpers';\nimport { PAYMENT_GATEWAYS, BONUS_TIERS } from '../utils/constants';");
prepend('src/components/ui/DeliveredAccountCard.jsx', "import { parseAccountDelivery } from '../../lib/parseAccountDelivery';");
prepend('src/App.jsx', "import { X, MessageCircle, Headphones, Send } from 'lucide-react';");

let supplierAdmin = fs.readFileSync('src/views/SupplierAdmin.jsx', 'utf8');
supplierAdmin = supplierAdmin.replace(/cleanProductName\(o\.product_name, lang\)/g, "cleanProductName(o.product_name, 'fr')");
fs.writeFileSync('src/views/SupplierAdmin.jsx', supplierAdmin);
