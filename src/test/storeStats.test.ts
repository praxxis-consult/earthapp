import { describe, it, expect } from 'vitest'
import { replyTime, storeFacts, storeRating } from '../lib/storeStats'
import { payoutView, tierLabel } from '../data/payouts'
import { capacityMessage } from '../data/quotes'
import type { PayoutSummary } from '../feature/payouts/payoutsApiSlice'

describe('store statistics', () => {
  it('shows completed trades and the reply time only when the projections are ready', () => {
    expect(storeFacts({ statisticsStatus: 'READY', completedOrders: '1', replyTimeStatus: 'AVAILABLE', typicalReplyTimeSeconds: 30 })).toEqual(['1 completed trade', 'Replies in under a minute'])
    expect(storeFacts({ statisticsStatus: 'READY', completedOrders: '37', replyTimeStatus: 'AVAILABLE', typicalReplyTimeSeconds: 7200 })).toEqual(['37 completed trades', 'Replies in ~2 hours'])
    // pending or null is "not known yet", never a zero; a zero count is no fact either
    expect(storeFacts({ statisticsStatus: 'PENDING', completedOrders: null, replyTimeStatus: 'PENDING', typicalReplyTimeSeconds: null })).toEqual([])
    expect(storeFacts({ statisticsStatus: 'READY', completedOrders: '0', replyTimeStatus: 'INSUFFICIENT_DATA', typicalReplyTimeSeconds: null })).toEqual([])
  })
  it('words a reply time', () => {
    expect(replyTime(59)).toBe('under a minute')
    expect(replyTime(90)).toBe('~2 minutes')
    expect(replyTime(3600)).toBe('~1 hour')
    expect(replyTime(3 * 86400)).toBe('~3 days')
  })
  it('keeps a null rating as no rating, not zero stars', () => {
    expect(storeRating({ ratingAverage: null, ratingCount: '0' })).toBeNull()
    expect(storeRating({ ratingAverage: '4.5', ratingCount: '12' })).toEqual({ average: 4.5, count: 12 })
  })
})

describe('payouts', () => {
  const summary: PayoutSummary = {
    currency: 'NGN', environment: 'test', paidAllTime: '0', pending: '21460000',
    risk: { currency: 'NGN', policyId: 'earth-ngn-risk-2026-10-16', current: '50000000', inProgress: '0', remaining: '50000000', goodOrders: 1, distinctQualifyingBuyers: 1, tiers: [{ limit: '50000000', goodOrders: 0, distinctBuyers: 0 }, { limit: '100000000', goodOrders: 10, distinctBuyers: 5 }, { limit: '500000000', goodOrders: 25, distinctBuyers: 0 }] },
    reconciliation: { lastSyncedAt: '2026-10-25T11:55:20Z', stale: false },
    items: [{ orderId: 'o1', buyer: 'Ada', date: '2026-10-25T12:00:00Z', currency: 'NGN', amount: '13000000', commission: '975000', vat: '0', delivery: '0', net: '12025000', settlementId: 's1' }],
    page: 1, limit: 50, hasNext: false, nextPage: null,
  }
  it('turns kobo strings into naira and the risk tiers into the frame’s labels', () => {
    const v = payoutView(summary)
    expect(v.pending).toBe(214600)
    expect(v.orderLimit).toMatchObject({ current: 500000, inProgress: 0, goodOrders: 1, buyers: 1 })
    expect(v.orderLimit.tiers).toEqual([['Starting limit', 500000], ['After 10 good orders from 5 buyers', 1000000], ['After 25 good orders', 5000000]])
    expect(v.payouts[0]).toMatchObject({ orderId: 'o1', amount: 130000, commission: 9750, vat: 0, deliveryFee: 0 })
    expect(tierLabel({ goodOrders: 1, distinctBuyers: 1 }, 2)).toBe('After 1 good order from 1 buyer')
  })
})

describe('capacity conflict', () => {
  it('says the basket weight and the seller’s limit in kilograms when the API gives them', () => {
    expect(capacityMessage({ parcelCapacity: { maxWeightGrams: '200000', basketWeightGrams: '251000' } })).toBe('This order weighs about 251 kg and this seller ships up to 200 kg in one order. Order fewer, collect it yourself, or message the seller about a larger package.')
    expect(capacityMessage({ parcelCapacity: { maxWeightGrams: '200000', basketWeightGrams: '251000' } }, 'cart')).toContain('Order less from them, or collect instead.')
    expect(capacityMessage({})).toBeNull()
  })
})
