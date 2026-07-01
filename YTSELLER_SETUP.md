# Intégration Reseller / Dropshipping YTSeller

Ton site achète chez toi ; en coulisses, la commande est passée chez YTSeller
(`https://ytseller.com/api/v2`) et livrée au client. Le client ne voit jamais
YTSeller. Aucun changement de design côté public.

## Architecture

```
Client paie (solde interne)
   └─► orders (status='processing', supplier='ytseller')      [App.jsx]
        └─► ytseller-place-order  (balance + add_product_order) [Edge Function]
             └─► orders.supplier_order_id
                  └─► ytseller-poll-orders  (cron ~60s)         [Edge Function]
                       ├─ Completed → result_product → orders.credentials → 'confirmed'
                       ├─ Partial   → livre + rembourse le manquant
                       ├─ Canceled  → remboursement intégral
                       └─ Timeout   → remboursement + alerte admin
```

Le catalogue public affiche `products.price` et `products.supplier_stock`,
alimentés par `ytseller-sync-catalog`. Le coût (`ytseller_rate`) et la marge
restent dans `product_supplier_mapping`, **réservé à l'admin (RLS)**.

## 1. Migration SQL

Exécute `supabase_ytseller_migration.sql` dans l'éditeur SQL de Supabase.
(Crée `product_supplier_mapping`, `supplier_logs`, `supplier_settings`, ajoute
les colonnes fournisseur à `orders` et `products`, active la RLS admin.)

> ⚠️ La RLS admin est filtrée sur l'email `rooseveltmkr@gmail.com`
> (cf. `ADMIN_EMAIL` dans `src/App.jsx`). Adapte les policies si l'admin change.

## 2. Secrets serveur

La clé API ne doit **jamais** être committée ni exposée au client :

```bash
supabase secrets set YTSELLER_API_KEY=ta_cle_ytseller
# Optionnel (par défaut https://ytseller.com/api/v2) :
# supabase secrets set YTSELLER_API_URL=https://ytseller.com/api/v2
```

`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont déjà disponibles pour les
Edge Functions (déjà utilisés par les fonctions Moneroo).

> 🔐 La clé fournie en clair pendant le développement doit être **régénérée**
> dans le panel YTSeller, puis remise via `supabase secrets set`.

## 3. Déploiement des Edge Functions

```bash
supabase functions deploy ytseller-sync-catalog
supabase functions deploy ytseller-place-order
supabase functions deploy ytseller-poll-orders
```

`ytseller-place-order` est appelée par le front (client authentifié) ; les deux
autres tournent par cron. Vérifie que `verify_jwt` convient à ton setup
(`ytseller-sync-catalog` / `ytseller-poll-orders` peuvent être en `--no-verify-jwt`
si déclenchées par le scheduler).

## 4. Cron (pg_cron via Supabase)

Dans l'éditeur SQL (schedule Supabase). Remplace `PROJECT_REF` et utilise la
`service_role` key en en-tête.

```sql
-- Synchro catalogue toutes les heures
select cron.schedule(
  'ytseller-sync-catalog', '0 * * * *',
  $$ select net.http_post(
       url := 'https://PROJECT_REF.functions.supabase.co/ytseller-sync-catalog',
       headers := jsonb_build_object('Authorization','Bearer SERVICE_ROLE_KEY','Content-Type','application/json'),
       body := '{}'::jsonb
     ); $$
);

-- Polling des commandes fournisseur toutes les minutes
select cron.schedule(
  'ytseller-poll-orders', '* * * * *',
  $$ select net.http_post(
       url := 'https://PROJECT_REF.functions.supabase.co/ytseller-poll-orders',
       headers := jsonb_build_object('Authorization','Bearer SERVICE_ROLE_KEY','Content-Type','application/json'),
       body := '{}'::jsonb
     ); $$
);
```

## 5. Utilisation (admin)

1. Onglet **Fournisseur** de la console admin.
2. **Mapper** chaque produit de ton catalogue à un `ID YTSeller` (bouton
   « products » de l'API, ex. `11`) + une **marge %**.
3. **Synchroniser maintenant** → renseigne coût, dispo, prix de vente et passe
   les produits en dropship.
4. Surveille le **solde YTSeller**, les **commandes en attente** et le **journal**.

> ⚠️ Si le solde YTSeller est à 0, `ytseller-place-order` rembourse
> automatiquement le client (il ne reste jamais débité sans contrepartie).
> Recharge ton compte YTSeller pour honorer les commandes.

## Contrat API (référence)

| action | params | réponse |
|---|---|---|
| `balance` | — | `{"balance":"68.68","currency":"USD"}` |
| `products` | — | `[{product,name,category,rate,inventory,status,...}]` |
| `add_product_order` | `product,quantity,require?` | `{"order":99999}` |
| `product_order_status` | `order` | `{"charge":"33.00","status":"Completed","remains":0,"currency":"USD"}` |
| `result_product` | `order` | `{"result":["compte1","compte2"]}` |

Statuts : `Pending`, `Processing`, `In progress`, `Completed`, `Partial`, `Canceled`.
Auth = param `key` (form-urlencoded, POST). Tout le mapping est centralisé dans
`supabase/functions/_shared/ytseller.ts`.
