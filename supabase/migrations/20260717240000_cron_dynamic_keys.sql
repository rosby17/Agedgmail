-- ============================================================
-- SECURITY FIX 3 — 2026-07-17
-- Remplacement des clés ANON en dur dans les crons pg_cron
-- par une lecture depuis Supabase Vault.
-- ============================================================

-- 1. Activer l'extension Vault si ce n'est pas déjà fait
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;

-- 2. Insérer la clé anon dans le coffre-fort (Vault)
-- Cette commande créera un doublon inoffensif si exécutée plusieurs fois,
-- mais vous pouvez utiliser vault.update_secret pour la modifier plus tard.
SELECT vault.create_secret(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janBia2Z3aG1zaXNwaWN6emdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODIwNjIsImV4cCI6MjA5Mzg1ODA2Mn0.YTQFZVUN0C4YNdfEQx9znnox6XZyxEvl_2U7qHTfn54',
  'supabase_anon_key',
  'Clé publique pour les requêtes HTTP des crons'
);

-- 3. Fonction pour lire le secret au moment de l'exécution
CREATE SCHEMA IF NOT EXISTS private;
CREATE OR REPLACE FUNCTION private.get_anon_key() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_secret text;
BEGIN
  -- Récupère la dernière version du secret par son nom
  SELECT decrypted_secret INTO v_secret 
  FROM vault.decrypted_secrets 
  WHERE name = 'supabase_anon_key' 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  RETURN COALESCE(v_secret, '');
END;
$$;

-- 4. Supprimer les anciens crons avec la clé en dur
SELECT cron.unschedule('dropship-poll-orders-every-minute');
SELECT cron.unschedule('cancel-stale-orders-every-10-min');
SELECT cron.unschedule('binance-expire-stale-every-5-min');
SELECT cron.unschedule('ytseller-sync-catalog-hourly');
SELECT cron.unschedule('smmshiba-sync-catalog-hourly');

-- 5. Recréer les crons avec jsonb_build_object pour appeler dynamiquement get_anon_key()
SELECT cron.schedule(
  'dropship-poll-orders-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/dropship-poll-orders',
    headers := jsonb_build_object('Authorization', 'Bearer ' || private.get_anon_key(), 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'cancel-stale-orders-every-10-min',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/cancel-stale-orders',
    headers := jsonb_build_object('Authorization', 'Bearer ' || private.get_anon_key(), 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'binance-expire-stale-every-5-min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/binance-expire-stale',
    headers := jsonb_build_object('Authorization', 'Bearer ' || private.get_anon_key(), 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'ytseller-sync-catalog-hourly',
  '15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/ytseller-sync-catalog',
    headers := jsonb_build_object('Authorization', 'Bearer ' || private.get_anon_key(), 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'smmshiba-sync-catalog-hourly',
  '45 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/smmshiba-sync-catalog',
    headers := jsonb_build_object('Authorization', 'Bearer ' || private.get_anon_key(), 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);
