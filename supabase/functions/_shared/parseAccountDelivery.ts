// Miroir Deno de src/lib/parseAccountDelivery.js — gardez les deux fichiers
// synchronisés en cas de changement de logique (pas de partage de module
// possible entre le bundle Vite du front et les Edge Functions Deno).
export interface ParsedAccount {
  email: string
  password: string
  recoveryEmail?: string
  recoveryPassword?: string
  appPassword?: string
  totpSecret?: string
}

export function parseAccountDelivery(rawLine: string): ParsedAccount {
  if (typeof rawLine !== 'string' || !rawLine.trim()) {
    throw new Error('empty_input')
  }

  const parts = rawLine.split(':').map((p) => p.trim())
  const email = parts[0]
  const password = parts[1]

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !password) throw new Error('missing_required_fields')
  if (!emailPattern.test(email)) throw new Error('invalid_email_format')

  const result: ParsedAccount = { email, password }
  const leftovers = parts.slice(2).filter((p) => p.length > 0)
  const unclassified: string[] = []

  for (const part of leftovers) {
    const noSpaces = part.replace(/\s+/g, '')
    if (!result.recoveryEmail && emailPattern.test(part)) {
      result.recoveryEmail = part
    } else if (!result.totpSecret && noSpaces.length === 32) {
      result.totpSecret = noSpaces
    } else if (!result.appPassword && noSpaces.length === 16) {
      result.appPassword = noSpaces
    } else {
      unclassified.push(part)
    }
  }

  if (unclassified.length > 0) result.recoveryPassword = unclassified[0]

  return result
}

/** Masque une valeur secrète pour les logs serveur (jamais de credential en clair). */
export function maskSecret(value?: string | null): string {
  if (!value) return String(value)
  const s = String(value)
  if (s.length <= 4) return '*'.repeat(s.length)
  return `${s.slice(0, 2)}${'*'.repeat(s.length - 4)}${s.slice(-2)}`
}
