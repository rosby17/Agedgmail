# Configuration et secrets

## Emplacements

1. Variables Vercel `VITE_*` : publiques dans le bundle.
2. Secrets Supabase Edge Functions : privés et côté serveur.
3. Variables locales Supabase CLI : utilisées par `supabase config push`.

## Frontend

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé anon publique |

Ne jamais placer une clé fournisseur ou `SUPABASE_SERVICE_ROLE_KEY` dans `VITE_*`.

## Variables Supabase natives

`SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sont généralement injectées automatiquement dans les Edge Functions.

## Fournisseurs catalogue

- `YTSELLER_API_KEY`, `YTSELLER_API_URL`
- `AGEDSMM_API_KEY`, `AGEDSMM_API_URL`
- `SMMSHIBA_API_KEY`, `SMMSHIBA_API_URL`

## Proxies

| Variable | Usage |
|---|---|
| `IPFOXY_API_ID`, `IPFOXY_API_TOKEN` | Authentification IPFoxy |
| `IPFOXY_STATIC_MARGIN_PCT` | Marge statique ; 25 en production au dernier contrôle |
| `IPFOXY_STATIC_SALES_ENABLED` | Activation des ventes statiques |
| `PROXY_PROVIDER` | `ipfoxy` ou `iproyal` pour le rotatif |
| `PROXY_MARGIN_PCT` | Marge rotative |
| `PROXY_SALES_ENABLED` | Activation du rotatif |
| `IPROYAL_API_KEY` | API IPRoyal |

Le coût contractuel rotatif peut être fourni par `<PROVIDER>_COST_PER_GB`.

## SMS

- `SMSCODES_API_KEY`
- `PVAPINS_API_KEY`
- `FIVESIM_API_KEY`
- `ONLINESIM_API_KEY`

L’activation est aussi pilotée par `sms_provider_status` dans la console admin.

## Paiements, emails et alertes

- Binance : `BINANCE_API_KEY`, `BINANCE_API_SECRET`, `BINANCE_PAY_ID`, `BINANCE_UID`.
- Maketou : `MAKETOU_API_KEY`, `MAKETOU_PRODUCT_ID`, `USD_TO_FCFA_RATE`.
- Telegram : `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
- Emails : `EMAIL_RELAY_URL`, `EMAIL_RELAY_SECRET`.
- SMTP local : `BREVO_SMTP_LOGIN`, `BREVO_SMTP_PASSWORD`, `BREVO_SENDER_EMAIL`.

## Commandes

```bash
supabase secrets set VARIABLE=value
supabase secrets list
```

Après une modification, vérifier avec un appel sans effet financier.

## Rotation d’un secret compromis

1. Révoquer la clé chez le fournisseur.
2. Créer une nouvelle clé.
3. Exécuter `supabase secrets set`.
4. Redéployer si nécessaire.
5. Vérifier les logs fournisseur et Supabase.
6. Rechercher l’ancienne clé dans Git et les logs locaux.
