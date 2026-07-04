-- Code de paiement permanent par utilisateur : généré une seule fois (à
-- l'inscription ou paresseusement à la première recharge), inchangé
-- ensuite. Le client le colle dans la note de son paiement Binance Pay ;
-- ça permet d'identifier QUI a payé sans avoir à décaler le montant de
-- quelques centimes (le montant reste rond, ex. 50.00 $, pour rester
-- présentable).
alter table public.profiles
  add column if not exists payment_code text;

create unique index if not exists profiles_payment_code_idx
  on public.profiles (payment_code)
  where payment_code is not null;

-- Génère un code à partir de l'UUID du profil (8 caractères, préfixe AG),
-- déterministe et donc rejouable pour tous les profils déjà existants.
update public.profiles
set payment_code = 'AG-' || upper(substr(replace(id::text, '-', ''), 1, 8))
where payment_code is null;
