// Test autonome (pas de framework — le projet n'a ni Jest ni Vitest).
// Exécuter avec : node scripts/test-parseAccountDelivery.mjs
import { parseAccountDelivery } from '../src/lib/parseAccountDelivery.js';

let passed = 0;
let failed = 0;

function normalize(obj) {
  return JSON.stringify(
    Object.keys(obj).sort().reduce((acc, k) => { acc[k] = obj[k]; return acc; }, {}),
  );
}

function check(name, actual, expected) {
  const ok = normalize(actual) === normalize(expected);
  if (ok) {
    passed++;
    console.log(`✓ ${name}`);
  } else {
    failed++;
    console.error(`✗ ${name}`);
    console.error(`  attendu: ${JSON.stringify(expected)}`);
    console.error(`  obtenu : ${JSON.stringify(actual)}`);
  }
}

// 1. Email + mot de passe seuls (aucun champ optionnel).
check(
  'email + password seuls',
  parseAccountDelivery('user@gmail.com:MyPass123'),
  { email: 'user@gmail.com', password: 'MyPass123' },
);

// 2. Tous les champs présents, y compris app password (16) et TOTP (32),
// avec espaces à nettoyer.
check(
  'tous les champs présents',
  parseAccountDelivery(
    'user@gmail.com:MyPass123:recovery@yahoo.com:RecPass456:abcd efgh ijkl mnop:qwer tyui opas dfgh jklz xcvb nmqw ertY',
  ),
  {
    email: 'user@gmail.com',
    password: 'MyPass123',
    recoveryEmail: 'recovery@yahoo.com',
    recoveryPassword: 'RecPass456',
    appPassword: 'abcdefghijklmnop',
    totpSecret: 'qwertyuiopasdfghjklzxcvbnmqwertY',
  },
);

// 3. Récupération présente, mais sans app password ni TOTP.
check(
  'récupération sans 2FA/app password',
  parseAccountDelivery('user2@gmail.com:Pass789:recovery2@outlook.com:RecPass000'),
  {
    email: 'user2@gmail.com',
    password: 'Pass789',
    recoveryEmail: 'recovery2@outlook.com',
    recoveryPassword: 'RecPass000',
  },
);

// 4. Uniquement une clé TOTP (32 car.), sans récupération ni app password —
// vérifie que la distinction par longueur fonctionne même seule.
check(
  'TOTP seul (32 caractères), sans récupération',
  parseAccountDelivery('user3@gmail.com:Pass111:qwer tyui opas dfgh jklz xcvb nmqw ertY'),
  {
    email: 'user3@gmail.com',
    password: 'Pass111',
    totpSecret: 'qwertyuiopasdfghjklzxcvbnmqwertY',
  },
);

// 5. Format cassé (email manquant) — doit lever une erreur, pas planter
// silencieusement ni renvoyer un objet à moitié rempli.
try {
  parseAccountDelivery(':OnlyPassword');
  failed++;
  console.error('✗ format cassé : aurait dû lever une erreur');
} catch (err) {
  passed++;
  console.log(`✓ format cassé lève bien une erreur (${err.code})`);
}

console.log(`\n${passed} réussi(s), ${failed} échoué(s).`);
process.exit(failed > 0 ? 1 : 0);
