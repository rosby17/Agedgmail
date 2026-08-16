# Activation IPFoxy

L'intégration utilise l'API **Rotating Residential Reseller** d'IPFoxy.
Un compte IPFoxy standard ne suffit pas : demander l'activation au support
avec le mot-clé `Rotating Residential Reseller API`.

## 1. Appliquer la migration

```bash
supabase db push
```

Migration concernée :
`supabase/migrations/20260816010000_ipfoxy_proxy_provider.sql`.

## 2. Configurer les secrets serveur

```bash
supabase secrets set \
  PROXY_PROVIDER=ipfoxy \
  IPFOXY_API_ID=... \
  IPFOXY_API_TOKEN=... \
  IPFOXY_COST_PER_GB=... \
  PROXY_MARGIN_PCT=30 \
  PROXY_SALES_ENABLED=false
```

- `IPFOXY_COST_PER_GB` : coût contractuel réel en USD par Go vendu.
- `PROXY_MARGIN_PCT` : marge ajoutée au coût, en pourcentage.
- les identifiants IPFoxy ne doivent jamais être placés dans une variable
  `VITE_*` ni envoyés au navigateur.
- conserver `PROXY_SALES_ENABLED=false` jusqu'à la confirmation écrite de
  l'activation de l'API revendeur et la réussite d'un achat pilote.

## 3. Déployer les fonctions

```bash
supabase functions deploy proxy-get-prices
supabase functions deploy proxy-purchase
```

## 4. Validation avant ouverture

1. Acheter une petite capacité résidentielle dans le compte principal.
2. Faire un achat de 2 Go avec un compte client de test.
3. Vérifier la création du sous-compte dans IPFoxy.
4. Rejouer la même requête et vérifier qu'aucun double crédit n'a lieu.
5. Acheter de nouveau 2 Go et vérifier l'allocation incrémentale.
6. Tester les identifiants sur `gate-us.ipfoxy.io:58688`.
7. Activer les ventes avec
   `supabase secrets set PROXY_SALES_ENABLED=true`, puis redéployer les deux
   fonctions proxy.

Le fournisseur IPRoyal reste disponible en repli avec
`PROXY_PROVIDER=iproyal` et `IPROYAL_API_KEY`.
