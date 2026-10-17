import { apiSlice } from '../../app/api/apiSlice'
import { allPages } from '../stores/storesApiSlice'

/* ---------- what the API sends ---------- */

export interface ChatParty {
  id: string
  name: string
  firstName: string
  lastName: string
  avatar: string | null
}
export interface ChatProduct {
  id: string
  storeId: string
  name: string
  currency: string
  /** Minor units, as every price on the API. */
  price: string
  image: string | null
}
export interface ChatAsset {
  id: string
  ownerAccountId: string
  contentType: string
  size: number
  /** A signed link that lasts about a minute from the read; absent on the send acknowledgement. */
  url?: string
}
export interface ChatInvoice {
  orderId: string
  invoiceNumber: string
  amount: string
  currency: 'NGN'
  summary: { name: string; quantity: number }[]
  itemCount: number
  paid: true
  paidAt: string
  refundedMinor: string
  refundOutstandingMinor: string
}
export type ChatKind = 'TEXT' | 'PRODUCT' | 'MEDIA' | 'INVOICE'
export type ChatPayload = { text: string } | { product: ChatProduct } | { assets: ChatAsset[] } | { invoice: ChatInvoice }
export interface ChatMessage {
  id: string
  /** Position in the thread, counted from 1 as a decimal string. */
  sequence: string
  senderId: string
  clientMessageId: string
  kind: ChatKind
  payload: ChatPayload
  createdAt: string
}
export interface ChatThread {
  id: string
  storeId: string
  storeName: string
  store: { id: string; name: string }
  buyer: ChatParty
  seller: ChatParty
  lastSequence: string
  lastMessageAt: string
  lastMessage: { id: string; sequence: string; kind: ChatKind; senderId: string; text: string | null } | null
  /** The signed-in account's unread messages in this thread, as a decimal string. */
  unreadCount: string
}
/** `POST /chats`: the thread (new or existing) between the buyer and the store. */
export interface ChatStart {
  id: string
  storeId: string
  buyerId: string
  sellerId: string
  lastSequence: string
  product?: ChatProduct
}
/** A thread's messages, oldest first, and the newest sequence read so far. */
export interface ChatHistory {
  items: ChatMessage[]
  lastSequence: string | null
}
export type SendBody =
  | { kind: 'TEXT'; text: string }
  | { kind: 'PRODUCT'; productId: string }
  | { kind: 'MEDIA'; uploadIds: string[] }
  | { kind: 'INVOICE'; orderId: string }

const bySequence = (a: ChatMessage, b: ChatMessage) => Number(a.sequence) - Number(b.sequence)

/** Adds messages to a history without duplicates (a poll and a send can both deliver one). */
function merge(history: ChatHistory, incoming: ChatMessage[]) {
  const seen = new Set(history.items.map((m) => m.id))
  for (const m of incoming) if (!seen.has(m.id)) history.items.push(m)
  history.items.sort(bySequence)
  history.lastSequence = history.items.length ? history.items[history.items.length - 1].sequence : history.lastSequence
}

/** Moves a thread to the top of the list with its newest message. */
function bump(threads: ChatThread[], chatId: string, m: ChatMessage, unread: (t: ChatThread) => string) {
  const i = threads.findIndex((t) => t.id === chatId)
  if (i < 0) return
  const t = threads[i]
  if (Number(m.sequence) <= Number(t.lastSequence)) return
  const text = 'text' in m.payload ? m.payload.text : null
  threads.splice(i, 1)
  threads.unshift({ ...t, lastSequence: m.sequence, lastMessageAt: m.createdAt, lastMessage: { id: m.id, sequence: m.sequence, kind: m.kind, senderId: m.senderId, text }, unreadCount: unread(t) })
}

/**
 * Conversations between a buyer and a store. The API has no live channel, so the open thread
 * is polled for messages after its last sequence, and the list is polled for new threads and
 * unread counts (see the hooks' `pollingInterval`s in the pages).
 */
