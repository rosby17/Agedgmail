-- Met en place les crons automatiques réels. Jusqu'ici, la synchro
-- catalogue et surtout dropship-poll-orders n'étaient QUE documentés dans
-- un runbook (YTSELLER_SETUP.md) que personne n'avait jamais exécuté en SQL
-- editor — résultat concret : des commandes fournisseur restaient bloquées
-- en 'processing' indéfiniment (débit fournisseur effectué, mais jamais
-- vérifiées ni livrées au client faute de poller).
--
-- L'Authorization Bearer utilisée ici est la clé ANON (publique, déjà
-- exposée côté client dans le bundle front) — suffisante pour passer la
-- passerelle Supabase, chaque fonction utilise ensuite sa propre
-- SUPABASE_SERVICE_ROLE_KEY en interne pour les actions admin.
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'dropship-poll-orders-every-minute',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/dropship-poll-orders',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janBia2Z3aG1zaXNwaWN6emdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODIwNjIsImV4cCI6MjA5Mzg1ODA2Mn0.YTQFZVUN0C4YNdfEQx9znnox6XZyxEvl_2U7qHTfn54", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'cancel-stale-orders-every-10-min',
  '*/10 * * * *',
  $$
  select net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/cancel-stale-orders',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janBia2Z3aG1zaXNwaWN6emdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODIwNjIsImV4cCI6MjA5Mzg1ODA2Mn0.YTQFZVUN0C4YNdfEQx9znnox6XZyxEvl_2U7qHTfn54", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'binance-expire-stale-every-5-min',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/binance-expire-stale',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janBia2Z3aG1zaXNwaWN6emdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODIwNjIsImV4cCI6MjA5Mzg1ODA2Mn0.YTQFZVUN0C4YNdfEQx9znnox6XZyxEvl_2U7qHTfn54", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'ytseller-sync-catalog-hourly',
  '15 * * * *',
  $$
  select net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/ytseller-sync-catalog',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janBia2Z3aG1zaXNwaWN6emdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODIwNjIsImV4cCI6MjA5Mzg1ODA2Mn0.YTQFZVUN0C4YNdfEQx9znnox6XZyxEvl_2U7qHTfn54", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'smmshiba-sync-catalog-hourly',
  '45 * * * *',
  $$
  select net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/smmshiba-sync-catalog',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janBia2Z3aG1zaXNwaWN6emdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODIwNjIsImV4cCI6MjA5Mzg1ODA2Mn0.YTQFZVUN0C4YNdfEQx9znnox6XZyxEvl_2U7qHTfn54", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
