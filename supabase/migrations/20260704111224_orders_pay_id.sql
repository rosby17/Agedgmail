-- Dénormalise le Pay ID Binance sur la commande elle-même : nécessaire pour
-- pouvoir "reprendre" un paiement en attente depuis "Mes commandes" sans
-- redemander au serveur (le Pay ID est un secret d'environnement, pas
-- accessible directement depuis le client).
alter table public.orders
  add column if not exists pay_id text;
