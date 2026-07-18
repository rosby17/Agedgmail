#!/usr/bin/env node
// ============================================================================
// security-audit.mjs — Suite de validation REJOUABLE (Passe 3)
//
// Rejoue les attaques de logique applicative prouvées lors de l'audit du
// 2026-07-18 et vérifie qu'elles sont FERMÉES. À lancer après chaque déploiement
// pour prévenir toute régression.
//
// Usage :
//   SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_ANON_KEY=eyJ... \
//   [SUPABASE_SERVICE_ROLE_KEY=eyJ...  # optionnel : nettoyage complet auth.users] \
//   node scripts/security-audit.mjs
//
// - Crée 2 comptes de test éphémères (attaquant / victime) via signup (clé anon).
// - Rejoue : mass-assign INSERT, credit_balance, deduct_balance (griefing),
//   isolation profiles/orders, WITH CHECK orders, écriture admin (products),
//   spoof notifications, endpoint paiement sans JWT, scan du bundle JS,
//   en-têtes de sécurité.
// - Nettoie (rows profiles + reset solde ; auth.users si service key fournie).
// - Sortie : PASS/FAIL par test + code de sortie non nul si un test échoue.
// ============================================================================

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SITE = process.env.SITE_URL || 'https://agedgmail.tools-cl.com';
const FN_BASE = URL ? URL.replace('.supabase.co', '.functions.supabase.co') : '';

if (!URL || !ANON) {
  console.error('SUPABASE_URL et SUPABASE_ANON_KEY sont requis.');
  process.exit(2);
}

let pass = 0, fail = 0;
const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (ok) pass++; else fail++;
  console.log(`${ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const rnd = () => Math.random().toString(36).slice(2, 10);
async function signup(email, password) {
  const r = await fetch(`${URL}/auth/v1/signup`, {
    method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return r.json();
}
function rest(path, token, opts = {}) {
  return fetch(`${URL}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
}

