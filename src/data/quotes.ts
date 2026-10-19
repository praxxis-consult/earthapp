import type { Quote } from '../feature/delivery/deliveryApiSlice'
import { naira } from './orders'

/** A carrier offer as the checkout draws it. */
export interface QuoteView {
  id: string
  /** The courier or service, or "Carrier option N" until the answer names one. */
  name: string
  /** "₦1,200.00", or '' when the offer carries no total the page recognises. */
  total: string
  /** The offer's expiry, if it says; quotes last two minutes. */
  expiresAt: string | null
  /** The carrier's delivery estimate, if it says. */
  eta: string
}

const str = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '')
const first = (q: Record<string, unknown>, keys: string[]): unknown => {
  for (const k of keys) if (q[k] !== undefined && q[k] !== null && q[k] !== '') return q[k]
  return undefined
}

/**
 * Reads a quote leniently. The walkthrough says each returned item has an id, a total and an
 * expiry, and stands for one courier or service; it does not name those fields and QA cannot
 * produce a quote yet, so the likely names are tried and the page degrades to the id.
 */
export function quoteView(q: Quote, index: number): QuoteView {
  const named = first(q, ['courierName', 'carrierName', 'serviceName', 'courier', 'carrier', 'service', 'name'])
  const name = typeof named === 'object' && named !== null ? str((named as Record<string, unknown>).name) : str(named)
  // Amounts on this API are kobo; a nested money object carries `amountMinor`.
  const money = first(q, ['total', 'totalMinor', 'amountMinor', 'amount', 'priceMinor', 'price', 'fee'])
  const minor = typeof money === 'object' && money !== null ? str((money as Record<string, unknown>).amountMinor) : str(money)
  const expires = str(first(q, ['expiresAt', 'expiry', 'validUntil']))
  const eta = str(first(q, ['estimatedDelivery', 'deliveryEta', 'eta', 'estimatedDeliveryDate']))
  return {
    id: q.id,
    name: name || `Carrier option ${index + 1}`,
    total: /^\d+$/.test(minor) ? naira(Number(minor) / 100) : '',
    expiresAt: expires || null,
    eta,
  }
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
  const fields: Record<string, string> = address ? { street: ADDRESS_HINT, area: 'Check the area.', postalCode: 'Check the postal code.' } : {}
  if (pickup && address)
    return { fields, message: 'The carrier refused both the seller’s pickup address and this delivery address, so no quote is possible right now. Check your address, or try again later; the seller has been told.' }
  if (pickup) return { fields, message: 'The carrier does not accept this seller’s pickup address yet, so the store cannot be delivered from. Message the seller so they can fix their delivery setup.' }
  if (address) return { fields, message: 'The carrier could not accept this delivery address. Check the highlighted fields.' }
  return { fields, message: 'The carrier could not quote this order. Check the details and try again.' }
}
