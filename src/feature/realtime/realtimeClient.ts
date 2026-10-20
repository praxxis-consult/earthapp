import { io, type Socket } from 'socket.io-client'
import { ApiError } from '../../app/api/problem'
import { COMMAND_TIMEOUT_MS } from './events'

/**
 * The Earth realtime service is a separate host from the HTTP API. In production its address
 * comes from `VITE_REALTIME_URL` (an https origin; the browser then speaks CORS and WSS to it).
 * Left unset, the app connects to its own origin under /socket.io/, which the dev server proxies
 * to the API (or `EARTH_REALTIME_TARGET`, vite.config.js) and a static deployment does not serve at
 * all; the connection then fails and every page keeps polling, exactly as before there was a live channel.
 */
export const REALTIME_URL: string | undefined = (import.meta.env.VITE_REALTIME_URL as string | undefined)?.trim() || undefined

let socket: Socket | null = null

/**
 * The one socket of this tab. The confirmed access token travels in `auth`, never in the URL;
 * the service joins the connection to its account room by itself. Automatic reconnection is
 * bounded, as the service asks, and `autoConnect` is off so the bridge decides when to open it.
 */
export function openSocket(token: string): Socket {
  if (!socket) {
    const options = {
      path: '/socket.io/',
      transports: ['websocket'],
      auth: { token },
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
    }
    socket = REALTIME_URL ? io(REALTIME_URL, options) : io(options)
  } else {
    socket.auth = { token }
  }
  return socket
}

/** The socket, when the bridge has opened one. */
export const currentSocket = (): Socket | null => socket

/** After a token refresh the next (re)connection must present the new token. */
export function setSocketToken(token: string) {
  if (socket) socket.auth = { token }
}

/** What a failed command carries back; the same problem fields as an HTTP error. */
export interface CommandFailure {
  status: number
  type?: string
  detail?: string
  correlationId?: string
  retryAfterSeconds?: number
}
type Reply<T> = { ok: true; result: T } | { ok: false; error: CommandFailure }
/** Enough of a socket to send a command: what `socket.timeout(ms)` returns. */
export interface Commandable {
  timeout(ms: number): { emit(name: string, body: object, ack: (timeout: Error | null, reply?: Reply<unknown>) => void): unknown }
}

/**
 * Sends one of the five commands and resolves with its result. Every command needs a callback
 * (the service disconnects a client that sends without one); a timeout means the outcome is
 * uncertain and the caller reconciles over HTTP, so it rejects like any failure.
 */
export function command<T>(target: Commandable, name: string, body: object, timeoutMs = COMMAND_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    target.timeout(timeoutMs).emit(name, body, (timeout, reply) => {
      if (timeout) return reject(new ApiError(0, { title: 'No reply from the live connection', detail: `${name} got no reply in time.` }))
      if (!reply || !reply.ok) {
        const e = reply && !reply.ok ? reply.error : undefined
        return reject(new ApiError(e?.status ?? 0, { type: e?.type, title: e?.detail, detail: e?.detail, correlationId: e?.correlationId }, e?.retryAfterSeconds))
      }
      resolve(reply.result as T)
    })
  })
}

/* ---------- in-app fan-out of what the socket delivers ---------- */

type Handler<T = unknown> = (payload: T) => void
const handlers = new Map<string, Set<Handler>>()

/** Pages listen for an event by name (e.g. `chat.message.created`, `chat.typing`, `sync.required`). */
export function onLive<T = unknown>(name: string, fn: Handler<T>): () => void {
  let set = handlers.get(name)
  if (!set) handlers.set(name, (set = new Set()))
  set.add(fn as Handler)
  return () => {
    set!.delete(fn as Handler)
  }
}

/** The bridge hands an event to every listener; one throwing listener does not stop the others. */
export function emitLive(name: string, payload: unknown) {
  handlers.get(name)?.forEach((fn) => {
    try {
      fn(payload)
    } catch {
      /* a page's handler failing is its own problem */
    }
  })
}
