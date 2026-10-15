import buyerPhoto from '../assets/images/db-product-thumb.png'
import type { Chat } from './messages'

/**
 * Sample conversations (the frame's Fejiro, Oluwaseun and Chef Tayo threads, with text, product,
 * media and invoice messages). Not shown unless the development switch in ./sample.ts is on.
 */
export const sampleChats: Chat[] = [
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
