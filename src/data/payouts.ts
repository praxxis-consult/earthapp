import { samplePaid, samplePayouts, samplePending, sampleProgress } from './payouts.sample'
import { sampleMode } from './sample'

/**
 * Payouts (payout 592:15295). The API has no payouts endpoint yet, so the figures are zero, the
 * store sits on the starting limit and there are no transactions; the endpoint replaces these.
 * In development the sample figures in ./payouts.sample.ts can be switched on (see ./sample.ts).
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

const sample = sampleMode()

export const paid = sample ? samplePaid : 0
export const pending = sample ? samplePending : 0

/** The order-limit tiers are platform policy from the design; the store's position on them is data. */
export const orderLimit = {
  ...(sample ? sampleProgress : { current: 500_000, inProgress: 0, goodOrders: 0, buyers: 0 }),
  tiers: [
    ['Starting limit', 500_000],
    ['After 10 good orders from 5 buyers', 1_000_000],
    ['After 25 good orders', 5_000_000],
    ['Platform activities', 'Unlimited'],
  ] as [string, number | string][],
}

export const payouts: Payout[] = sample ? samplePayouts : []

export const received = (p: Payout) => p.amount - p.commission - p.vat + p.deliveryFee
