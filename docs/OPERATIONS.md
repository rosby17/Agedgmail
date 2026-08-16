# Guide d’exploitation

## Mise en production

### Vérifications locales

```bash
npm run build
git diff --check
git status --short
```

Exclure `.env`, `supabase/.temp`, les scripts `test_*` et tout export de credentials.

### Base Supabase

```bash
supabase migration list
supabase db push
```

Appliquer les migrations avant le code qui en dépend.

### Edge Functions

```bash
supabase functions deploy <fonction>
```

Les fonctions sensibles conservent `verify_jwt=true`. Les fonctions cron reçoivent un JWT depuis `private.get_anon_key()` ; ne pas les publier avec `--no-verify-jwt` sans justification et revue de sécurité.

### Frontend

```bash
git add <fichiers-validés>
git commit -m "type: description"
git push origin main
```

Vercel déploie automatiquement `main`. Vérifier ensuite :

```bash
curl -I https://agedgmail.tools-cl.com
```

## Crons

| Job | Fréquence | Rôle |
|---|---:|---|
| `dropship-poll-orders-every-minute` | 1 min | Commandes fournisseur |
| `sms-poll-pending-every-minute` | 1 min | Codes tardifs jusqu’à 25 min |
| `cancel-stale-orders-every-10-min` | 10 min | Paiements expirés |
| `maketou-poll-pending` | voir migration | Mobile Money |
| synchronisations catalogue | périodique | Coûts, disponibilité et produits |
| suppression des commandes | mensuel | Conservation des 30 derniers jours |

```sql
select jobid, jobname, schedule, active from cron.job order by jobname;
```

## Contrôles quotidiens

- Soldes des fournisseurs catalogue et IPFoxy.
- Santé et activation des fournisseurs SMS.
- Commandes `processing` anciennes ou `needs_review`.
- Sessions SMS `failed` ou `processing` anciennes.
- Erreurs Edge Functions et alertes Telegram.
- Écart entre prix de vente et coût fournisseur.

## Incidents

### Solde fournisseur insuffisant

1. Désactiver temporairement la vente.
2. Recharger le fournisseur.
3. Contrôler les commandes en attente.
4. Relancer uniquement une commande sans identifiant fournisseur.
5. Ne jamais rejouer un achat dont la réponse réseau est ambiguë.

### Proxy statique `needs_review`

IPFoxy statique ne documente pas de clé d’idempotence. Rechercher d’abord la commande chez IPFoxy. Si elle existe, récupérer ses `proxy_ids` et finaliser. Sinon seulement, rembourser ou relancer.

### SMS tardif

Le navigateur poll pendant 15 minutes et le cron poursuit jusqu’à 25 minutes.

```sql
select id, user_id, number, status, expires_at, error_message
from public.sms_pending_sessions
order by created_at desc
limit 50;
```

Un succès est copié dans `orders.delivery_data.code` et `orders.credentials`.

## Conservation et sauvegarde

- Les commandes suivent la politique existante des 30 derniers jours.
- Les credentials ne doivent pas apparaître dans les logs.
- Les migrations sont la source de vérité du schéma.

## Rollback

- Frontend : utiliser un commit correctif, pas un reset destructif.
- Edge Function : redéployer la version Git précédente.
- Base : créer une migration corrective ; ne jamais supprimer des livraisons sans sauvegarde.

## Checklist après déploiement

- HTTP 200 en production.
- Authentification et restauration de session.
- Catalogue sans nom de fournisseur exposé.
- Devis conformes aux marges serveur.
- Classement Gmail, proxies, SMS et recharges.
- Interfaces proxy client et admin.
- Achat réel uniquement avec autorisation et petit montant.
