# Sécurité

## Frontières de confiance

- Le navigateur n’est jamais fiable pour un prix, une marge, un coût ou un statut.
- Les fournisseurs sont appelés uniquement depuis les Edge Functions.
- La clé anon Supabase est publique et ne constitue pas une autorisation.
- La clé `service_role` contourne la RLS et reste côté serveur.

## Contrôles en place

- RLS sur les données client et révocation des tables internes.
- Devis proxy et identifiants SMS signés par HMAC.
- Débits et crédits atomiques via RPC.
- Unicité des transactions Binance confirmées.
- Idempotence durable des achats proxy rotatifs.
- `needs_review` pour les achats IPFoxy statiques ambigus.
- CSP, HSTS, anti-framing et permissions restrictives dans `vercel.json`.

## Données sensibles

Clés API, `service_role`, identifiants proxy, comptes livrés, codes SMS et tokens de paiement ne doivent jamais être écrits dans Git, les Markdown, les variables `VITE_*`, les erreurs client, les URL ou les captures non expurgées.

## Réponse à incident

1. Désactiver la fonctionnalité concernée.
2. Révoquer et remplacer le secret.
3. Identifier commandes et utilisateurs concernés.
4. Examiner les logs Supabase, fournisseur et paiement.
5. Corriger le code et les données via une migration.
6. Documenter sans secret ni credential.

## Audit historique

`AUDIT_REPORT.md` est un instantané du 10 août 2026. Plusieurs points ont été corrigés depuis ; il ne décrit pas l’état de sécurité actuel sans revalidation.
