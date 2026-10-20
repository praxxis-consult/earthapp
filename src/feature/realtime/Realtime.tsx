import { useEffect } from 'react'
import { apiSlice, refreshOnce } from '../../app/api/apiSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { store } from '../../app/store'
import { selectAuth } from '../authentication/authSlice'
import { DURABLE_EVENTS, MAX_SERVER_DISCONNECTS, SYNC_TAGS, SeenEvents, refusal, reopenDelayMs, tagsFor, type LiveEvent, type LiveTag, type SyncRequired, type TypingEvent } from './events'
import { emitLive, openSocket, setSocketToken } from './realtimeClient'
import { setLive } from './realtimeSlice'

/** A burst of events (an order paid: several payment and order events at once) refreshes each query once. */
const COALESCE_MS = 200

/**
 * The bridge between the realtime service and the app's queries. Mounted once, for the whole
 * session: it opens the socket when the account is confirmed, acknowledges every durable event
 * and marks the queries it makes stale (so the pages showing them read again over HTTP), hands
 * chat events to the open thread, and reopens the socket when the service closes it, a bounded
 * number of times. While it is connected, `realtime.live` is true and the pages stop polling.
 */
export default function Realtime() {
  const dispatch = useAppDispatch()
  const { status, accessToken } = useAppSelector(selectAuth)

  // Each refreshed token goes on the socket, which presents it on its next (re)connection.
  useEffect(() => {
    if (accessToken) setSocketToken(accessToken)
  }, [accessToken])

  useEffect(() => {
    if (status !== 'authenticated') return
    const token = store.getState().auth.accessToken
    if (!token) return
    const socket = openSocket(token)
    const seen = new SeenEvents()
    let gone = false
    let closures = 0
    let reopen: ReturnType<typeof setTimeout> | undefined
    let renewedOnce = false

    const stale = new Map<string, LiveTag>()
    let flush: ReturnType<typeof setTimeout> | undefined
    const invalidate = (tags: LiveTag[]) => {
      for (const t of tags) stale.set(typeof t === 'string' ? t : `${t.type}:${t.id}`, t)
      flush ??= setTimeout(() => {
        flush = undefined
        const batch = [...stale.values()]
        stale.clear()
        if (batch.length) dispatch(apiSlice.util.invalidateTags(batch))
      }, COALESCE_MS)
    }

    const onConnect = () => {
      renewedOnce = false
      dispatch(setLive(true))
    }
    // The service asks for an HTTP refresh on every (re)connection; pages resubscribe their open threads on the same event.
    const onSync = (event: SyncRequired) => {
      invalidate(SYNC_TAGS)
      emitLive('sync.required', event)
    }
    // A socket the server closed or refused is reopened after a jittered wait, at most a few times
    // in all (the SDK's own reconnection covers a dropped transport, and only that).
    const reopenLater = (retryAfterSeconds = 0) => {
      if (gone || ++closures > MAX_SERVER_DISCONNECTS) return
      reopen = setTimeout(
        () => {
          if (!gone) socket.connect()
        },
        Math.max(reopenDelayMs(closures), retryAfterSeconds * 1_000),
      )
    }
    // A refused handshake: one rejected token is renewed and tried again at once; a passing outage
    // is tried again later; anything else stays on polling.
    const onConnectError = async (error: Error & { data?: { status?: number; retryAfterSeconds?: number } }) => {
      dispatch(setLive(false))
      if (socket.active || gone) return // the SDK is reopening a dropped transport
      const verdict = refusal(error.data?.status)
      if (verdict === 'retry') return reopenLater(error.data?.retryAfterSeconds)
      if (verdict !== 'renew' || renewedOnce) return
      renewedOnce = true
      if ((await refreshOnce(dispatch)) && !gone) {
        socket.auth = { token: store.getState().auth.accessToken }
        socket.connect()
      }
    }
    // A socket the server closed is checked (credentials still valid?) before it is reopened.
    const onDisconnect = async (reason: string) => {
      dispatch(setLive(false))
      if (reason !== 'io server disconnect' || gone) return
      if (!(await refreshOnce(dispatch)) || gone) return
      socket.auth = { token: store.getState().auth.accessToken }
      reopenLater()
    }
    // Once the bounded reconnection gave up, coming back to the tab tries once more.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !socket.active) socket.connect()
    }
    const onTyping = (event: TypingEvent) => emitLive('chat.typing', event)
    const durable = DURABLE_EVENTS.map((name) => {
      const handler = (event: LiveEvent, acknowledge?: () => void) => {
        acknowledge?.() // receipt only, within the service's 5 s; reading is reported separately
        if (!seen.accept(event)) return
        invalidate(tagsFor(name, event.resourceId))
        emitLive(name, event)
      }
      socket.on(name, handler)
      return { name, handler }
    })

    socket.on('connect', onConnect)
    socket.on('connect_error', onConnectError)
    socket.on('disconnect', onDisconnect)
    socket.on('sync.required', onSync)
    socket.on('chat.typing', onTyping)
    document.addEventListener('visibilitychange', onVisible)
    socket.connect()

    return () => {
      gone = true
      clearTimeout(reopen)
      clearTimeout(flush)
      document.removeEventListener('visibilitychange', onVisible)
      socket.off('connect', onConnect)
      socket.off('connect_error', onConnectError)
      socket.off('disconnect', onDisconnect)
      socket.off('sync.required', onSync)
      socket.off('chat.typing', onTyping)
      for (const { name, handler } of durable) socket.off(name, handler)
      socket.disconnect()
      dispatch(setLive(false))
    }
  }, [status, dispatch])

  return null
}
