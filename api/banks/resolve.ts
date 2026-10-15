import { handleBanks } from '../_lib/paystack'

/** GET /api/banks/resolve?country&bankCode&bankName&accountNumber (served at /v1/banks/resolve). */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const { status, body } = await handleBanks(process.env.PAYSTACK_SECRET_KEY, url.pathname, url.searchParams)
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
}
