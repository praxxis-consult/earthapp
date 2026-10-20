import { describe, it, expect, vi } from 'vitest'
import { DURABLE_EVENTS, SYNC_TAGS, SeenEvents, olderThan, refusal, reopenDelayMs, tagsFor } from '../feature/realtime/events'
import { command, emitLive, onLive, type Commandable } from '../feature/realtime/realtimeClient'
import { ApiError } from '../app/api/problem'

/**
 * The realtime service (Socket.IO) sends identifiers only; the client answers each event by
 * reading over HTTP. These pin the rules the bridge and the thread hook rely on.
 */

describe('tagsFor', () => {
  it('maps every durable event to the queries it makes stale', () => {
    for (const name of DURABLE_EVENTS) expect(tagsFor(name, 'r1').length, name).toBeGreaterThan(0)
    expect(tagsFor('chat.message.created', 'c1')).toEqual(['Chats'])
    expect(tagsFor('notification.read.updated', 'n1')).toEqual(['Notifications'])
    expect(tagsFor('order.dispatch', 'o1')).toEqual(['Orders', { type: 'Orders', id: 'o1' }, 'Overview'])
    expect(tagsFor('payment.verified', 'o1')).toEqual(['Orders', { type: 'Orders', id: 'o1' }, 'Overview'])
    expect(tagsFor('something.else', 'x')).toEqual([])
    expect(SYNC_TAGS).toEqual(['Chats', 'Notifications', 'Orders', 'Overview'])
  })
})

describe('SeenEvents', () => {
  const ev = (eventId: string, resourceId: string, version: string) => ({ eventId, resourceId, version })
  it('applies an event once, however often it is delivered', () => {
    const seen = new SeenEvents()
    expect(seen.accept(ev('e1', 'o1', '1'))).toBe(true)
    expect(seen.accept(ev('e1', 'o1', '1'))).toBe(false)
  })
  it('drops an event older than the resource version already seen, and keeps the others', () => {
    const seen = new SeenEvents()
    expect(seen.accept(ev('e2', 'o1', '5'))).toBe(true)
    expect(seen.accept(ev('e3', 'o1', '4'))).toBe(false)
    expect(seen.accept(ev('e4', 'o1', '5'))).toBe(true) // the same version: another event of the same change
    expect(seen.accept(ev('e5', 'o2', '1'))).toBe(true)
  })
  it('compares versions as integers, not as numbers or strings', () => {
    expect(olderThan('9', '10')).toBe(true)
    expect(olderThan('10', '9')).toBe(false)
    expect(olderThan('9007199254740993', '9007199254740992')).toBe(false)
    expect(olderThan('1', undefined)).toBe(false)
  })
  it('forgets the oldest ids past its limit', () => {
    const seen = new SeenEvents(2)
    seen.accept(ev('a', 'r', '1'))
    seen.accept(ev('b', 'r', '2'))
    seen.accept(ev('c', 'r', '3'))
    expect(seen.accept(ev('a', 'r', '4'))).toBe(true)
  })
})

describe('reopenDelayMs', () => {
  it('waits between one and ten seconds, growing with each reopen', () => {
    expect(reopenDelayMs(1, () => 0)).toBe(1000)
    expect(reopenDelayMs(1, () => 1)).toBe(1500)
    expect(reopenDelayMs(3, () => 0.5)).toBe(4000)
    expect(reopenDelayMs(9, () => 1)).toBe(10_000)
  })
})

describe('refusal', () => {
  it('renews a rejected token, waits out an outage, and gives up on the rest', () => {
    expect(refusal(401)).toBe('renew')
    expect(refusal(503)).toBe('retry')
    expect(refusal(502)).toBe('retry')
    expect(refusal(429)).toBe('retry')
    expect(refusal(undefined)).toBe('retry')
    expect(refusal(403)).toBe('give-up')
    expect(refusal(400)).toBe('give-up')
  })
})

describe('command', () => {
  function fake(reply: (name: string, body: object) => unknown, delay = 0): Commandable & { sent: { name: string; body: object }[] } {
    const sent: { name: string; body: object }[] = []
    return {
      sent,
      timeout: (ms) => ({
        emit(name, body, ack) {
          sent.push({ name, body })
          if (delay > ms) ack(new Error('operation has timed out'))
          else ack(null, reply(name, body) as never)
        },
      }),
    }
  }
  it('resolves with the result of a successful reply', async () => {
    const s = fake(() => ({ ok: true, result: { subscribed: true } }))
    await expect(command(s, 'chat.subscribe', { conversationId: 'c1' })).resolves.toEqual({ subscribed: true })
    expect(s.sent).toEqual([{ name: 'chat.subscribe', body: { conversationId: 'c1' } }])
  })
  it('rejects with the problem of a failed reply, retry wait included', async () => {
    const s = fake(() => ({ ok: false, error: { status: 429, type: 'https://earth.example/problems/rate-limited', detail: 'Slow down', correlationId: 'x', retryAfterSeconds: 7 } }))
    const err = await command(s, 'chat.typing', { conversationId: 'c1', typing: true }).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(429)
    expect((err as ApiError).code).toBe('rate-limited')
    expect((err as ApiError).retryAfter).toBe(7)
  })
  it('rejects when no reply comes in time, so the caller reconciles over HTTP', async () => {
    const s = fake(() => ({ ok: true, result: null }), 10_000)
    const err = await command(s, 'chat.read', { conversationId: 'c1', sequence: '3' }, 5_000).catch((e: unknown) => e)
    expect((err as ApiError).status).toBe(0)
    expect((err as ApiError).message).toContain('no reply in time')
  })
})

describe('onLive', () => {
  it('fans an event out to every listener until each unsubscribes', () => {
    const a = vi.fn()
    const b = vi.fn(() => {
      throw new Error('boom')
    })
    const offA = onLive('chat.typing', a)
    const offB = onLive('chat.typing', b)
    emitLive('chat.typing', { resourceId: 'c1', typing: true })
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
    offB()
    emitLive('chat.typing', { resourceId: 'c1', typing: false })
    expect(a).toHaveBeenCalledTimes(2)
    offA()
    emitLive('chat.typing', {})
    expect(a).toHaveBeenCalledTimes(2)
  })
})
