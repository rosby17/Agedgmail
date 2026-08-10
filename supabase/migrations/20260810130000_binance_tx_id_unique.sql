-- SÉCURITÉ CRITIQUE — rejeu de transaction Binance Pay.
-- binance-submit-tx n'empêchait pas qu'un même binanceOrderId réel (une seule
-- vraie transaction) soit attaché puis auto-confirmé sur PLUSIEURS commandes
-- distinctes du même montant, créditant le solde à chaque fois. Le contrôle
-- applicatif ajouté côté fonction peut être contourné par une course entre
-- deux requêtes concurrentes — cette contrainte unique est le filet de
-- sécurité imparable : impossible d'avoir deux commandes 'confirmed'/
-- 'delivered' portant le même binance_tx_id.
-- Exclut le placeholder historique 'manual-confirm' (confirmations admin
-- sans TXID saisi) : ce n'est pas une vraie transaction Binance, donc pas
-- concerné par le rejeu — de nombreuses commandes le partagent légitimement.
create unique index if not exists orders_binance_tx_id_confirmed_unique
  on public.orders (binance_tx_id)
  where binance_tx_id is not null
    and binance_tx_id <> 'manual-confirm'
    and status in ('confirmed', 'delivered');
