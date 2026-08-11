# Security & UX Audit — agedgmail.tools-cl.com

Date: 2026-08-10
Scope: `supabase/functions/`, `supabase/migrations/`, `src/` (Vite+React)

---

## 1. Executive Summary

1. **CRITICAL — Binance Pay deposit replay/theft.** `binance-submit-tx/index.ts` has no auth/ownership check and no replay protection: any logged-in user can attach the same real (already-received) Binance Pay `orderId` to multiple of their own pending deposit orders and get auto-credited each time. A single $10 real payment can be turned into unlimited free balance. This is the highest-severity finding in the whole audit.
2. **HIGH — `binance-submit-tx` is also a pure IDOR.** It takes `{orderId, binanceOrderId}` from the request body with zero `auth.getUser()` call, so any authenticated (or even anon-key) caller can attach a transaction ID to *any other user's* pending order, not just their own.
3. **CONFIRMED — hardcoded admin email is the only real admin gate; `profiles.is_admin` is decorative.** All money-moving RPCs/functions check `auth.jwt()->>'email' = 'rooseveltmkr@gmail.com'` (or an edge-function-local `ADMIN_EMAIL` constant), never `is_admin`. The admin panel's "Promouvoir admin" toggle (`admin_set_admin` RPC) updates a column nothing else reads — it grants no actual access to money endpoints. Misleading UI, wasted admin trust.
4. **CONFIRMED — CORS wildcard on ~20 of 24 edge functions.** Only `sms-get-number` and `maketou-create-checkout` use the origin-allowlisting `getCorsHeaders()`; everything else (`admin-deliver-order`, `binance-*`, `dropship-*`, `api-v2`, `maketou-poll-pending`, `maketou-verify`, `sms-cancel`, `sms-check-code`, `sms-get-prices`, `support-notify`, `get-exchange-rate`, `moneroo-*`) hardcodes `Access-Control-Allow-Origin: '*'`. Real severity is moderate, not critical, because auth is Bearer-JWT-in-header (not cookies) — a third-party origin can't silently ride the user's session; exploitation needs the token to leak first (XSS, log exposure). Still worth fixing for defense-in-depth and to stop it masking future cookie-based auth changes.
5. **CONFIRMED — `admin-deliver-order` only excludes `status === 'cancelled'`,** not gated to `pending`/`processing`/`confirmed`. An admin (or a bug in the admin UI) can "deliver" an order that's already `delivered`, re-sending delivery emails/stock draws. Low severity, data-integrity only.
6. **NEW — bonus-tier drift between client and server is real and currently wrong, not just a duplication risk.** `src/utils/constants.js` `BONUS_TIERS` (5/10/50/100 → 0/0/1/2%) is a *completely different scale* from the server-authoritative tiers in `binance-create-order` and `binance-confirm-manual` (100/500/1000/10000 → 1/2/3/4%). Customers are shown one bonus percentage before/at checkout and credited a different (server-computed) one — a trust/support-ticket problem, not a security hole, since the server is authoritative.
7. **NEW — customer-facing order status labels hide the confirmed/delivered split that was just built.** `MyOrdersView.jsx` renders both `confirmed` and `delivered` with the same green "Succès / Completed" badge (lines ~128-129), while `OrdersAdmin.jsx` correctly distinguishes "Payé (non livré)" vs "Livrée". A customer whose order is paid but not yet fulfilled currently sees the same "completed" state as one who already received their account.
8. **CONFIRMED SOUND — balance/admin RPC hardening (`20260718120000_balance_authz_hardening.sql`, `20260718140000_admin_user_moderation_rpcs.sql`) is well built:** `credit_balance`/`deduct_balance` are REVOKEd from `authenticated`, replaced by `spend_own_balance`/`transfer_credits`/`admin_adjust_balance` which all derive actor identity from `auth.uid()`/`auth.jwt()` server-side, use `FOR UPDATE` row locks, and are non-negative-floored. Profile mass-assignment is closed via a `BEFORE INSERT` trigger that forces `balance/is_admin/vendor_balance/is_suspended` regardless of client payload. `binance-confirm-manual` spot-check confirms: JWT verified, admin-email gated, idempotent (checks status before crediting), bonus recomputed server-side.
9. **Dead code confirmed safe to remove:** `test_prices.js`, `test_pva.js`, `test_pva_countries.ts` at repo root are standalone SMS-provider debug scripts (no imports from `src/` or `supabase/functions/`, not referenced by any build config). Also flag `supabase/functions/moneroo-*` and `scratch-test` as dead/unused edge functions — no `src/` reference to Moneroo anywhere, yet the functions remain deployed and reachable (signature-verified webhook is fine, but it's needless surface for a gateway that's been replaced by Binance Pay + Mobile Money).
10. **Sanitization is solid where it matters, one weak spot.** `sanitizeDescriptionHtml` (product descriptions) is a real DOMParser-based allowlist sanitizer — good. `SettingsTab.jsx:515` sanitizes an MFA QR code SVG/HTML with a hand-rolled `<script>`/`on\w+=` regex strip before `dangerouslySetInnerHTML` — this is a much weaker, bypassable pattern (e.g. `<img src=x onerror=...>` variants, SVG `<foreignObject>`, obfuscated handlers can slip past naive regex). Since the QR content here is server/library-generated (not user input), current risk is low, but the pattern itself should not be trusted if that code path is ever fed external data.

