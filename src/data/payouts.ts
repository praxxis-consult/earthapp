import type { PayoutSummary } from '../feature/payouts/payoutsApiSlice'

/**
 * Payouts (payout 592:15295) as the page draws them, from `GET /payouts/me` (25 October). The
 * API's money is kobo strings; the page shows naira. The order-limit tiers come from the risk
 * policy the API applies to this store, with the labels the frame uses for them.
 */
export interface Payout {
  orderId: string
  buyer: string
  date: string
  amount: number
  commission: number
  vat: number
  deliveryFee: number
}

export interface OrderLimit {
  current: number
  inProgress: number
  goodOrders: number
  buyers: number
  tiers: [string, number][]
}

export interface PayoutView {
  paid: number
  pending: number
  orderLimit: OrderLimit
  payouts: Payout[]
  /** The provider has not confirmed these figures lately. */
  stale: boolean
  test: boolean
}

const naira = (kobo: string | undefined) => Number(kobo ?? 0) / 100

/** "Starting limit", "After 10 good orders from 5 buyers", "After 25 good orders". */
export function tierLabel(t: { goodOrders: number; distinctBuyers: number }, index: number): string {
  if (index === 0 || (t.goodOrders === 0 && t.distinctBuyers === 0)) return 'Starting limit'
  const orders = `After ${t.goodOrders} good ${t.goodOrders === 1 ? 'order' : 'orders'}`
  return t.distinctBuyers > 0 ? `${orders} from ${t.distinctBuyers} ${t.distinctBuyers === 1 ? 'buyer' : 'buyers'}` : orders
}

export function payoutView(s: PayoutSummary): PayoutView {
  return {
    paid: naira(s.paidAllTime),
    pending: naira(s.pending),
    orderLimit: {
      current: naira(s.risk.current),
      inProgress: naira(s.risk.inProgress),
      goodOrders: s.risk.goodOrders,
      buyers: s.risk.distinctQualifyingBuyers,
      tiers: s.risk.tiers.map((t, i) => [tierLabel(t, i), naira(t.limit)] as [string, number]),
    },
    payouts: s.items.map((r) => ({
      orderId: r.orderId,
      buyer: r.buyer,
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: naira(r.amount),
      commission: naira(r.commission),
      vat: naira(r.vat),
      deliveryFee: naira(r.delivery),
    })),
    stale: s.reconciliation.stale,
    test: s.environment === 'test',
  }
}

/** What reaches the seller from a row: the API's `net`, which is goods less commission and VAT plus the delivery share. */
export const received = (p: Payout) => p.amount - p.commission - p.vat + p.deliveryFee
