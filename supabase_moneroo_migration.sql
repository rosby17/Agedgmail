-- ============================================
-- MIGRATION : Intégration Moneroo (remplace MoneyFusion / Cryptomus)
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS moneroo_payment_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_moneroo_payment_id ON orders(moneroo_payment_id);
