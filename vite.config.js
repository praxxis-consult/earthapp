import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { handleBanks } from './api/_lib/paystack'

// The Earth API is plain HTTP with no CORS, so the browser only ever talks to this origin:
// /v1/* is proxied in development here and by vercel.json in production. The prefix is kept
// as /v1 because the refresh cookie the API sets is scoped to Path=/v1/auth.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.EARTH_API_TARGET || 'http://qaaniuvtddbfg3oi3mroui5u.62.171.189.223.sslip.io'
  const host = new URL(target).host
  return {
    plugins: [react(), tailwindcss(), bankLookup(env.PAYSTACK_SECRET_KEY)],
    server: {
      proxy: {
        '/v1': {
          target,
          changeOrigin: false,
          headers: { host },
          // The API refuses "cross-site" credentials by comparing Origin with its own host, which a
          // proxy can never satisfy; dropping the header here is what the production proxy also needs.
          configure: (proxy) => {
            proxy.on('proxyReq', (req) => {
              req.removeHeader('origin')
              req.removeHeader('referer')
            })
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  }
})

/**
 * The bank lookup (Paystack, server-side) at /v1/banks and /v1/banks/resolve, the same paths
 * the Vercel functions under api/banks serve in production. Registered before Vite's proxy, so
 * these two never reach the Earth API until it serves them itself.
 */
function bankLookup(key) {
  return {
    name: 'earth-bank-lookup',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        if (!/^\/v1\/banks(\/resolve)?$/.test(url.pathname)) return next()
        const { status, body } = await handleBanks(key, url.pathname, url.searchParams)
        res.statusCode = status
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(body))
      })
    },
  }
}
