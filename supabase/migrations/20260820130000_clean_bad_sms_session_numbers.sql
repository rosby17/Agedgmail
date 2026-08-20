-- Nettoie les lignes sms_pending_sessions où `number` contient un message
-- d'erreur fournisseur au lieu d'un numéro (bug historique côté
-- sms-get-number, corrigé) — visibles dans "Mes SMS" depuis l'ouverture de
-- la lecture RLS sur cette table.
DELETE FROM public.sms_pending_sessions
WHERE number !~ '^\+?[0-9]{5,20}$';