export const chatsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** Every thread of the signed-in account, newest activity first. */
    listChats: builder.query<ChatThread[], void>({
      queryFn: (_, __, ___, baseQuery) => allPages<ChatThread>((page) => baseQuery(`/chats?limit=50&page=${page}`)),
      providesTags: ['Chats'],
    }),
    /** A thread's whole history (the API pages it newest first; here it reads oldest first). */
    getMessages: builder.query<ChatHistory, string>({
      async queryFn(chatId, _, __, baseQuery) {
        const res = await allPages<ChatMessage>((page) => baseQuery(`/chats/${encodeURIComponent(chatId)}/messages?limit=50&page=${page}`))
        if ('error' in res) return res
        const items = res.data.sort(bySequence)
        return { data: { items, lastSequence: items.length ? items[items.length - 1].sequence : null } }
      },
    }),
    /** Messages after a sequence; they are folded into the thread's history and the list. */
    newerMessages: builder.query<ChatMessage[], { chatId: string; afterSequence: string }>({
      query: ({ chatId, afterSequence }) => `/chats/${encodeURIComponent(chatId)}/messages?afterSequence=${encodeURIComponent(afterSequence)}&limit=50`,
      transformResponse: (res: { items: ChatMessage[] }) => res.items.sort(bySequence),
      keepUnusedDataFor: 0,
      async onQueryStarted({ chatId }, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled
          if (!data.length) return
          dispatch(chatsApiSlice.util.updateQueryData('getMessages', chatId, (draft) => merge(draft, data)))
          const me = (getState() as { auth: { account: { id: string } | null } }).auth.account?.id
          const last = data[data.length - 1]
          const mine = data.filter((m) => m.senderId !== me).length
          dispatch(chatsApiSlice.util.updateQueryData('listChats', undefined, (draft) => bump(draft, chatId, last, (t) => String(Number(t.unreadCount) + mine))))
        } catch {
          /* the next poll tries again */
        }
      },
    }),
    /** One message; the client id makes a retry safe. */
    sendMessage: builder.mutation<ChatMessage, { chatId: string; body: SendBody }>({
      query: ({ chatId, body }) => ({ url: `/chats/${encodeURIComponent(chatId)}/messages`, method: 'POST', body: { clientMessageId: crypto.randomUUID(), ...body } }),
      async onQueryStarted({ chatId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(chatsApiSlice.util.updateQueryData('getMessages', chatId, (draft) => merge(draft, [data])))
          dispatch(chatsApiSlice.util.updateQueryData('listChats', undefined, (draft) => bump(draft, chatId, data, (t) => t.unreadCount)))
        } catch {
          /* the composer reports the failure */
        }
      },
    }),
    /** Moves the read position up to a sequence; the thread's unread count drops to zero. */
    markRead: builder.mutation<{ sequence: string; unreadCount: string }, { chatId: string; sequence: string }>({
      query: ({ chatId, sequence }) => ({ url: `/chats/${encodeURIComponent(chatId)}/read`, method: 'POST', body: { sequence } }),
      async onQueryStarted({ chatId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            chatsApiSlice.util.updateQueryData('listChats', undefined, (draft) => {
              const t = draft.find((x) => x.id === chatId)
              if (t) t.unreadCount = data.unreadCount
            }),
          )
        } catch {
          /* the count stays until the next list poll */
        }
      },
    }),
    /** A buyer opens (or returns to) the thread with a store, about a listing when one is given. */
    startChat: builder.mutation<ChatStart, { storeId: string; productId?: string }>({
      query: (body) => ({ url: '/chats', method: 'POST', body }),
      invalidatesTags: ['Chats'],
    }),
  }),
})

export const { useListChatsQuery, useGetMessagesQuery, useLazyNewerMessagesQuery, useSendMessageMutation, useMarkReadMutation, useStartChatMutation } = chatsApiSlice

/** What a thread's last message reads as in the list. */
export function previewOf(t: ChatThread): string {
  const m = t.lastMessage
  if (!m) return 'No messages yet'
  if (m.kind === 'TEXT') return m.text ?? ''
  if (m.kind === 'PRODUCT') return 'Sent a product'
  if (m.kind === 'MEDIA') return 'Sent a photo'
  return 'Sent an invoice'
}
