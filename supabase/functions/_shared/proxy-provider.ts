import { createOrTopupIpfoxyAccount } from './provider-ipfoxy.ts'
import { createOrTopupSubuser } from './provider-iproyal.ts'

export type ProxyProviderName = 'ipfoxy' | 'iproyal'

export interface ProxyProvisionResult {
  provider: ProxyProviderName
  accountId: string
  host: string
  port: number
  username: string
  password: string
}

export interface ExistingProxyAccount {
  provider?: string | null
  provider_account_id?: string | null
  iproyal_subuser_id?: string | null
  gateway_username?: string | null
  gateway_password?: string | null
}

export function configuredProxyProvider(): ProxyProviderName {
  const provider = (Deno.env.get('PROXY_PROVIDER') || 'ipfoxy').toLowerCase()
  if (provider !== 'ipfoxy' && provider !== 'iproyal') {
    throw new Error(`Unsupported PROXY_PROVIDER: ${provider}`)
  }
  return provider
}

export async function provisionProxyTraffic(
  userId: string,
  gb: number,
  idempotencyKey: string,
  existing?: ExistingProxyAccount | null,
): Promise<ProxyProvisionResult> {
  const provider = configuredProxyProvider()

  if (existing?.provider && existing.provider !== provider) {
    throw new Error(`Proxy account belongs to ${existing.provider}; automatic provider migration is disabled`)
  }

  if (provider === 'ipfoxy') {
    return createOrTopupIpfoxyAccount(userId, gb, idempotencyKey, existing?.provider_account_id ? {
      accountId: existing.provider_account_id,
      username: existing.gateway_username || '',
      password: existing.gateway_password || '',
    } : null)
  }

  const result = await createOrTopupSubuser(
    userId,
    gb,
    existing?.provider_account_id || existing?.iproyal_subuser_id || null,
    existing ? {
      username: existing.gateway_username || '',
      password: existing.gateway_password || '',
    } : null,
  )
  return { provider: 'iproyal', accountId: result.subuserId, ...result }
}
