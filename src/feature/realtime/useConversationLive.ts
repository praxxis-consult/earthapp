import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../../app/hooks'
import { TYPING_IDLE_MS, TYPING_SEND_GAP_MS, TYPING_TTL_MS, type LiveEvent, type SyncRequired, type TypingEvent } from './events'
import { command, currentSocket, onLive } from './realtimeClient'
import { selectLive } from './realtimeSlice'

export interface ConversationLive {
  /** True once the service accepted `chat.subscribe` for this thread; the page then stops polling it. */
  subscribed: boolean
  /** The other side is typing (dropped after 10 s without a fresh signal). */
  peerTyping: boolean
  /** Call on every keystroke: sends `typing: true` at most every 1.5 s and `false` after a pause. */
  noteTyping: () => void
  /** Call when a message is sent or the composer is cleared. */
  stopTyping: () => void
}

/**
 * The open thread's live side. While the socket is up it subscribes the conversation (again
 * after every `sync.required`), asks the page to replay new messages over HTTP whenever one is
 * announced (the socket never carries the text), relays the peer's typing, and sends this
 * side's typing within the service's limits. Without a socket everything here is inert and the
 * page polls as it always did.
 */
export function useConversationLive(conversationId: string, replay: () => void): ConversationLive {
  const live = useAppSelector(selectLive)
  const [subscribed, setSubscribed] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const latestReplay = useRef(replay)
  useEffect(() => {
    latestReplay.current = replay
  })
  const sent = useRef({ at: 0, typing: false })
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!live || !conversationId) return
    const socket = currentSocket()
    if (!socket) return
    let gone = false
    let ttl: ReturnType<typeof setTimeout> | undefined

    const subscribe = () =>
      command<{ subscribed: boolean }>(socket, 'chat.subscribe', { conversationId }).then(
        () => {
          if (gone) return
          setSubscribed(true)
          latestReplay.current() // anything that landed while there was no subscription
        },
        () => {
          if (!gone) setSubscribed(false)
        },
      )
    void subscribe()

    const offs = [
      onLive<SyncRequired>('sync.required', () => void subscribe()),
      onLive<LiveEvent>('chat.message.created', (e) => {
        if (e.resourceId === conversationId) latestReplay.current()
      }),
      onLive<TypingEvent>('chat.typing', (e) => {
        if (e.resourceId !== conversationId) return
        clearTimeout(ttl)
        setPeerTyping(e.typing)
        if (e.typing) ttl = setTimeout(() => setPeerTyping(false), TYPING_TTL_MS)
      }),
    ]
    return () => {
      gone = true
      offs.forEach((off) => off())
      clearTimeout(ttl)
      setPeerTyping(false)
      setSubscribed(false)
      sent.current = { at: 0, typing: false }
      if (socket.connected) command(socket, 'chat.unsubscribe', { conversationId }).catch(() => {})
    }
  }, [live, conversationId])

  const send = useCallback(
    (typing: boolean) => {
      const socket = currentSocket()
      if (!socket?.connected || !subscribed) return
      sent.current = { at: Date.now(), typing }
      command(socket, 'chat.typing', { conversationId, typing }).catch(() => {})
    },
    [conversationId, subscribed],
  )
  const stopTyping = useCallback(() => {
    clearTimeout(idle.current)
    if (sent.current.typing) send(false)
  }, [send])
  const noteTyping = useCallback(() => {
    clearTimeout(idle.current)
    idle.current = setTimeout(stopTyping, TYPING_IDLE_MS)
    if (!sent.current.typing || Date.now() - sent.current.at >= TYPING_SEND_GAP_MS) send(true)
  }, [send, stopTyping])

  useEffect(() => () => clearTimeout(idle.current), [])

  return { subscribed, peerTyping, noteTyping, stopTyping }
}