async function main() {
  // ---- Provisionnement des comptes éphémères ---------------------------------
  const aEmail = `sectest_atk_${rnd()}@mailinator.com`, aPass = `Atk-${rnd()}-Aa1!`;
  const vEmail = `sectest_vic_${rnd()}@mailinator.com`, vPass = `Vic-${rnd()}-Aa1!`;
  const a = await signup(aEmail, aPass);
  const v = await signup(vEmail, vPass);
  const aTok = a.access_token, aId = a.user?.id;
  const vTok = v.access_token, vId = v.user?.id;
  if (!aTok || !vTok) { console.error('Signup a échoué (confirmation email requise ?).', a, v); process.exit(2); }

  // ---- 1. Mass-assignment sur INSERT profiles --------------------------------
  // Un utilisateur ne doit PAS pouvoir se fixer balance / is_admin.
  await rest('profiles', aTok, {
    method: 'POST', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ id: aId, email: aEmail, balance: 999999, is_admin: true }),
  });
  let row = await (await rest(`profiles?id=eq.${aId}&select=balance,is_admin`, aTok)).json();
  const bal = Number(row?.[0]?.balance || 0), adm = row?.[0]?.is_admin === true;
  record('mass-assign INSERT (balance)', bal === 0, `balance=${bal} (attendu 0)`);
  record('mass-assign INSERT (is_admin)', !adm, `is_admin=${adm} (attendu false)`);

  // Assure une ligne victime (balance 100) pour les tests suivants
  await rest('profiles', vTok, { method: 'POST', body: JSON.stringify({ id: vId, email: vEmail, balance: 100 }) });

  // ---- 2. credit_balance direct (imprimante à billets) -----------------------
  let r = await rest('rpc/credit_balance', aTok, { method: 'POST', body: JSON.stringify({ p_user_id: aId, p_amount: 1000000 }) });
  record('credit_balance direct bloqué', r.status === 403 || r.status === 404, `HTTP ${r.status} (attendu 403/404)`);

  // ---- 3. deduct_balance sur autrui (griefing) -------------------------------
  // Après correctif, la RPC paramétrée est révoquée pour `authenticated` :
  // l'appel doit être refusé (403 permission denied), quel que soit le solde.
  r = await rest('rpc/deduct_balance', aTok, { method: 'POST', body: JSON.stringify({ p_user_id: vId, p_amount: 1 }) });
  record('deduct_balance cross-user bloqué', r.status === 403 || r.status === 404, `HTTP ${r.status} (attendu 403/404)`);

  // ---- 4. Isolation lecture profiles -----------------------------------------
  row = await (await rest(`profiles?id=eq.${vId}&select=id`, aTok)).json();
  record('isolation SELECT profiles', Array.isArray(row) && row.length === 0, `${row.length} ligne(s) visible(s)`);

  // ---- 5. WITH CHECK sur orders (insert pour autrui) -------------------------
  r = await rest('orders', aTok, { method: 'POST', body: JSON.stringify({ user_id: vId, product_name: 'x', quantity: 1, total_price: 0, status: 'pending' }) });
  record('WITH CHECK orders', r.status === 403 || r.status === 401, `HTTP ${r.status} (attendu 403)`);

  // ---- 6. Écriture admin (products) par user normal --------------------------
  r = await rest('products', aTok, { method: 'POST', body: JSON.stringify({ name: 'x', price: 0.01, category: 'x' }) });
  record('écriture products bloquée', r.status === 403 || r.status === 401, `HTTP ${r.status} (attendu 403)`);

  // ---- 7. Spoof notifications ------------------------------------------------
  r = await rest('notifications', aTok, { method: 'POST', body: JSON.stringify({ user_id: vId, type: 'info', title: 'x', message: 'x' }) });
  record('spoof notifications bloqué', r.status === 403 || r.status === 401, `HTTP ${r.status} (attendu 403)`);

  // ---- 8. Endpoint paiement sans/avec JWT anon (userId du body) --------------
  if (FN_BASE) {
    r = await fetch(`${FN_BASE}/moneroo-initialize`, {
      method: 'POST', headers: { Authorization: `Bearer ${ANON}`, apikey: ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000000', email: 'p@p.com', amountUsd: 5 }),
    });
    // Corrigé : doit refuser (401/403) car userId != JWT. Vulnérable si 200/400 "Montant invalide".
    record('paiement exige JWT propriétaire', r.status === 401 || r.status === 403, `HTTP ${r.status} (attendu 401/403)`);
  }

  // ---- 9. Scan du bundle JS de prod (secrets + fournisseurs) -----------------
  try {
    const html = await (await fetch(SITE)).text();
    const asset = (html.match(/\/assets\/[\w.-]+\.js/) || [])[0];
    if (asset) {
      const js = await (await fetch(SITE + asset)).text();
      const secret = /service_role|xsmtpsib-|msk_[a-z0-9]{20,}|SUPABASE_SERVICE_ROLE/i.test(js);
      record('aucun secret serveur dans le bundle', !secret);
      const suppliers = (js.match(/pvapins|smscodes|5sim|agedsmm|smmshiba|ytseller/gi) || []);
      record('aucun nom de fournisseur amont dans le bundle', suppliers.length === 0, `${suppliers.length} occurrence(s)`);
    }
  } catch (e) { record('scan bundle', false, e.message); }

  // ---- 10. En-têtes de sécurité ----------------------------------------------
  try {
    const h = (await fetch(SITE)).headers;
    for (const [name, key] of [
      ['X-Frame-Options', 'x-frame-options'], ['X-Content-Type-Options', 'x-content-type-options'],
      ['Referrer-Policy', 'referrer-policy'], ['Permissions-Policy', 'permissions-policy'],
    ]) record(`header ${name}`, !!h.get(key), h.get(key) || 'absent');
  } catch (e) { record('headers', false, e.message); }

  // ---- Nettoyage -------------------------------------------------------------
  await rest('rpc/deduct_balance', aTok, { method: 'POST', body: JSON.stringify({ p_user_id: aId, p_amount: bal }) }).catch(() => {});
  if (SERVICE) {
    for (const id of [aId, vId]) {
      await fetch(`${URL}/rest/v1/profiles?id=eq.${id}`, { method: 'DELETE', headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } }).catch(() => {});
      await fetch(`${URL}/auth/v1/admin/users/${id}`, { method: 'DELETE', headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } }).catch(() => {});
    }
    console.log('\nNettoyage complet (profiles + auth.users) effectué.');
  } else {
    console.log(`\n⚠️  Sans SERVICE_ROLE_KEY, comptes de test à supprimer manuellement : ${aEmail} / ${vEmail}`);
  }

  console.log(`\n──────── ${pass} PASS · ${fail} FAIL ────────`);
  console.log(fail === 0 ? '🟢 VERDICT : toutes les protections tiennent.' : '🔴 VERDICT : régression(s) détectée(s) ci-dessus.');
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(2); });