---

## 2. Critical Security Findings

### 2.1 Binance Pay deposit replay — credit the same payment multiple times (CRITICAL)
**File:** `supabase/functions/binance-submit-tx/index.ts:27-51`, `supabase/functions/_shared/binance.ts:63-80`

`binance-submit-tx` takes `{orderId, binanceOrderId}` and, if `findMatchingIncomingPayment()` finds a real incoming Binance Pay transaction with that `orderId` and an amount matching `order.expected_amount` (±$0.01, looked up in the last 48h of the merchant's own Pay history), it immediately calls `credit_balance` and marks the order `confirmed` — no human in the loop.

The match function (`_shared/binance.ts:63-80`) only checks: same Binance `orderId`, positive amount, correct receiver UID, amount within 1 cent of the order's `expected_amount`. It does **not** check whether that `binanceOrderId` has already been consumed by a previously-confirmed order, and there is no unique constraint on `orders.binance_tx_id` (confirmed via `grep -rn "binance_tx_id"` across migrations — no `UNIQUE` index exists).

**Exploit:** A user makes one legitimate $50 Binance Pay payment (real `orderId` X). They then create N pending deposit orders for $50 each via `binance-create-order` (which is otherwise correctly auth-checked), and call `binance-submit-tx` with the same `binanceOrderId: X` against each pending order in turn. Each call independently re-queries Binance's transaction history, finds the same real transaction X still matches (amount + orderId), and credits the balance again. A single $50 payment becomes $50×N of free balance.

**Fix:** Before crediting, check that `binanceOrderId` is not already present on any other `orders` row with `status IN ('confirmed','delivered')` (or add a `UNIQUE` constraint on `binance_tx_id` scoped to confirmed/successful states), and reject/no-op if it's a reuse. Do this check inside the same transaction as the credit RPC to avoid a TOCTOU race between two concurrent submissions of the same tx id.

### 2.2 Binance Pay `binance-submit-tx` has no ownership/auth check (HIGH, compounds 2.1)
**File:** `supabase/functions/binance-submit-tx/index.ts:14-25`

Unlike `binance-create-order` (which correctly does `authClient.auth.getUser(authJwt)` and checks `userId !== authData.user.id` → 403), `binance-submit-tx` never calls `getUser()` at all. It goes straight from `req.json()` to a `service_role` Supabase client and operates on whatever `orderId` is supplied. There is no `verify_jwt` entry for this function in `supabase/config.toml` either, so it likely runs at the platform default (gateway requires *a* valid JWT, but the public anon key itself is a valid JWT — so effectively anyone, logged in or not, who has the anon key can call it).

**Exploit:** Attach an arbitrary `binanceOrderId` to any other user's pending order by ID (order IDs are sequential/guessable UUIDs are not brute-forceable, but are visible to the order's owner in the UI/URL and could leak via referrer, screenshots, support tickets, etc.). Combined with 2.1, this also means an attacker doesn't even need their *own* pending order — they can point their real transaction at someone else's pending order via IDOR, colliding with that other order's `expected_amount` if it happens to match, or simply griefing another user's pending deposit by writing garbage into `binance_tx_id` and burning their one shot at auto-match.

**Fix:** Add the same `authClient.auth.getUser()` + `order.user_id === authData.user.id` check as `binance-create-order`, and set `verify_jwt = true` explicitly in `config.toml` for this function.

### 2.3 Hardcoded admin email is the sole authority; `is_admin` column is not wired to anything (CONFIRMED)
**Files:** `supabase/functions/admin-deliver-order/index.ts:12`, `supabase/functions/binance-confirm-manual/index.ts:12`, `supabase/functions/_shared/supplier-db.ts:7`, `src/utils/constants.js:1`, `supabase/migrations/20260718140000_admin_user_moderation_rpcs.sql`

