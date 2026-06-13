-- ============================================
-- MIGRATION : Marketplace Multi-Vendeurs
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- 1. Ajouter les colonnes vendeur dans profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_seller BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS seller_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS seller_name TEXT,
  ADD COLUMN IF NOT EXISTS seller_bio TEXT;

-- 2. Ajouter les colonnes modération dans products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Index pour performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_profiles_seller_status ON profiles(seller_status);

-- 4. RLS : Les vendeurs peuvent insérer leurs propres produits
CREATE POLICY IF NOT EXISTS "Sellers can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

-- 5. RLS : Les vendeurs peuvent modifier leurs propres produits en attente
CREATE POLICY IF NOT EXISTS "Sellers can update own pending products"
  ON products FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid() AND status = 'pending');

-- 6. Seuls les produits approuvés sont visibles publiquement
-- (Le SELECT existant doit être mis à jour ou une policy ajoutée)
-- Note: Si vous avez déjà une policy SELECT publique, les produits 'pending'
-- ne seront visibles que dans le dashboard vendeur (filtrés côté frontend).
