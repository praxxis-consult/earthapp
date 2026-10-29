import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// The browser only ever talks to this origin for HTTP: /v1/* is proxied in development here and
// by vercel.json in production, so the refresh cookie the API sets (Path=/v1/auth) stays first-party.
// The prefix is kept as /v1 for the same cookie.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.EARTH_API_TARGET || 'https://earthapi.hellosquare.app'
  const host = new URL(target).host
  // The realtime service (Socket.IO) shares the API's origin unless it is given one of its own.
  const realtime = env.EARTH_REALTIME_TARGET || target
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
        // In development the browser opens the socket on its own origin; CORS does not apply once
        // the Origin header is dropped here, the same as for /v1. Production cannot proxy websockets,
        // so there the browser connects to the API origin itself (src/feature/realtime/realtimeClient.ts).
        '/socket.io': {
          target: realtime,
          ws: true,
          changeOrigin: true,
          headers: { 'ngrok-skip-browser-warning': '1' },
          configure: (proxy) => {
            const strip = (req) => {
              req.removeHeader('origin')
              req.removeHeader('referer')
            }
            proxy.on('proxyReq', strip)
            proxy.on('proxyReqWs', strip)
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
