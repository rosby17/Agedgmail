-- ============================================================
-- SECURITY FIX 3 — 2026-07-17
-- Remplacement des clés ANON en dur dans les crons pg_cron
-- par une lecture depuis un paramètre de base de données.
--
-- CONTEXTE : la clé anon Supabase est publique par design
-- (elle est dans le bundle JS du front). Sa présence en dur
-- dans les migrations SQL n'est pas un risque direct, mais
-- la rend difficile à faire tourner si nécessaire.
--
-- SOLUTION : stocker la clé dans un paramètre GUC Supabase
-- et la lire dynamiquement. Cela permet de changer la clé
-- sans modifier le code SQL des crons.
-- ============================================================

-- 1. Créer un paramètre GUC pour la clé anon
-- (À exécuter manuellement via le SQL Editor Supabase si la
-- clé change, car ALTER DATABASE n'est pas idempotent facilement)
DO $$
BEGIN
  -- Essayer de définir le paramètre ; ignore si déjà défini avec la bonne valeur
  BEGIN
    PERFORM current_setting('app.supabase_anon_key');
  EXCEPTION
    WHEN undefined_object THEN
      -- Le paramètre n'existe pas encore — on ne peut pas le créer ici
      -- sans superuser. Utiliser Supabase Vault à la place (voir commentaire).
      NULL;
  END;
END;
$$;

-- 2. Recréer les crons avec lecture dynamique de la clé anon
-- Note : format() permet de ne PAS stocker la clé en dur dans le SQL.
-- La clé est lue depuis current_setting() au moment de l'exécution du cron.
--
-- PRÉREQUIS : exécuter dans le SQL Editor avant ce script :
--   ALTER DATABASE postgres SET app.supabase_anon_key = 'eyJhbGci...';
--
-- Ou utiliser Supabase Vault (recommandé) :
--   SELECT vault.create_secret('eyJhbGci...', 'supabase_anon_key');
--   puis lire via : SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='supabase_anon_key';

-- Supprimer les anciens crons (qui ont la clé en dur)
SELECT cron.unschedule('dropship-poll-orders-every-minute');
SELECT cron.unschedule('cancel-stale-orders-every-10-min');
SELECT cron.unschedule('binance-expire-stale-every-5-min');
SELECT cron.unschedule('ytseller-sync-catalog-hourly');
SELECT cron.unschedule('smmshiba-sync-catalog-hourly');

-- Recréer avec clé lue dynamiquement depuis le paramètre GUC
-- (ne plantera pas si le paramètre n'existe pas — il y a un fallback)
CREATE OR REPLACE FUNCTION private.get_anon_key() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN current_setting('app.supabase_anon_key', true);
EXCEPTION WHEN OTHERS THEN
  -- Fallback : retourner une chaîne vide (les crons seront rejetés 401
  -- plutôt que d'exposer une clé en dur)
  RETURN '';
END;
$$;

-- Crons reconstruits dynamiquement
SELECT cron.schedule(
  'dropship-poll-orders-every-minute',
  '* * * * *',
  format($$
  SELECT net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/dropship-poll-orders',
    headers := format('{"Authorization": "Bearer %s", "Content-Type": "application/json"}',
      current_setting('app.supabase_anon_key', true))::jsonb,
    body := '{}'::jsonb
  );
  $$)
);

SELECT cron.schedule(
  'cancel-stale-orders-every-10-min',
  '*/10 * * * *',
  format($$
  SELECT net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/cancel-stale-orders',
    headers := format('{"Authorization": "Bearer %s", "Content-Type": "application/json"}',
      current_setting('app.supabase_anon_key', true))::jsonb,
    body := '{}'::jsonb
  );
  $$)
);

SELECT cron.schedule(
  'binance-expire-stale-every-5-min',
  '*/5 * * * *',
  format($$
  SELECT net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/binance-expire-stale',
    headers := format('{"Authorization": "Bearer %s", "Content-Type": "application/json"}',
      current_setting('app.supabase_anon_key', true))::jsonb,
    body := '{}'::jsonb
  );
  $$)
);

SELECT cron.schedule(
  'ytseller-sync-catalog-hourly',
  '15 * * * *',
  format($$
  SELECT net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/ytseller-sync-catalog',
    headers := format('{"Authorization": "Bearer %s", "Content-Type": "application/json"}',
      current_setting('app.supabase_anon_key', true))::jsonb,
    body := '{}'::jsonb
  );
  $$)
);

SELECT cron.schedule(
  'smmshiba-sync-catalog-hourly',
  '45 * * * *',
  format($$
  SELECT net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/smmshiba-sync-catalog',
    headers := format('{"Authorization": "Bearer %s", "Content-Type": "application/json"}',
      current_setting('app.supabase_anon_key', true))::jsonb,
    body := '{}'::jsonb
  );
  $$)
);
