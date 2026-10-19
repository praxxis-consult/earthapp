import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// The Earth API is plain HTTP with no CORS, so the browser only ever talks to this origin:
// /v1/* is proxied in development here and by vercel.json in production. The prefix is kept
// as /v1 because the refresh cookie the API sets is scoped to Path=/v1/auth.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.EARTH_API_TARGET || 'http://qaaniuvtddbfg3oi3mroui5u.62.171.189.223.sslip.io'
  const host = new URL(target).host
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/v1': {
          target,
          changeOrigin: false,
          // The ngrok header skips the tunnel's browser warning page when the API is reached through one.
          headers: { host, 'ngrok-skip-browser-warning': '1' },
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
