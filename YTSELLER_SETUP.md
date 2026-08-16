# Intégration YTSeller

## Objectif

YTSeller est un fournisseur invisible du catalogue AgedGmailYT. Le client paie AgedGmailYT ; le backend commande, poll et livre les credentials sans exposer YTSeller.

API : `POST https://ytseller.com/api/v2`, contenu `application/x-www-form-urlencoded`, réponse JSON.

## Composants

| Élément | Rôle |
|---|---|
| `_shared/ytseller.ts` | Client API et normalisation |
| `ytseller-sync-catalog` | Import et synchronisation du catalogue |
| `dropship-place-order` | Routage et passation de commande |
| `dropship-poll-orders` | Polling multi-fournisseurs et livraison |
| `product_supplier_mapping` | Produit interne, produit fournisseur, coût et marge |
| `supplier_settings` | Solde fournisseur |
| `supplier_logs` | Journal d’exploitation |

Les anciens noms `ytseller-place-order` et `ytseller-poll-orders` ne sont plus utilisés.

## Configuration

```bash
supabase secrets set \
  YTSELLER_API_KEY=... \
  YTSELLER_API_URL=https://ytseller.com/api/v2
```

Ne jamais placer la clé dans `.env.example`, une variable `VITE_*` ou le frontend.

## Déploiement

```bash
supabase db push
supabase functions deploy ytseller-sync-catalog
supabase functions deploy dropship-place-order
supabase functions deploy dropship-poll-orders
```

Les crons sont versionnés dans `supabase/migrations/`. Ne pas copier une clé `service_role` en clair dans une migration ; les jobs utilisent `private.get_anon_key()`.

## Synchronisation catalogue

L’action `products` alimente les produits et mappings. La synchronisation met à jour coût, stock fournisseur, statut et prix de vente. Le coût et le fournisseur ne sont pas exposés au client.

Dans la console admin, l’import complet peut créer les produits fournisseur. Une synchronisation normale actualise les produits déjà mappés.

## Cycle de commande

1. La commande locale est payée et passe à `processing`.
2. `dropship-place-order` sélectionne le mapping actif et contrôle le solde.
3. `add_product_order` renvoie `supplier_order_id`.
4. `dropship-poll-orders` interroge `product_order_status`.
5. `Completed` déclenche `result_product`, la persistance et la livraison.
6. `Partial` livre la partie disponible et rembourse le manque.
7. `Canceled`, erreur définitive ou timeout déclenche remboursement et alerte.

## Actions API utilisées

| Action | Paramètres principaux |
|---|---|
| `balance` | aucun |
| `products` | aucun |
| `add_product_order` | `product`, `quantity`, `require?` |
| `product_order_status` | `order` |
| `result_product` | `order` |

Statuts attendus : `Pending`, `Processing`, `In progress`, `Completed`, `Partial`, `Canceled`.

## Contrôles d’exploitation

- Solde fournisseur positif.
- Mapping actif et stock disponible.
- Commandes `processing` sans stagnation.
- Présence de `supplier_order_id` avant toute relance.
- Logs d’erreur et alertes Telegram.

Une commande possédant déjà un identifiant fournisseur ne doit pas être envoyée une seconde fois.
