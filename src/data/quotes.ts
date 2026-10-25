import type { Quote } from '../feature/delivery/deliveryApiSlice'
import { naira } from './orders'

/** A carrier offer as the checkout draws it. */
export interface QuoteView {
  id: string
  /** The courier ("Bubble Express"). */
  name: string
  /** What the buyer pays for the delivery: the carrier's charge plus Earth's delivery markup, as "₦4,095.96"; '' when unknown. */
  delivery: string
  /** The same in naira, for adding offers across stores; undefined when unknown. */
  deliveryNum: number | undefined
  /** Everything the buyer pays with this offer, goods included; '' when unknown. */
  total: string
  /** The goods alone, as the quote prices them; '' when unknown. */
  goods: string
  /** The offer's expiry; quotes last two minutes. */
  expiresAt: string | null
  /** The carrier's delivery estimate ("Within 21 hrs"). */
  eta: string
  /** How long the seller has to accept once paid, in minutes, when the quote says. */
  acceptMinutes: number | null
}

const str = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '')
const first = (q: Record<string, unknown>, keys: string[]): unknown => {
  for (const k of keys) if (q[k] !== undefined && q[k] !== null && q[k] !== '') return q[k]
  return undefined
}
const minor = (v: unknown): number | null => (/^\d+$/.test(str(v)) ? Number(str(v)) : null)
const money = (kobo: number | null): string => (kobo === null ? '' : naira(kobo / 100))

/**
 * Reads a quote as the API answers it (seen on 19 October): `carrierName`, `service`,
 * `deliveryEstimate`, `expiresAt`, `acceptance.minutes`, and kobo strings `goods`, `carrier`,
 * `commission`, `deliveryMarkup`, `tax`, `buyerTotal`. The buyer's delivery price is the carrier's
 * charge plus the markup; `buyerTotal` is goods plus that. Older names are still read as a fallback.
 */
export function quoteView(q: Quote, index: number): QuoteView {
  const named = first(q, ['carrierName', 'courierName', 'serviceName', 'courier', 'carrier', 'name'])
  const name = typeof named === 'object' && named !== null ? str((named as Record<string, unknown>).name) : str(named)
  const carrierFee = minor(q.carrier)
  const markup = minor(q.deliveryMarkup) ?? 0
  const delivery = carrierFee !== null ? carrierFee + markup : minor(first(q, ['deliveryMinor', 'deliveryFee', 'fee']))
  const total = minor(first(q, ['buyerTotal', 'totalMinor', 'total']))
  const goods = minor(first(q, ['goods', 'goodsMinor', 'subtotal']))
  const acceptance = q.acceptance as { minutes?: unknown } | undefined
  const acceptMinutes = typeof acceptance?.minutes === 'number' ? acceptance.minutes : null
  return {
    id: q.id,
    name: name && !/^\d+$/.test(name) ? name : `Carrier option ${index + 1}`,
    delivery: money(delivery),
    deliveryNum: delivery === null ? undefined : delivery / 100,
    total: money(total),
    goods: money(goods),
    expiresAt: str(first(q, ['expiresAt', 'expiry', 'validUntil'])) || null,
    eta: str(first(q, ['deliveryEstimate', 'estimatedDelivery', 'deliveryEta', 'eta'])),
    acceptMinutes,
  }
}

/**
 * A 409 `delivery/shipping-conflict` on a quote with the API's numbers (25 October): the basket's
 * weight against the seller's parcel limit, in whole kilograms; null when the problem carries none.
 */
export function capacityMessage(problem: object, how: 'single' | 'cart' = 'single'): string | null {
  const cap = (problem as { parcelCapacity?: { maxWeightGrams?: string; basketWeightGrams?: string } }).parcelCapacity
  if (!cap?.maxWeightGrams) return null
  const kg = (g: string | undefined) => Math.max(1, Math.round(Number(g ?? 0) / 1000))
  const limit = `this seller ships up to ${kg(cap.maxWeightGrams)} kg in one order`
  return how === 'cart'
    ? `These lines weigh about ${kg(cap.basketWeightGrams)} kg and ${limit}. Order less from them, or collect instead.`
    : `This order weighs about ${kg(cap.basketWeightGrams)} kg and ${limit}. Order fewer, collect it yourself, or message the seller about a larger package.`
}

/** Seconds left on an offer, from its own expiry or the walkthrough's two minutes from when it arrived. */
export function secondsLeft(view: QuoteView, receivedAt: number, now = Date.now()): number {
  const end = view.expiresAt ? new Date(view.expiresAt).getTime() : receivedAt + 120_000
  return Math.max(0, Math.ceil((end - now) / 1000))
}

/** The carrier's answer to a quote that it refused (422): which address it would not accept, and what to say. */
export interface QuoteRefusal {
  /** The buyer's own fields to mark, when the delivery address was refused. */
  fields: Record<string, string>
  message: string
}

const ADDRESS_HINT = 'The carrier could not find this address. Use the street number and road name, the area as the carrier knows it, and the right postal code.'

/**
 * Reads a refused quote by the paths the API names: `pickup` is the seller's collection
 * address, `address` the buyer's delivery address. Neither is something the buyer can fix
 * from here when the pickup is refused; only the buyer's own fields get marked.
 */
export function quoteRefusal(errors: { path?: string; code?: string }[]): QuoteRefusal {
  const pickup = errors.some((e) => e.path === 'pickup')
  const address = errors.some((e) => e.path === 'address' || e.path?.startsWith('address.'))
  // Both refused at once means the carrier call itself is failing on the seller's side; the buyer's fields are not the problem.
  if (pickup && address)
    return { fields: {}, message: 'The carrier refused the seller’s pickup address as well as yours, so this is not about your address: this store’s delivery is not working yet. Try again later, or message the seller.' }
  const fields: Record<string, string> = address ? { street: ADDRESS_HINT, area: 'Check the area.', postalCode: 'Check the postal code.' } : {}
  if (pickup) return { fields, message: 'The carrier does not accept this seller’s pickup address yet, so the store cannot be delivered from. Message the seller so they can fix their delivery setup.' }
  if (address) return { fields, message: 'The carrier could not accept this delivery address. Check the highlighted fields.' }
  return { fields, message: 'The carrier could not quote this order. Check the details and try again.' }
}