Every money-moving server check does `auth.jwt()->>'email' = 'rooseveltmkr@gmail.com'` or an edge-function-local `const ADMIN_EMAIL = 'rooseveltmkr@gmail.com'`. `admin_set_admin(p_user_id, p_is_admin)` (in `20260718140000_admin_user_moderation_rpcs.sql`) updates `profiles.is_admin`, and `ClientManagement`'s `toggleAdmin` calls it — but grep across `supabase/functions/` shows **no function reads `is_admin`** to gate any action. This is not itself a vulnerability (the hardcoded-email checks are actually the more bulletproof mechanism, since `is_admin` is just a mutable column), but it means:
- The admin panel's "Promote to admin" button is **functionally a no-op** for granting real admin power over orders/balances/deliveries — it only affects whatever (if anything) client-side code branches on `profile.is_admin` for UI purposes.
- If the owner ever needs a second admin, none of the money endpoints will recognize them without also editing 5 separate hardcoded strings.

**Fix:** Either (a) remove/relabel the `is_admin` toggle as "internal flag only, does not grant panel access" to stop misleading whoever operates the panel, or (b) migrate all the hardcoded-email checks to check `is_admin` from a `SECURITY DEFINER` lookup (keeping the hardcoded owner email as an unconditional bootstrap/fallback so the owner can't lock themselves out). Also extract the repeated `ADMIN_EMAIL` constant into one `_shared/admin.ts` to stop the 5-way duplication risk of a typo desyncing them.

### 2.4 CORS: wildcard `Access-Control-Allow-Origin: '*'` on most functions (CONFIRMED, MODERATE)
Verified today, file:line for every function under `supabase/functions/*/index.ts`:

| Function | CORS |
|---|---|
| `admin-deliver-order:15` | `'*'` |
| `api-v2:22` | `'*'` |
| `binance-confirm-manual:27` | `'*'` |
| `binance-create-order:20` | `'*'` |
| `binance-expire-stale:12` | `'*'` |
| `binance-submit-tx:20` | `'*'` |
| `cancel-stale-orders:14` | `'*'` |
| `dropship-place-order` (via `_shared/supplier-db.ts` `corsHeaders`) | `'*'` |
| `dropship-poll-orders` (same) | `'*'` |
| `get-exchange-rate:4` | `'*'` |
| `maketou-poll-pending:18` | `'*'` |
| `maketou-verify:5` | `'*'` |
| `moneroo-initialize:11` | `'*'` |
| `moneroo-webhook:11` | `'*'` |
| `send-delivery-email` (via `_shared/supplier-db.ts`) | `'*'` |
| `sms-cancel:19` | `'*'` |
| `sms-check-code:6` | `'*'` |
| `sms-get-prices:7` | `'*'` |
| `support-notify:5` | `'*'` |
| `*-sync-catalog` (agedsmm/smmshiba/ytseller, via `_shared/supplier-db.ts`) | `'*'` |
| `sms-get-number` | uses `getCorsHeaders()` — **correct** |
| `maketou-create-checkout` | uses `getCorsHeaders()` — **correct** |

**Severity reasoning:** auth is `Authorization: Bearer <jwt>` set explicitly by client JS, not an ambient cookie — so a malicious site making a cross-origin `fetch()` cannot ride the victim's session automatically; it would need the JWT itself (localStorage), which same-origin policy already blocks it from reading. Real exploitation requires an independent XSS/token-leak first. Recommend fixing anyway (cheap, consistent, and removes a false sense that these endpoints are safe against future auth-model changes like cookie-based sessions): point every function at `getCorsHeaders(req)` from `_shared/rate-limit.ts` (already exists and is proven working in the two functions that use it), except true server-to-server webhooks (`moneroo-webhook`, and any future Binance webhook) which should keep `'*'` since CORS doesn't apply to non-browser callers anyway — the comment in `rate-limit.ts:52-54` already documents this distinction correctly, it's just not applied consistently.

### 2.5 `admin-deliver-order` under-scoped status guard (CONFIRMED, LOW)
**File:** `supabase/functions/admin-deliver-order/index.ts:46`
```
if (order.status === 'cancelled') return json({ error: 'Commande annulée — impossible de livrer' }, 409)
```
Only `cancelled` is excluded. An admin can call this on an order that's `pending` (not even paid yet) or already `delivered`, re-running delivery (stock draw, delivery email) a second time. Fix: gate to `status IN ('confirmed', 'processing')` (the two states delivery is actually valid from), returning 409 otherwise.

### 2.6 No cron-secret gate on internally-scheduled functions (LOW-MODERATE)
**Files:** `dropship-poll-orders`, `cancel-stale-orders`, `binance-expire-stale`, `ytseller-sync-catalog`, `smmshiba-sync-catalog`, `agedsmm-sync-catalog`

The `pg_cron` jobs (`supabase/migrations/20260706054328_setup_cron_jobs.sql`, `20260810120000_maketou_poll_cron.sql`) call these with `Authorization: Bearer <anon key>` — deliberately, per the migration's own comment, because the anon key is already public. But none of these functions do anything *beyond* the gateway JWT check to confirm the caller is actually the cron job (e.g., a shared `CRON_SECRET` header) — meaning anyone holding the public anon key (i.e., anyone, since it's shipped in the client bundle) can invoke `dropship-poll-orders`/`cancel-stale-orders`/`binance-expire-stale`/the catalog syncs on demand. None of these take attacker-controlled parameters or move money directly (they process all matching rows, not a caller-specified one), so this is not directly exploitable for theft — but it does let an outsider force extra load on supplier APIs, trigger cache/catalog churn, or race the legitimate cron tick. Recommend adding a shared-secret header check (`x-cron-secret` compared against a `CRON_SECRET` env var) as cheap defense in depth.

