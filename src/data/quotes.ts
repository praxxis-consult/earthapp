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
