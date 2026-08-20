-- "Mes SMS" affichait 0 commande dès qu'aucun code n'était jamais reçu : les
-- tentatives restaient uniquement dans sms_pending_sessions, invisible côté
-- client (RLS fermée à double tour). On ouvre une lecture en lecture seule
-- sur ses propres lignes, et on ajoute pays/service pour que l'historique
-- puisse afficher service, numéro, pays, code, statut et heure.
ALTER TABLE public.sms_pending_sessions ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.sms_pending_sessions ADD COLUMN IF NOT EXISTS service_label text;

GRANT SELECT ON public.sms_pending_sessions TO authenticated;
DROP POLICY IF EXISTS "Users can view their own sms sessions" ON public.sms_pending_sessions;
CREATE POLICY "Users can view their own sms sessions" ON public.sms_pending_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