---

## 3. Payment / Money-Flow Correctness Findings

### 3.1 Bonus tier tables have drifted apart between client and server (CONFIRMED — this is new, not just theoretical)
- **Client (customer-facing), `src/utils/constants.js:36-41`:**
  ```
  { amount: 5,   pct: 0 },
  { amount: 10,  pct: 0 },
  { amount: 50,  pct: 1 },
  { amount: 100, pct: 2 },
  ```
- **Server (authoritative), `supabase/functions/binance-confirm-manual/index.ts:17-24` and `supabase/functions/binance-create-order/index.ts:24-29`:**
  ```
  { min: 100,   pct: 1 },
  { min: 500,   pct: 2 },
  { min: 1000,  pct: 3 },
  { min: 10000, pct: 4 },
  ```
These aren't just risk-of-drift, they are **currently and materially different scales** — a $100 deposit shows a 2% bonus client-side (per `constants.js`) but the server only credits 1% at that amount. This is not a security hole (server is authoritative, so no one can self-grant a bonus), but it's a live pricing/trust bug: customers will see one number pre-payment and get credited a different, lower one, which will generate support tickets and complaints of being shortchanged.
**Fix:** delete the client-side `BONUS_TIERS` duplication in `constants.js`/`helpers.js` `bonusPercentFor`, and instead have the client fetch the authoritative tier table from the server (or at minimum, copy the exact same numbers and add a comment + a script/test asserting the two stay identical).

### 3.2 Deposit replay (see 2.1) is also a payment-correctness bug independent of the security angle
Even absent malicious intent, the lack of a `binance_tx_id` uniqueness check means an operator or the auto-poller could double-process the same legitimate transaction under normal race conditions (e.g., user double-submits the same tx id from two tabs), silently double-crediting a legitimate deposit. This should be fixed together with 2.1.

### 3.3 Checkout doesn't await/verify `dropship-place-order` result (confirmed still accurate, per prior session's flag)
`CartCheckoutModal.jsx` / `QuickOrderModal.jsx` show a synchronous "purchase success" without waiting on `dropship-place-order`'s outcome. If no active supplier mapping exists, the customer sees success then is silently refunded moments later with no synchronous feedback — still an open gap, not re-investigated further this pass (already fully described in prior session context).

### 3.4 Idempotency spot-checks
- `binance-confirm-manual`: idempotent — checks order status before crediting (confirmed sound, per prior review, re-verified: JWT check line 43, admin-email check, status guard before `credit_balance`).
- `dropship-place-order`: idempotent via `if (order.supplier_order_id) return {ok:true, already:true}` early-return (line ~42-45) — good, protects against double-dispatch to supplier on retry/double-click.
- `binance-submit-tx`: **not** idempotent against replay across *different* orders (see 2.1) — only guards `order.status !== 'pending'` for the *same* order.

---

## 4. Design / UX / Architecture Findings

