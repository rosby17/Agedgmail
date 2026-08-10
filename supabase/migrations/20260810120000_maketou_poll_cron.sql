-- Automatise le crédit des dépôts Mobile Money (Maketou) : jusqu'ici la
-- fonction maketou-verify existait mais n'était appelée par personne (ni
-- webhook Maketou, ni cron) — chaque dépôt Mobile Money restait bloqué en
-- 'pending' jusqu'à confirmation manuelle par l'admin. On ajoute un cron qui
-- interroge maketou-poll-pending toutes les 2 minutes pour tous les dépôts
-- Mobile Money en attente (crédite ou annule automatiquement).
select cron.schedule(
  'maketou-poll-pending-every-2-min',
  '*/2 * * * *',
  $$
  select net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/maketou-poll-pending',
    headers := jsonb_build_object('Authorization', 'Bearer ' || private.get_anon_key(), 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);
