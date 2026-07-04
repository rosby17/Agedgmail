-- Ajoute les colonnes nécessaires au paiement Binance (Pay ID + futurs
-- dépôts USDT-TRC20/LTC) sur la table orders existante, réutilisée pour
-- les recharges de solde (product_id = 999).
alter table public.orders
  add column if not exists payment_method text,
  add column if not exists expected_amount numeric,
  add column if not exists expires_at timestamptz;

-- Un montant unique ne doit être "en attente" qu'une seule fois à la fois,
-- pour permettre le matching automatique par montant exact.
create unique index if not exists orders_expected_amount_pending_idx
  on public.orders (expected_amount)
  where status = 'pending' and expected_amount is not null;