### 4.1 Confirmed vs delivered status is inconsistent between customer and admin views (CONFIRMED, actionable)
- `src/views/OrdersAdmin.jsx:125-126` correctly distinguishes `confirmed` → "Payé (non livré)" (amber, warning icon) from `delivered` → "Livrée" (green, check icon).
- `src/views/MyOrdersView.jsx:128-129` renders **both** `confirmed` and `delivered` as green "Succès"/`t('completed')` with the same styling — the customer literally cannot tell "we have your money, still working on it" from "here's your account." Given this status split was *just* introduced (memory: `20260810121500_orders_delivered_status.sql`), this is the one place the UI wasn't updated to reflect it.
**Fix:** give `MyOrdersView` its own amber "Payment received — processing" state for `confirmed`, distinct from the green "Delivered" state, mirroring the admin view's language (translated).

### 4.2 Admin panel `is_admin` toggle is misleading (ties to 2.3)
`ClientManagement`'s "Promote to Admin" control visually implies granting admin capability, but as established, none of the money/delivery endpoints consult that column. Either wire it up or relabel/remove it to avoid an operator believing they've delegated access they haven't.

### 4.3 Weak client-side sanitization pattern in `SettingsTab.jsx:515`
Regex-based `<script>`/`on\w+=` stripping before `dangerouslySetInnerHTML` for the MFA QR code. Currently low-risk since the QR HTML/SVG is generated server-side/by a trusted library, not arbitrary user input — but this pattern should not be reused elsewhere; prefer the same DOMParser-allowlist approach already built in `sanitizeDescriptionHtml` (`src/utils/helpers.js:217+`) if this code path is ever fed external data.

### 4.4 Dead code / orphaned features
- Repo-root `test_prices.js`, `test_pva.js`, `test_pva_countries.ts` — standalone SMS-provider debug scripts, not imported anywhere in `src/` or `supabase/functions/`, no build-tool reference found. Safe to delete.
- `supabase/functions/moneroo-initialize`, `moneroo-webhook` — no reference anywhere in `src/` (`grep -rln moneroo src/` returns nothing). Dead but still deployed and publicly invocable (with a real, correctly-implemented HMAC webhook signature check, so not itself exploitable) — recommend removing to shrink attack surface and cut confusion about which gateways are actually live (memory already established only Binance Pay + Mobile Money remain).
- `supabase/functions/scratch-test` — appears to be a leftover scratch/debug function; confirm and remove if unused.

### 4.5 Rate limiting coverage is thin
Only `sms-get-number` and `maketou-create-checkout` call `checkRateLimit()` from `_shared/rate-limit.ts`. Nothing custom rate-limits `binance-create-order`, `binance-submit-tx`, `transfer_credits`, or admin-moderation RPCs — Supabase Auth's built-in throttling covers login/password-reset, but the deposit/transfer endpoints have no app-level throttle. Given 2.1's replay bug, a rate limit on `binance-submit-tx` would also have functioned as partial mitigation. Recommend adding `checkRateLimit` calls to `binance-create-order`, `binance-submit-tx`, and `transfer_credits` (e.g., 10-20/hour per user).

---

## 5. Prioritized Punch List

**P0 (fix before anything else — real money at risk today):**
1. Fix `binance-submit-tx` replay: reject if `binanceOrderId` already attached to a confirmed/delivered order (2.1, 3.2).
2. Add ownership/auth check (`getUser()` + `order.user_id` match) to `binance-submit-tx` (2.2).

**P1 (fix this week — correctness/trust, not immediately exploitable):**
3. Reconcile client vs server `BONUS_TIERS` — make client read from/match server exactly (3.1).
4. Fix `MyOrdersView.jsx` to visually distinguish `confirmed` from `delivered` (4.1).
5. Decide and fix the `is_admin` vs hardcoded-email split — wire it up or relabel the toggle (2.3, 4.2).
6. Tighten `admin-deliver-order` status guard to an allowlist instead of a cancel-only blocklist (2.5).
7. Switch all client-facing edge functions off wildcard CORS onto `getCorsHeaders()`, keep `'*'` only on true server-to-server webhooks (2.4).

**P2 (cleanup / defense-in-depth, no urgency):**
8. Add a `CRON_SECRET` header check to the cron-invoked functions (2.6).
9. Remove dead code: `test_prices.js`, `test_pva.js`, `test_pva_countries.ts`, `moneroo-*` functions, `scratch-test` (4.4).
10. Add rate limiting to `binance-create-order`, `binance-submit-tx`, `transfer_credits` (4.5).
11. Replace the regex-based sanitizer in `SettingsTab.jsx:515` with the DOMParser allowlist pattern already used for product descriptions (4.3).
