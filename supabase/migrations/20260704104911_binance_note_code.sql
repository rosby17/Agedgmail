-- Code de référence unique que le client doit coller dans la note de
-- paiement Binance Pay ("Note du bénéficiaire"), en complément du montant
-- unique — deux indices indépendants pour identifier le bon paiement.
alter table public.orders
  add column if not exists note_code text;
