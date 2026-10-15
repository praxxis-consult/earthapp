/**
 * The two Paystack calls behind /v1/banks and /v1/banks/resolve. They run server-side only
 * (a Vercel function in production, a dev-server middleware locally) because Paystack's
 * secret key must never reach the browser. The Earth API can take these over later by
 * serving the same two paths; nothing in the app changes.
 */

/** Paystack names countries, not ISO codes. */
const COUNTRY: Record<string, string> = { NG: 'nigeria', GH: 'ghana', KE: 'kenya', ZA: 'south africa' }

export interface BankOption {
  code: string
  name: string
}

export class LookupError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function paystack<T>(key: string, path: string): Promise<T> {
  const res = await fetch(`https://api.paystack.co${path}`, { headers: { Authorization: `Bearer ${key}` } })
  const body = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: T } | null
  if (!res.ok || !body?.status) {
    // 400/422 from Paystack means "no such account" or "unknown bank"; anything else is ours to explain
    const status = res.status === 400 || res.status === 422 ? 422 : res.status === 401 ? 503 : 502
    throw new LookupError(status, body?.message || `Paystack answered ${res.status}`)
  }
  return body.data as T
}

/** `GET /bank?country=nigeria` → the banks and their codes, A to Z. */
export async function listBanks(key: string, country: string): Promise<BankOption[]> {
  const name = COUNTRY[country.toUpperCase()]
  if (!name) throw new LookupError(422, 'Bank lookup is not available for that country yet.')
  const data = await paystack<{ name: string; code: string; active: boolean }[]>(key, `/bank?country=${encodeURIComponent(name)}&perPage=100`)
  // Paystack lists some banks more than once under one name (different codes for the same brand);
  // the dropdown keys on the name, so keep the first of each.
  const seen = new Set<string>()
  return data
    .filter((b) => b.active !== false)
    .filter((b) => (seen.has(b.name) ? false : (seen.add(b.name), true)))
    .map((b) => ({ code: b.code, name: b.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** `GET /bank/resolve` → the name the bank holds for the account. */
export async function resolveAccount(
  key: string,
  params: { country: string; bankCode?: string; bankName?: string; accountNumber: string },
): Promise<{ accountName: string; accountNumber: string; bankCode: string }> {
  let code = params.bankCode
  if (!code && params.bankName) {
    const banks = await listBanks(key, params.country)
    const wanted = params.bankName.trim().toLowerCase()
    code = banks.find((b) => b.name.toLowerCase() === wanted)?.code ?? banks.find((b) => b.name.toLowerCase().includes(wanted))?.code
  }
  if (!code) throw new LookupError(422, 'Choose a bank from the list.')
  if (!/^\d{10}$/.test(params.accountNumber)) throw new LookupError(422, 'Enter the 10-digit account number.')
  const data = await paystack<{ account_name: string; account_number: string }>(
    key,
    `/bank/resolve?account_number=${params.accountNumber}&bank_code=${encodeURIComponent(code)}`,
  )
  return { accountName: data.account_name, accountNumber: data.account_number, bankCode: code }
}

/** Reads the query, runs the lookup, and shapes the response; shared by the function and the dev middleware. */
export async function handleBanks(key: string | undefined, pathname: string, search: URLSearchParams): Promise<{ status: number; body: unknown }> {
  if (!key) return { status: 503, body: { title: 'Bank lookup is not configured.', detail: 'PAYSTACK_SECRET_KEY is not set on the server.' } }
  try {
    if (/\/resolve$/.test(pathname)) {
      const body = await resolveAccount(key, {
        country: search.get('country') || 'NG',
        bankCode: search.get('bankCode') || undefined,
        bankName: search.get('bankName') || undefined,
        accountNumber: search.get('accountNumber') || '',
      })
      return { status: 200, body }
    }
    return { status: 200, body: await listBanks(key, search.get('country') || 'NG') }
  } catch (e) {
    const err = e instanceof LookupError ? e : new LookupError(502, 'The bank could not be reached.')
    return { status: err.status, body: { title: err.message, detail: err.message, status: err.status } }
  }
}
