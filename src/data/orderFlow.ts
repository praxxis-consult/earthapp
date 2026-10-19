import type { OrderSummary, PaymentConfirmation, TimelineEvent } from '../feature/orders/ordersApiSlice'
import type { OrderStatus } from './orders'

/**
 * The rules of an order's life, as the seller-and-buyer walkthrough states them:
 *  - a new order has fifteen minutes to be paid, else it expires and a fresh quote is needed;
 *  - the seller accepts (or declines) only a verified-paid order, then marks it ready, which
 *    books the carrier; dispatch follows the carrier's collection and completion its delivery;
 *  - the buyer can cancel outright before acceptance; after acceptance or READY the request
 *    waits on the carrier; once collected, a claim is the way.
 */

/** Payment is settled on the API's own word, never on a redirect or a success screen. */
export const isPaid = (o: Pick<OrderSummary, 'paymentStatus'>): boolean => o.paymentStatus === 'PAID'

/** True when an unpaid order's window has closed. */
export function paymentExpired(o: Pick<OrderSummary, 'paymentStatus' | 'expiresAt'>, now = Date.now()): boolean {
  if (isPaid(o) || !o.expiresAt) return false
  return new Date(o.expiresAt).getTime() <= now
}

/** An order the buyer can still pay: created, unpaid, within its window and not closed. */
export function awaitingPayment(o: Pick<OrderSummary, 'paymentStatus' | 'expiresAt' | 'status'>, now = Date.now()): boolean {
  return !isPaid(o) && !paymentExpired(o, now) && !['CANCELLED', 'DECLINED', 'EXPIRED'].includes(o.status)
}

/** Whole seconds until the payment window closes (0 when there is none or it has passed). */
export function paymentSecondsLeft(o: Pick<OrderSummary, 'expiresAt'>, now = Date.now()): number {
  if (!o.expiresAt) return 0
  return Math.max(0, Math.ceil((new Date(o.expiresAt).getTime() - now) / 1000))
}

export const mmss = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/** What the buyer's Cancel means at each stage; null once cancelling is no longer the way. */
export function cancelMeaning(status: OrderStatus): string | null {
  if (status === 'new') return 'The order closes now and your payment is refunded.'
  if (status === 'processing' || status === 'ready') return 'The seller is told. If a carrier is already booked, the cancellation waits for the carrier to confirm, and the refund follows.'
  return null
}

export const canCancel = (status: OrderStatus): boolean => cancelMeaning(status) !== null

/** The seller's next step at each stage, and the real-world fact it depends on. */
export type SellerStep = 'accept' | 'ready' | 'dispatch' | 'complete' | null
export function sellerStep(status: OrderStatus): SellerStep {
  switch (status) {
    case 'new':
      return 'accept'
    case 'processing':
      return 'ready'
    case 'ready':
      return 'dispatch'
    case 'dispatched':
      return 'complete'
    default:
      return null
  }
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const pick = (o: Record<string, unknown>, keys: string[]): string => {
  for (const k of keys) {
    const v = o[k]
    if (typeof v === 'string' && v) return v
    if (typeof v === 'object' && v !== null && typeof (v as { name?: unknown }).name === 'string') return (v as { name: string }).name
  }
  return ''
}

/** A timeline event as the page lists it: the event's name and when, read leniently (its fields are not documented). */
export function timelineView(e: TimelineEvent): { label: string; at: string | null } {
  const raw = pick(e, ['type', 'kind', 'event', 'status', 'title', 'name'])
  const label = raw.replace(/^order[._-]?/i, '').replace(/[._-]+/g, ' ').trim()
  const at = pick(e, ['at', 'occurredAt', 'createdAt', 'timestamp', 'recordedAt'])
  return { label: label ? label[0].toUpperCase() + label.slice(1).toLowerCase() : 'Event', at: at || null }
}

/** When the timeline reached a step: the first event whose name matches, or null. */
export function stepTime(events: TimelineEvent[], ...words: string[]): string | null {
  for (const e of events) {
    const v = timelineView(e)
    if (words.some((w) => v.label.toLowerCase().includes(w))) return v.at
  }
  return null
}

/** The carrier booking's tracking, read leniently from `fulfillmentDelivery`. */
export function trackingView(fd: Record<string, unknown> | null | undefined): { url: string; number: string; courier: string } | null {
  if (!fd) return null
  const url = pick(fd, ['trackingUrl', 'trackingLink', 'tracking_url', 'url'])
  const number = pick(fd, ['trackingNumber', 'trackingCode', 'tracking_number', 'reference', 'labelReference'])
  const courier = pick(fd, ['courierName', 'courier', 'carrierName', 'carrier', 'serviceName'])
  return url || number || courier ? { url, number, courier } : null
}

/** What the confirm step found, in the buyer's words. */
export function confirmOutcome(c: PaymentConfirmation): { paid: boolean; title: string; body: string } {
  const paid = str(c.status).toUpperCase() === 'PAID' || str(c.orderStatus).toUpperCase() === 'PAID'
  if (paid && c.refundRequired)
    return { paid, title: 'Paid, but too late', body: 'The payment arrived after the order’s window closed, so it will be refunded. Place the order again to buy.' }
  if (paid) return { paid, title: 'Payment confirmed', body: 'The seller has been told and will accept the order next.' }
  return { paid, title: 'Not confirmed yet', body: `Paystack has not confirmed this payment${c.status ? ` (${str(c.status).toLowerCase()})` : ''}. If you paid, give it a moment and check again.` }
}
