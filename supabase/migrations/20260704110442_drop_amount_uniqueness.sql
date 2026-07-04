-- L'identification se fait désormais via profiles.payment_code (permanent,
-- par utilisateur) et non plus via un montant décalé par des centimes
-- aléatoires. Deux clients peuvent légitimement demander le même montant
-- rond (ex. deux recharges de 50.00 $) : cette contrainte d'unicité,
-- pensée pour l'ancien schéma, doit disparaître.
drop index if exists public.orders_expected_amount_pending_idx;
