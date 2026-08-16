# AgedGmailYT

Marketplace de produits numériques construite avec React, Vite et Supabase. La plateforme vend des comptes numériques, des activations SMS et des proxies, avec approvisionnement automatique auprès de fournisseurs tiers. Les fournisseurs restent invisibles pour le client final.

Production : [agedgmail.tools-cl.com](https://agedgmail.tools-cl.com)

## Fonctionnalités

- Catalogue reseller synchronisé depuis YTSeller, AgedSMM et SMMSHIBA.
- Commandes fournisseur automatiques, polling, livraison et remboursement.
- Activations SMS multi-fournisseurs avec code persistant et polling serveur tardif.
- Proxies statiques IPFoxy avec choix du pays, du type, de la zone et de la durée.
- Proxies résidentiels rotatifs via adaptateurs IPFoxy/IPRoyal.
- Paiements Binance Pay et Mobile Money, portefeuille interne et transferts.
- Espaces client : commandes Gmail, SMS, proxies et recharges.
- Console administrateur : commandes, clients, fournisseurs, stock, SMS et proxies.
- API reseller publique sous `/api/v2`.
- Thème clair ou sombre piloté par les préférences de l’appareil.

## Architecture rapide

```text
Navigateur React/Vite
        │
        ├── Supabase Auth + PostgREST
        ├── Supabase Edge Functions ── Fournisseurs externes
        │                              ├── Catalogue et comptes
        │                              ├── IPFoxy / IPRoyal
        │                              ├── Fournisseurs SMS
        │                              └── Binance / Maketou
        └── Supabase Postgres + pg_cron
```

Consultez [l’architecture détaillée](docs/ARCHITECTURE.md) et le [guide d’exploitation](docs/OPERATIONS.md).

## Démarrage local

Prérequis : Node.js 20+, npm et Supabase CLI.

```bash
npm install
cp .env.example .env
npm run dev
```

L’application est disponible par défaut sur `http://127.0.0.1:5173`.

```bash
npm run build    # build de production
npm run lint     # analyse ESLint
npm run preview  # prévisualisation du build
```

## Configuration et déploiement

- Les variables `VITE_*` sont publiques et servent uniquement au client Supabase.
- Tous les secrets fournisseur sont configurés dans Supabase Edge Functions.
- Les identifiants SMTP utilisés par `supabase config push` restent uniquement dans le fichier local `.env`.
- Vercel déploie le frontend depuis `main` ; migrations et Edge Functions se déploient séparément.

Voir [Configuration et secrets](docs/CONFIGURATION.md) et [Exploitation](docs/OPERATIONS.md).

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Configuration et secrets](docs/CONFIGURATION.md)
- [Exploitation, déploiement et dépannage](docs/OPERATIONS.md)
- [API reseller](docs/API.md)
- [Intégration YTSeller](YTSELLER_SETUP.md)
- [Intégration IPFoxy](IPFOXY_SETUP.md)
- [Sécurité](docs/SECURITY.md)
- [Historique de l’audit](AUDIT_REPORT.md)

## Règles essentielles

- Ne jamais committer `.env`, une clé API, la clé `service_role` ou un export de credentials.
- Ne jamais appeler un fournisseur depuis le navigateur.
- Les prix, marges et devis sont calculés et signés côté serveur.
- Toute opération financière doit être atomique et idempotente.
- Les scripts `test_*` à la racine sont locaux et ne font pas partie du produit.

Ce dépôt et sa documentation sont privés.
