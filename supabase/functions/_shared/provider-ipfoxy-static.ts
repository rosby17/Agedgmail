const BASE = 'https://apis.ipfoxy.com/ip/open-api'

export type StaticIpType = 'STATIC_DATACENTER' | 'STATIC_ISP' | 'STATIC_ISP_PRO'

export interface IpfoxyStaticArea {
  id: string
  ip_type: StaticIpType
  status: string | boolean
  list_price: string
  retail_price: string
  ip_version: string
  country: string
  country_code: string
  region: string
}

export interface IpfoxyStaticProxy {
  id: string
  host: string
  public_ip: string
  port: string
  type: string
  area_id: string
  user: string
  password: string
  expire_time: string
  country_code: string
  ip_type: StaticIpType
  ip_version: string
}

function authHeaders(): Record<string, string> {
  const token = Deno.env.get('IPFOXY_API_TOKEN')
  const id = Deno.env.get('IPFOXY_API_ID')
  if (!token || !id) throw new Error('IPFoxy static API is not configured')
  return { 'api-token': token, 'api-id': id }
}

function ipfoxyError(data: any): Error {
  const messages: Record<number, string> = {
    60300: 'Solde fournisseur IPFoxy insuffisant',
    60401: 'Autorisation IPFoxy invalide',
    17019: 'Proxy épuisé dans cette région',
    17012: 'Proxy épuisé dans cette région',
    17011: 'Cette offre proxy a été retirée',
    17002: 'Durée non prise en charge',
    50000: 'Limite de requêtes IPFoxy atteinte',
  }
  return new Error(messages[Number(data?.code)] || `IPFoxy ${data?.code || ''}: ${data?.msg || 'erreur fournisseur'}`)
}

async function request(path: string, params: Record<string, string | number> = {}, method = 'GET'): Promise<any> {
  const url = new URL(`${BASE}/${path}`)
  let body: FormData | undefined
  if (method === 'GET') {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)))
  } else {
    body = new FormData()
    Object.entries(params).forEach(([key, value]) => body!.append(key, String(value)))
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25_000)
  try {
    const response = await fetch(url, { method, headers: authHeaders(), body, signal: controller.signal })
    const data = await response.json().catch(() => null)
    if (!response.ok || data?.code !== 0) throw ipfoxyError(data)
    return data.data
  } finally {
    clearTimeout(timeout)
  }
}

export const listStaticAreas = (): Promise<IpfoxyStaticArea[]> => request('area-list')

export async function getStaticBalance(): Promise<number> {
  const data = await request('account-info')
  return Number(data?.total_balance || 0)
}

export async function getStaticOrderPrice(areaId: string, days: number, quantity: number): Promise<number> {
  const data = await request('order-price', { order_type: 'BUY', area_id: areaId, days, num: quantity, buy_udp: 0 })
  const price = Number(data?.['order price'])
  if (!Number.isFinite(price) || price <= 0) throw new Error('Prix IPFoxy invalide')
  return price
}

export async function buyStaticProxies(areaId: string, days: number, quantity: number): Promise<string> {
  const data = await request('proxy-buy', { area_id: areaId, days, num: quantity, auto_extend: 0, buy_udp: 0 }, 'POST')
  if (!data?.order_id) throw new Error('IPFoxy did not return an order id')
  return String(data.order_id)
}

export async function getStaticOrder(orderId: string): Promise<{ proxy_ids: string[]; deduct_total: string }> {
  return request('order-info', { order_id: orderId })
}

export async function getStaticProxies(proxyIds: string[]): Promise<IpfoxyStaticProxy[]> {
  if (!proxyIds.length) return []
  const data = await request('proxy-list', { proxy_ids: proxyIds.join(','), page: 1, page_size: Math.min(50, proxyIds.length) })
  return Array.isArray(data?.list) ? data.list : []
}
