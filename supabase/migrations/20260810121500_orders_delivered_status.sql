-- Sépare "payé" de "livré" pour les commandes de comptes : jusqu'ici
-- admin-deliver-order faisait passer une commande directement en 'confirmed',
-- qui servait aussi de statut "paiement reçu" pour les dépôts — impossible de
-- distinguer au dashboard admin une commande payée-mais-pas-livrée d'une
-- commande réellement livrée. On ajoute 'delivered' comme statut final propre
-- aux commandes de comptes, plus delivered_at/handled_by pour savoir qui a
-- traité la commande et quand.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status = any (array['pending'::text, 'confirmed'::text, 'cancelled'::text, 'processing'::text, 'delivered'::text]));

alter table public.orders add column if not exists delivered_at timestamptz;
alter table public.orders add column if not exists handled_by text;
