/**
 * What the Earth realtime service sends over Socket.IO, and the pure rules for handling it.
 *
 * Every durable event carries only identifiers: the client answers it by reading the resource
 * over HTTP, which stays the saved record. A socket event never authorises anything by itself.
 */

/** The durable event names the service registers; each arrives with a delivery callback. */
export const DURABLE_EVENTS = [
  'chat.created',
  'chat.message.created',
  'chat.read.updated',
  'notification.created',
  'notification.read.updated',
  'order.created',
  'order.accept',
  'order.decline',
  'order.ready',
  'order.dispatch',
  'order.complete',
  'order.cancel',
  'order.cancel.confirmed',
  'order.expired',
  'order.evidence.attached',
  'order.claim.created',
  'order.claim.resolved',
  'order.updated',
  'payment.initializing',
  'payment.pending',
  'payment.verified',
  'payment.refund.required',
  'payment.refund.pending',
  'payment.refunded',
  'payment.reversed',
  'payment.review.required',
  'payment.review.cleared',
] as const
export type DurableEventName = (typeof DURABLE_EVENTS)[number]

/** The envelope of every durable event: ids are UUIDs, sequence and version are decimal strings. */
export interface LiveEvent {
  eventId: string
  schemaVersion: 1
  /** The conversation, notification or order the event is about. */
  resourceId: string
  sequence: string
  version: string
  timestamp: string
}
/** `chat.typing`, ephemeral: sent to the subscribed peers, never back to the sender's devices. */
export interface TypingEvent {
  schemaVersion: 1
  resourceId: string
  typing: boolean
  timestamp: string
}
/** `chat.presence` (the command's answer) and `chat.presence.updated` (pushed to subscribers): who in a thread is online now. Ephemeral; asked again after a reconnect. */
export interface PresenceEvent {
  schemaVersion: 1
  resourceId: string
  participants: { accountId: string; online: boolean }[]
  timestamp: string
}
/** `sync.required`: the client must refresh over HTTP and subscribe its open conversations again. */
export interface SyncRequired {
  schemaVersion: 1
  reason: 'connected' | 'redis-reconnected' | (string & {})
}

export type LiveTag = 'Chats' | 'Notifications' | 'Orders' | 'Overview' | { type: 'Orders'; id: string }

/** The queries to read again after a `sync.required`: inbox, counts, threads and orders. */
export const SYNC_TAGS: LiveTag[] = ['Chats', 'Notifications', 'Orders', 'Overview']

/** The queries an event makes stale. The open thread's messages are replayed by the page itself. */
export function tagsFor(name: string, resourceId: string): LiveTag[] {
  if (name.startsWith('chat.')) return ['Chats']
  if (name.startsWith('notification.')) return ['Notifications']
  if (name.startsWith('order.') || name.startsWith('payment.')) return ['Orders', { type: 'Orders', id: resourceId }, 'Overview']
  return []
}

/** Decimal-string versions and sequences compared as integers; they outgrow `Number`. */
export const olderThan = (version: string, known: string | undefined): boolean => known !== undefined && BigInt(version) < BigInt(known)

/**
 * Events can arrive twice or out of order. An event is applied once per id, and an event older
 * than the resource's last seen version is dropped: the refresh it would trigger already ran.
 */
export class SeenEvents {
  private ids = new Set<string>()
  private versions = new Map<string, string>()
  constructor(private limit = 500) {}

  /** True the first time an event is seen and it is not stale; false afterwards. */
  accept(event: Pick<LiveEvent, 'eventId' | 'resourceId' | 'version'>): boolean {
    if (this.ids.has(event.eventId)) return false
    this.remember(event.eventId)
    if (olderThan(event.version, this.versions.get(event.resourceId))) return false
    this.versions.set(event.resourceId, event.version)
    return true
  }

  private remember(id: string) {
    this.ids.add(id)
    if (this.ids.size > this.limit) {
      const oldest = this.ids.values().next().value
      if (oldest !== undefined) this.ids.delete(oldest)
    }
    if (this.versions.size > this.limit) {
      const oldest = this.versions.keys().next().value
      if (oldest !== undefined) this.versions.delete(oldest)
    }
  }
}

/** A typing indicator is dropped after this long without a fresh `chat.typing`. */
export const TYPING_TTL_MS = 10_000
/** The service takes two typing commands a second per conversation; one every 1.5 s stays under it. */
export const TYPING_SEND_GAP_MS = 1_500
/** A pause in typing this long sends `typing: false`. */
export const TYPING_IDLE_MS = 3_000
/** Durable events must be acknowledged within 5 s; commands wait this long for a reply. */
export const COMMAND_TIMEOUT_MS = 5_000
/** How many times a socket the server closed or refused is reopened before the app stays on polling. */
export const MAX_SERVER_DISCONNECTS = 5

/**
 * What to do with a handshake the service refused. A rejected token is renewed once; a passing
 * outage (the service answers 503 while its stores are unavailable), too many connections (429)
 * or no answer at all is tried again after a wait, since the SDK reopens only a dropped transport,
 * never a refused one; anything else (a forbidden account, a bad request) stays on polling.
 */
export type Refusal = 'renew' | 'retry' | 'give-up'
export function refusal(status: number | undefined): Refusal {
  if (status === 401) return 'renew'
  if (status === undefined || status === 0 || status === 429 || status >= 500) return 'retry'
  return 'give-up'
}

/** A jittered 1–10 s wait for the n-th reopen after the server closed the socket. */
export function reopenDelayMs(attempt: number, random = Math.random): number {
  const base = Math.min(10_000, 1_000 * 2 ** Math.max(0, attempt - 1))
  return Math.round(Math.min(10_000, Math.max(1_000, base * (0.5 + random()))))
}
