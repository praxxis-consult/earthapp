import { describe, it, expect } from 'vitest'
import { canCancel, filterPurchases, purchaseFromApi, purchaseStats, purchaseTabMatches } from '../data/purchases'
import type { OrderSummary } from '../feature/orders/ordersApiSlice'

const summary = (over: Partial<OrderSummary>): OrderSummary => ({
  id: 'ord-1',
  storeId: 's1',
  buyerName: 'Ada Obi',
  storeName: 'Akpolo Agro',
  status: 'PENDING',
  paymentStatus: 'PAID',
  createdAt: '2026-10-18T09:30:00Z',
  paidAt: '2026-10-18T09:31:00Z',
  currency: 'NGN',
  total: '1250000',
  itemCount: 1,
  firstItem: 'Yellow Garri',
  item: { name: 'Yellow Garri', thumbnail: null, quantity: 5, weightGrams: 2500, priceMinor: '250000' },
  deliveryMethod: 'SHIPPING',
  version: 1,
  ...over,
})

describe('purchases', () => {
  it('maps the API summary into the shared order row, kobo to naira, the store as the seller', () => {
    const o = purchaseFromApi(summary({}))
    expect(o.id).toBe('ord-1')
    expect(o.item.soldBy).toBe('Akpolo Agro')
    expect(o.item.price).toBe(2500)
    expect(o.payment.subtotal).toBe(12500)
    expect(o.item.weightKg).toBe(2.5)
    expect(o.status).toBe('new')
    expect(o.item.image).toBe('')
  })
  it('counts the stat cards from the statuses', () => {
    const rows = ['PENDING', 'ACCEPTED', 'READY', 'DISPATCHED', 'COMPLETED', 'CANCELLED', 'DECLINED'].map((status, i) => purchaseFromApi(summary({ id: `o${i}`, status })))
    expect(purchaseStats(rows)).toEqual({ total: 7, awaiting: 1, inProgress: 3, completed: 1 })
    expect(purchaseStats([])).toEqual({ total: 0, awaiting: 0, inProgress: 0, completed: 0 })
  })
  it('tabs: declined sits with cancelled; search matches id, store or item', () => {
    expect(purchaseTabMatches('cancelled', 'declined')).toBe(true)
    expect(purchaseTabMatches('completed', 'declined')).toBe(false)
    expect(purchaseTabMatches('all', 'ready')).toBe(true)
    const rows = [purchaseFromApi(summary({})), purchaseFromApi(summary({ id: 'ord-2', storeName: 'Green Farm', status: 'COMPLETED', item: { ...summary({}).item, name: 'Cocoa' } }))]
    expect(filterPurchases(rows, 'all', 'green').map((o) => o.id)).toEqual(['ord-2'])
    expect(filterPurchases(rows, 'all', 'garri').map((o) => o.id)).toEqual(['ord-1'])
    expect(filterPurchases(rows, 'completed', '').map((o) => o.id)).toEqual(['ord-2'])
    expect(filterPurchases(rows, 'new', 'ord-2')).toEqual([])
  })
  it('only an order the seller has not started on can be cancelled', () => {
    expect(canCancel('new')).toBe(true)
    for (const s of ['processing', 'ready', 'dispatched', 'completed', 'cancelled', 'declined'] as const) expect(canCancel(s)).toBe(false)
  })
})
