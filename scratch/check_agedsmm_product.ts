// Script de diagnostic : vérifie le produit AgedSMM supplier_product_id
// Exécuter : deno run --allow-net --allow-env check_agedsmm_product.ts

const AGEDSMM_API_KEY = Deno.env.get('AGEDSMM_API_KEY') ?? '45f331c9ff25f8f581d0664005d4eae8'
const AGEDSMM_URL = 'https://agedsmm.com/api/v2'

const body = new URLSearchParams()
body.set('key', AGEDSMM_API_KEY)
body.set('action', 'products')

const res = await fetch(AGEDSMM_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: body.toString(),
})

const products = await res.json()

// Cherche le produit avec Gmail dans le nom
const gmailProducts = products.filter((p: any) => 
  p.name?.toLowerCase().includes('gmail') || 
  p.name?.toLowerCase().includes('g mail')
)

console.log('=== Produits Gmail sur AgedSMM ===')
console.log(JSON.stringify(gmailProducts, null, 2))

// Affiche aussi les types de produits disponibles
const types = [...new Set(products.map((p: any) => p.type))]
console.log('\n=== Types de produits AgedSMM ===')
console.log(types)
