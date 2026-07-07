-- Ajoute le cron de synchro catalogue AgedSMM (toutes les heures à :30)
-- et augmente le timeout dropship-poll-orders de 15 → 60 minutes
-- pour laisser le temps aux fournisseurs de traiter les commandes.

select cron.schedule(
  'agedsmm-sync-catalog-hourly',
  '30 * * * *',
  $$
  select net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/agedsmm-sync-catalog',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janBia2Z3aG1zaXNwaWN6emdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODIwNjIsImV4cCI6MjA5Mzg1ODA2Mn0.YTQFZVUN0C4YNdfEQx9znnox6XZyxEvl_2U7qHTfn54", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
