-- ============================================
-- MIGRATION : Miroir catalogue YTSeller (import intégral + marge globale)
-- À exécuter dans l'éditeur SQL de Supabase APRÈS supabase_ytseller_migration.sql
-- ============================================

-- Marge globale appliquée par défaut à TOUS les produits importés.
-- (Chaque mapping peut la surcharger via margin_percent ; sinon on prend celle-ci.)
ALTER TABLE supplier_settings
  ADD COLUMN IF NOT EXISTS default_margin_percent NUMERIC(6,2) DEFAULT 50;

UPDATE supplier_settings
  SET default_margin_percent = 50
  WHERE supplier = 'ytseller' AND default_margin_percent IS NULL;

-- La marge par produit devient optionnelle (NULL = utilise la marge globale).
ALTER TABLE product_supplier_mapping ALTER COLUMN margin_percent DROP DEFAULT;
ALTER TABLE product_supplier_mapping ALTER COLUMN margin_percent DROP NOT NULL;
