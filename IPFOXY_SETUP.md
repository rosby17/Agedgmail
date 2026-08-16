# Intégration IPFoxy

## Périmètre

Deux intégrations distinctes utilisent les mêmes credentials serveur :

1. **Proxies statiques dédiés** : API standard IPFoxy, active en production.
2. **Résidentiel rotatif reseller** : API sous-comptes, soumise à activation contractuelle.

API de base : `https://apis.ipfoxy.com/ip/open-api`. Authentification par en-têtes `api-token` et `api-id`.

## Secrets

```bash
supabase secrets set \
  IPFOXY_API_ID=... \
  IPFOXY_API_TOKEN=... \
  IPFOXY_STATIC_MARGIN_PCT=25 \
  IPFOXY_STATIC_SALES_ENABLED=true
```

Pour le rotatif :

```bash
supabase secrets set \
  PROXY_PROVIDER=ipfoxy \
  IPFOXY_COST_PER_GB=... \
  PROXY_MARGIN_PCT=... \
  PROXY_SALES_ENABLED=false
```

Conserver `PROXY_SALES_ENABLED=false` tant que l’API **Rotating Residential Reseller** n’est pas activée et testée.

## Proxies statiques

### Fonctions

- `proxy-static-catalog` : zones disponibles et prix de vente public.
- `proxy-static-quote` : prix exact fournisseur, marge et devis signé.
- `proxy-static-purchase` : débit, achat, récupération et livraison.
- `_shared/provider-ipfoxy-static.ts` : client API serveur.
- `_shared/proxy-static-pricing.ts` : marge et signature.

### Endpoints IPFoxy

| Endpoint | Usage |
|---|---|
| `GET /area-list` | Pays, zones, type et disponibilité |
| `GET /account-info` | Solde fournisseur |
| `GET /order-price` | Prix exact achat/renouvellement |
| `POST /proxy-buy` | Achat |
| `GET /order-info` | `proxy_ids` de la commande |
| `GET /proxy-list` | Credentials et expiration |

### Sécurité et idempotence

Le catalogue public expose uniquement le prix de vente. Le coût brut reste serveur. Le devis expire après dix minutes et est signé par HMAC.

IPFoxy ne documente pas de clé d’idempotence pour `proxy-buy`. Après une erreur réseau ambiguë, la requête passe à `needs_review` et ne doit pas être rejouée sans recherche préalable dans IPFoxy.

### Livraison et interfaces

Les credentials sont enregistrés dans `orders.delivery_data.proxies` et `orders.credentials`. Le client les consulte dans « Mes commandes » puis « Gérer mes proxies ». L’admin utilise `/app/admin/proxies`.

## Proxies rotatifs

### Fonctions

- `proxy-get-prices` : paliers et devis signé.
- `proxy-purchase` : création/recharge du sous-compte.
- `_shared/proxy-provider.ts` : sélection IPFoxy/IPRoyal.
- `_shared/provider-ipfoxy.ts` : API reseller IPFoxy.
- `proxy_accounts` : credentials privés et volume acheté.
- `proxy_purchase_requests` : idempotence durable.

Le gateway IPFoxy configuré est `gate-us.ipfoxy.io:58688`. Les identifiants fournisseur ne doivent jamais être lus directement depuis le navigateur.

## Déploiement

```bash
supabase db push
supabase functions deploy proxy-static-catalog
supabase functions deploy proxy-static-quote
supabase functions deploy proxy-static-purchase
supabase functions deploy proxy-get-prices
supabase functions deploy proxy-purchase
```

## Validation

1. Contrôler le solde avec `account-info`.
2. Charger le catalogue et un devis sans achat.
3. Avec autorisation, acheter une seule IP sur un compte test.
4. Vérifier commande IPFoxy, credentials, expiration et commande locale.
5. Recharger la page et vérifier « Mes proxies ».
6. Vérifier le coût, le prix de vente et la marge dans l’admin.
7. Provoquer une erreur contrôlée sans rejouer une commande ambiguë.

La valeur des secrets Supabase, et non ce document, constitue la configuration opérationnelle réelle.
