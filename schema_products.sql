CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ajouter une colonne product_id_new dans product_stock pour lier aux vrais produits
-- Mais pour l'instant on peut juste faire correspondre les noms ou utiliser les IDs existants
