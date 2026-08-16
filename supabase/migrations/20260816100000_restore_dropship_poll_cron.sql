-- ============================================================
-- Le cron dropship-poll-orders-every-minute a disparu de cron.job (les 4
-- autres jobs recréés dans la même migration du 2026-07-17 sont bien
-- présents, celui-ci manquait — probablement désinscrit manuellement sans
-- être reprogrammé). Conséquence concrète : une commande passée en
-- 'processing' chez le fournisseur (ex: #3F603803, smmshiba) n'était plus
-- jamais repollée après le premier appel manuel — elle restait "En cours"
-- indéfiniment même une fois livrée côté fournisseur, jusqu'à intervention
-- manuelle (bouton "Relancer"/"Livrer"). On le reprogramme à l'identique.
-- ============================================================

SELECT cron.unschedule('dropship-poll-orders-every-minute')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'dropship-poll-orders-every-minute');

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
