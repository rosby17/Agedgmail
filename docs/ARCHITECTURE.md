# Architecture technique

## Vue d’ensemble

AgedGmailYT est une application monopage React/Vite. Supabase fournit l’authentification, PostgreSQL, la RLS, les Edge Functions et les tâches planifiées. Vercel sert le frontend et réécrit `/api/v2` vers l’API Edge Function.

## Organisation du dépôt

| Chemin | Responsabilité |
|---|---|
| `src/` | Interface React, routage, vues client et admin |
| `src/views/` | Catalogue, SMS, proxies, commandes et administration |
| `src/components/` | Mise en page, modales et composants UI |
| `src/utils/` | Routage, traductions et logique partagée client |
| `supabase/functions/` | Backend serveur et intégrations fournisseur |
| `supabase/functions/_shared/` | Adaptateurs, tarification, sécurité et utilitaires |
| `supabase/migrations/` | Schéma, RLS, RPC, index et crons versionnés |
| `supabase/templates/` | Emails Supabase Auth |

## Routage frontend

Le routage est centralisé dans `src/utils/routing.js`.

- Pages publiques : accueil, catalogue, produit, authentification et politiques.
- Pages sous `/app/*` : SMS, proxies, commandes, recharge, paramètres, API et admin.
- `/app/myorders` contient les onglets Gmail, proxies, SMS et recharges.
- `/app/proxies` contient la gestion détaillée des proxies du client.
- `/app/admin/proxies` contient la gestion des proxies vendus.

## Modèle de données principal

### Commerce

- `products` : catalogue public, prix et disponibilité.
- `orders` : commande, paiement, fournisseur, coût, statut et livraison.
- `account_stock` : stock local lorsque le produit n’est pas dropship.
- `product_supplier_mapping` : correspondances, coûts et marges fournisseur.
- `supplier_settings` et `supplier_logs` : soldes mis en cache et journal d’intégration.

### Utilisateurs et argent

- `profiles` : profil, solde, suspension et préférences.
- `payments` : paiements nécessitant un suivi séparé.
- `notifications` : notifications de l’application.
- `deduct_balance` et `credit_balance` sont réservées au backend.
- Les RPC client dérivent l’utilisateur depuis `auth.uid()`.

### SMS

- Les codes reçus sont livrés dans `orders.delivery_data` et `orders.credentials`.
- `sms_pending_sessions` conserve une réservation dès l’attribution du numéro.
- `sms_provider_status` pilote l’activation et la santé des fournisseurs.
- Le navigateur poll pendant 15 minutes ; `sms-poll-pending` poursuit jusqu’à 25 minutes.

### Proxies

- `proxy_accounts` : compte résidentiel rotatif d’un client.
- `proxy_purchase_requests` : idempotence des achats de trafic rotatif.
- `static_proxy_purchase_requests` : suivi durable des achats statiques.
- Les proxies livrés sont stockés dans `orders.delivery_data.proxies`.

## Flux de commande catalogue

```text
Paiement par solde
  → orders.status = processing
  → dropship-place-order
  → vérification du solde fournisseur
  → commande fournisseur + supplier_order_id
  → dropship-poll-orders (cron)
  → résultat fournisseur
  → credentials + delivery_data
  → status = delivered
  → notification / email
```

États principaux : `pending`, `confirmed`, `processing`, `delivered` et `cancelled`. `confirmed` signifie payé mais non livré ; `delivered` est l’état final réussi.

## Flux SMS

```text
sms-get-prices
  → sms-get-number
  → sms_pending_sessions(waiting)
  → sms-check-code côté navigateur
  ├── code reçu : débit atomique + order delivered
  └── après 15 min : sms-poll-pending poursuit jusqu’à 25 min
                      → sauvegarde + notification si code tardif
```

Le client n’est débité qu’après réception. Une alerte sonore est jouée si l’onglet SMS est encore ouvert.

## Flux proxy statique

```text
proxy-static-catalog
  → proxy-static-quote (prix exact + devis signé)
  → proxy-static-purchase
  → contrôles des soldes client et fournisseur
  → achat IPFoxy
  → order-info + proxy-list
  → livraison dans Mes commandes / Mes proxies
```

La marge statique est définie par `IPFOXY_STATIC_MARGIN_PCT`. La valeur contrôlée en production le 17 août 2026 est 25 %, mais Supabase Secrets reste la source de vérité.

## Flux proxy rotatif

`PROXY_PROVIDER` choisit l’adaptateur IPFoxy ou IPRoyal. Une clé d’idempotence durable empêche le double crédit de trafic lors des retries.

## API publique

`/api/v2` est réécrit vers l’Edge Function `api-v2`. L’authentification utilise `api_keys`. Les actions couvrent le solde, les produits, les commandes et les SMS. Les fournisseurs réels ne doivent jamais apparaître dans les réponses.
