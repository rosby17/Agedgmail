// IPFoxy Rotating Residential Reseller API.
// Documentation: https://www.ipfoxy.com/help/docs/MKHineSI
// Authentication is server-only through api-token/api-id headers.

const BASE = 'https://apis.ipfoxy.com/ip/open-api'
const GATEWAY_HOST = 'gate-us.ipfoxy.io'
const GATEWAY_PORT = 58688

export interface IpfoxyAccountResult {
  provider: 'ipfoxy'
  accountId: string
  host: string
  port: number
  username: string
  password: string
}

function authHeaders(): Record<string, string> {
  const apiToken = Deno.env.get('IPFOXY_API_TOKEN')
  const apiId = Deno.env.get('IPFOXY_API_ID')
  if (!apiToken || !apiId) {
    throw new Error('IPFOXY_API_TOKEN or IPFOXY_API_ID is not configured')
  }
  return { 'api-token': apiToken, 'api-id': apiId }
}

function formBody(values: Record<string, string | number>): FormData {
  const body = new FormData()
  for (const [key, value] of Object.entries(values)) body.append(key, String(value))
  return body
}

function normalizeError(data: unknown): Error {
  const payload = data as { code?: number; msg?: string }
  const raw = payload?.msg || JSON.stringify(data)
  const lower = raw.toLowerCase()
  if (payload?.code === 60300 || lower.includes('insufficient') || lower.includes('flow')) {
    return new Error(`not enough balance (ipfoxy): ${raw}`)
  }
  return new Error(`ipfoxy error${payload?.code ? ` ${payload.code}` : ''}: ${raw}`)
}

async function post(path: string, values: Record<string, string | number>): Promise<any> {
  const response = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: formBody(values),
  })
  const data = await response.json().catch(() => null)
  // IPFoxy's business result is carried by `code`; HTTP 200 alone is not success.
  if (!response.ok || data?.code !== 0) throw normalizeError(data)
  return data.data
}

function generateCredentials(userId: string): { account: string; password: string } {
  // Reseller API requires both values to be 10-15 characters.
  const suffix = userId.replace(/-/g, '').slice(0, 10)
  return {
    account: `ag${suffix}`.slice(0, 15),
    password: crypto.randomUUID().replace(/-/g, '').slice(0, 14),
  }
}

/** Convert the signed-plan GB amount to IPFoxy's documented MB unit. */
function gbToMb(gb: number): number {
  return Math.round(gb * 1000)
}

/**
 * Creates one IPFoxy reseller account per customer, then incrementally adds
 * traffic on later purchases. `idempotencyKey` must be stable for retries.
 */
export async function createOrTopupIpfoxyAccount(
  userId: string,
  gb: number,
  idempotencyKey: string,
  existing?: { accountId: string; username: string; password: string } | null,
): Promise<IpfoxyAccountResult> {
  const flow = gbToMb(gb)

  if (existing?.accountId) {
    await post('allocate-flow-sub-account', {
      account: existing.accountId,
      flow,
      idempotency_key: idempotencyKey,
      day: 0,
    })
    return {
      provider: 'ipfoxy',
      accountId: existing.accountId,
      host: GATEWAY_HOST,
      port: GATEWAY_PORT,
      username: existing.username || `customer-${existing.accountId}`,
      password: existing.password,
    }
  }

  const { account, password } = generateCredentials(userId)
  const data = await post('create-sub-account', {
    account,
    password,
    flow,
    idempotency_key: idempotencyKey,
    day: 0,
    proxy_type: 2,
  })
  const createdAccount = String(data?.account || account)
  const createdPassword = String(data?.password || password)

  return {
    provider: 'ipfoxy',
    accountId: createdAccount,
    host: GATEWAY_HOST,
    port: GATEWAY_PORT,
    // IPFoxy documents the `customer-` prefix for rotating proxy logins.
    username: `customer-${createdAccount}`,
    password: createdPassword,
  }
}
