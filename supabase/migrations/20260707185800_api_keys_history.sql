-- Migration pour permettre l'historique des clés API
DO $$
BEGIN
    -- Supprimer la contrainte d'unicité sur user_id si elle existe
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'api_keys_user_id_key') THEN
        ALTER TABLE api_keys DROP CONSTRAINT api_keys_user_id_key;
    END IF;
END $$;

-- S'assurer que le champ created_at existe
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
