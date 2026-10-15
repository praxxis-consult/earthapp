import { handleBanks } from '../_lib/paystack'

/** GET /api/banks?country=NG (served at /v1/banks by the rewrite in vercel.json). */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const { status, body } = await handleBanks(process.env.PAYSTACK_SECRET_KEY, url.pathname, url.searchParams)
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': status === 200 ? 'public, max-age=3600' : 'no-store' },
  })
}
