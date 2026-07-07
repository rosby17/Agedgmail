-- Ajouter le nom et la date d'expiration à la table api_keys
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Clé API';
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
