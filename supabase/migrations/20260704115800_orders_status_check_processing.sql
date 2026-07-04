-- Met à jour la contrainte orders_status_check pour autoriser le statut 'processing'
-- introduit pour les commandes de type dropship en attente de livraison fournisseur.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status = any (array['pending'::text, 'confirmed'::text, 'cancelled'::text, 'processing'::text]));
