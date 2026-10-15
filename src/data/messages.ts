import productThumb from '../assets/images/db-product-thumb.png'
import { sampleChats } from './messages.sample'
import { sampleMode } from './sample'

export type Message =
  | { id: string; from: 'buyer' | 'me'; kind: 'text'; text: string; at: string }
  | {
      id: string
      from: 'me'
      kind: 'invoice'
      number: string
      summary: string
      amount: number
      paid: boolean
      at: string
    }
  | {
      id: string
      from: 'me'
      kind: 'product'
      title: string
      soldBy: string
      unit: string
      price: number
      productId: string
      /** The listing's primary photo; the bundled thumb when a seeded chat has none. */
      image?: string
      at: string
    }
  /** Figma "media (image, vid) message" (584:12751): a 230×232 photo or video card. */
  | { id: string; from: 'buyer' | 'me'; kind: 'media'; url: string; video?: boolean; at: string }
  | { id: string; from: 'buyer'; kind: 'typing' }

export interface Chat {
  id: string
  name: string
  /** A photo, or initials on a tint when there is none (Figma "Avatars"). */
  photo?: string
  tint?: string
  online: boolean
  unread: number
  /** The list row's second line and time. */
  preview: string
  previewAt: string
  typing?: boolean
  dayLabel: string
  messages: Message[]
}

/**
 * The store's conversations. The API has no messaging endpoint yet, so this is empty and the
 * page shows its zero state; the endpoint's threads replace this list. In development the
 * sample threads in ./messages.sample.ts can be switched on (see ./sample.ts).
 */
export const chats: Chat[] = sampleMode() ? sampleChats : []

/** Unread conversations, for the sidebar badge. */
export const unreadChats = chats.filter((c) => c.unread > 0).length

export { productThumb }
