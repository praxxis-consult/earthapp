import buyerPhoto from '../assets/images/db-product-thumb.png'
import productThumb from '../assets/images/db-product-thumb.png'

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

export const chats: Chat[] = [
  {
    id: 'fejiro',
    name: 'Fejiro Chukwuka',
    photo: buyerPhoto,
    online: true,
    unread: 1,
    preview: 'Typing...',
    previewAt: '10:48 AM',
    typing: true,
    dayLabel: 'TODAY, 10:42 AM',
    messages: [
      {
        id: 'm1',
        from: 'buyer',
        kind: 'text',
        text: "Hi, I'm interested in the organic rice. Is it available for bulk purchase? I need about 50kg. I’m in Okitipupa, Ondo state.",
        at: '10:42 AM',
      },
      {
        id: 'm2',
        from: 'me',
        kind: 'text',
        text: 'Yes, we have 50kg available. We offer a 5% discount for bulk orders over 20kg. Would you like me to send the invoice?',
        at: '10:45 AM',
      },
      {
        id: 'm3',
        from: 'me',
        kind: 'text',
        text: "Delivery to Okitipupa typically takes 2-3 business days. I'll send the invoice now.",
        at: '10:48 AM',
      },
      {
        id: 'm4',
        from: 'me',
        kind: 'invoice',
        number: 'INV-1048',
        summary: 'Organic rice · 50kg',
        amount: 118500,
        paid: true,
        at: '10:48 AM',
      },
      { id: 'm5', from: 'buyer', kind: 'typing' },
    ],
  },
  {
    id: 'oluwaseun',
    name: 'Oluwaseun A.',
    tint: '#e5e6ff',
    online: false,
    unread: 0,
    preview: 'Okay, I will check the product out ...',
    previewAt: '08:13 AM',
    dayLabel: 'TODAY, 07:58 AM',
    messages: [
      {
        id: 'o1',
        from: 'buyer',
        kind: 'text',
        text: 'Good morning. Do you still have the yam tubers in stock?',
        at: '07:58 AM',
      },
      {
        id: 'o2',
        from: 'me',
        kind: 'product',
        title: 'Farm fresh plum tomatoes',
        soldBy: 'Sold by basket',
        unit: '20 kg/basket',
        price: 24000,
        productId: 'single-origin-cocoa-beans',
        at: '08:05 AM',
      },
      {
        id: 'o3',
        from: 'buyer',
        kind: 'text',
        text: 'Okay, I will check the product out and get back to you.',
        at: '08:13 AM',
      },
    ],
  },
  {
    id: 'tayo',
    name: 'Chef Tayo',
    tint: '#e5e6ff',
    online: false,
    unread: 0,
    preview: 'Thanks, will be expecting next week.',
    previewAt: 'Mon',
    dayLabel: 'MONDAY, 4:10 PM',
    messages: [
      {
        id: 't1',
        from: 'buyer',
        kind: 'text',
        text: 'Can you do a weekly supply of 10 baskets of tomatoes to Lekki?',
        at: '4:10 PM',
      },
      {
        id: 't2',
        from: 'me',
        kind: 'text',
        text: 'Yes. The first batch can go out next Tuesday, delivered by motorbike.',
        at: '4:22 PM',
      },
      { id: 't3', from: 'buyer', kind: 'text', text: 'Thanks, will be expecting next week.', at: '4:30 PM' },
    ],
  },
]

export { productThumb }
