-- ============================================================
-- Interrupteur admin manuel par fournisseur SMS
-- ============================================================
-- `exhausted` (déjà en place) est un signal AUTOMATIQUE : réévalué après un
-- délai (voir sms-provider-selector.ts), il peut se réactiver seul si le
-- fournisseur est recrédité. `enabled` est un choix MANUEL de l'admin, qui
-- ne s'inverse jamais tout seul — tant qu'un fournisseur est désactivé,
-- l'algorithme de sélection ne doit plus jamais le considérer, point final.

ALTER TABLE public.sms_provider_status
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;

-- Lignes de départ pour que le dashboard ait quelque chose à afficher/basculer
-- même avant tout événement d'épuisement. onlinesim démarre désactivé : son
-- achat ignore encore le pays demandé (pas de mapping ISO -> ID pays connu),
-- l'activer enverrait le mauvais pays à un client.
INSERT INTO public.sms_provider_status (provider, enabled, exhausted)
VALUES
  ('pvapins',   true,  false),
  ('smscodes',  true,  false),
  ('fivesim',   true,  false),
  ('onlinesim', false, false)
ON CONFLICT (provider) DO NOTHING;
