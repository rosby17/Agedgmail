# API reseller

## Endpoint

```text
POST https://agedgmail.tools-cl.com/api/v2
Content-Type: application/x-www-form-urlencoded
```

L’API est servie par l’Edge Function `api-v2`. Vercel réécrit `/api/v2` vers Supabase.

## Authentification

Chaque requête contient une clé créée dans l’espace API du client :

```text
key=client_api_key
action=balance
```

Une clé API est un secret client. Elle ne doit pas être placée dans une application frontend publique.

## Réponses et erreurs

Les réponses utilisent JSON. Le client doit contrôler le contenu métier, pas uniquement le statut HTTP.

```json
{
  "error": "Message lisible"
}
```

Les noms des fournisseurs amont ne font pas partie du contrat public.

## Actions catalogue et commandes

### `balance`

Retourne le solde du compte API.

```bash
curl -X POST https://agedgmail.tools-cl.com/api/v2 \
  -d 'key=API_KEY' \
  -d 'action=balance'
```

### `products`

Retourne les produits actifs et leurs prix de vente.

### `add_order`

Crée une commande produit. Paramètres principaux : `product`, `quantity` et, selon le produit, `require`.

### `order_status`

Retourne l’état d’une commande appartenant à la clé API.

### `result`

Retourne la livraison d’une commande terminée.

## Actions SMS

| Action | Rôle |
|---|---|
| `sms_prices` | Pays, services et tarifs disponibles |
| `sms_get_number` | Réserve un numéro |
| `sms_get_code` | Vérifie et retourne le code |
| `sms_cancel` | Annule une réservation compatible |

Le prix et le fournisseur sont recalculés côté serveur. Le client API ne doit jamais envoyer un prix comme source de vérité.

## Sécurité et idempotence

- Une commande ne peut être lue que par le propriétaire de la clé.
- Le solde est débité côté serveur.
- Les codes SMS sont facturés après réception.
- Une intégration cliente doit mémoriser l’identifiant de commande et éviter les soumissions concurrentes.
- Utiliser un timeout réseau ne signifie pas que l’opération fournisseur a échoué ; vérifier le statut avant de rejouer.

## Limites

Les limites de débit et disponibilités peuvent varier par fournisseur. Traiter les erreurs comme temporaires lorsqu’elles indiquent un stock indisponible, une limite atteinte ou une opération encore en cours.
