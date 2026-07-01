-- ============================================
-- MIGRATION : Intégration Reseller / Dropshipping YTSeller
-- À exécuter dans l'éditeur SQL de Supabase.
--
-- Principe : mon catalogue (`products`) reste la vitrine publique.
-- Chaque produit peut être lié à un produit YTSeller via
-- `product_supplier_mapping`. Le coût (rate) et la marge NE SONT JAMAIS
-- exposés au client : seuls `products.price`, `products.supplier_stock`
-- et `products.is_dropship` (déjà publics) sont lus côté navigateur.
-- ============================================

-- ------------------------------------------------------------------
-- 1. Colonnes publiques ajoutées à `products`
--    (mises à jour par la fonction de synchro, lisibles par tous)
-- ------------------------------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_dropship BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS supplier_stock INTEGER DEFAULT 0;

-- ------------------------------------------------------------------
-- 2. Table de correspondance produit ↔ fournisseur (SENSIBLE : admin only)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_supplier_mapping (
  id                  BIGSERIAL PRIMARY KEY,
  product_id          INTEGER REFERENCES products(id) ON DELETE CASCADE,
  supplier            TEXT NOT NULL DEFAULT 'ytseller',
  ytseller_product_id TEXT NOT NULL,                 -- champ "product" de l'API
  ytseller_rate       NUMERIC(12,4) DEFAULT 0,       -- champ "rate" (coût unitaire)
  margin_percent      NUMERIC(6,2)  DEFAULT 30,      -- ma marge en %
  supplier_available  INTEGER DEFAULT 0,             -- champ "inventory"
  supplier_status     TEXT,                          -- "In stock" / "Out of stock"
  supplier_currency   TEXT DEFAULT 'USD',
  active              BOOLEAN DEFAULT true,
  last_synced_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE (product_id, supplier)
);

CREATE INDEX IF NOT EXISTS idx_psm_product_id ON product_supplier_mapping(product_id);
CREATE INDEX IF NOT EXISTS idx_psm_active     ON product_supplier_mapping(active);

-- ------------------------------------------------------------------
-- 3. Colonnes fournisseur sur `orders`
-- ------------------------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS supplier                 TEXT,
  ADD COLUMN IF NOT EXISTS supplier_order_id        TEXT,
  ADD COLUMN IF NOT EXISTS supplier_status          TEXT,
  ADD COLUMN IF NOT EXISTS supplier_last_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS supplier_attempts        INTEGER DEFAULT 0;

-- La livraison différée introduit le statut 'processing' (commande payée,
-- en attente de livraison fournisseur). L'UI "Mes commandes" gère déjà
-- l'affichage "En attente de livraison…" quand credentials est vide.
CREATE INDEX IF NOT EXISTS idx_orders_supplier_poll
  ON orders(status, supplier) WHERE supplier IS NOT NULL;

-- ------------------------------------------------------------------
-- 4. Journal des évènements fournisseur (logs visibles dans l'admin)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_logs (
  id         BIGSERIAL PRIMARY KEY,
  order_id   TEXT,
  supplier   TEXT DEFAULT 'ytseller',
  action     TEXT,
  level      TEXT DEFAULT 'info',   -- 'info' | 'error'
  message    TEXT,
  payload    JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_supplier_logs_created ON supplier_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supplier_logs_order   ON supplier_logs(order_id);

-- ------------------------------------------------------------------
-- 5. Cache paramètres / solde fournisseur (1 ligne par fournisseur)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_settings (
  supplier           TEXT PRIMARY KEY DEFAULT 'ytseller',
  balance            NUMERIC(12,4) DEFAULT 0,
  currency           TEXT DEFAULT 'USD',
  last_balance_check TIMESTAMPTZ,
  last_catalog_sync  TIMESTAMPTZ
);
INSERT INTO supplier_settings (supplier) VALUES ('ytseller')
  ON CONFLICT (supplier) DO NOTHING;

-- ------------------------------------------------------------------
-- 6. RLS — les tables fournisseur (coût, marge, solde, logs) sont
--    strictement réservées à l'admin. Les Edge Functions utilisent la
--    SERVICE_ROLE_KEY et contournent la RLS : la synchro et le polling
--    fonctionnent donc quoi qu'il arrive.
--    ⚠️ Adapter l'email si l'admin change (cf. ADMIN_EMAIL dans App.jsx).
-- ------------------------------------------------------------------
ALTER TABLE product_supplier_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_settings        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_psm" ON product_supplier_mapping;
CREATE POLICY "admin_all_psm" ON product_supplier_mapping
  FOR ALL TO authenticated
  USING      ((auth.jwt() ->> 'email') = 'rooseveltmkr@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'rooseveltmkr@gmail.com');

DROP POLICY IF EXISTS "admin_read_logs" ON supplier_logs;
CREATE POLICY "admin_read_logs" ON supplier_logs
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = 'rooseveltmkr@gmail.com');

DROP POLICY IF EXISTS "admin_read_settings" ON supplier_settings;
CREATE POLICY "admin_read_settings" ON supplier_settings
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = 'rooseveltmkr@gmail.com');
