import { describe, it, expect } from 'vitest'
import { DEFAULT_FILTERS, ORDER_FILTER_GROUPS, activeFilterCount, applyFilters, inRange } from '../data/orderFilters'
import { orderFromOverview } from '../data/overview'
import type { Order } from '../data/orders'
import type { OverviewOrder } from '../feature/overview/overviewApiSlice'

const row = (id: string, over: Partial<OverviewOrder> = {}): OverviewOrder => ({
  id,
  storeId: 's1',
  buyerName: 'Ogagaoghene Akpolo',
  storeName: 'Ada Farm Store',
  status: 'PENDING',
  paymentStatus: 'VERIFIED',
  createdAt: '2026-10-20T08:00:00Z',
  paidAt: '2026-10-20T08:01:00Z',
  currency: 'NGN',
  total: '2500000',
  itemCount: 1,
  firstItem: 'Premium Ofada Rice',
  item: { name: 'Premium Ofada Rice', thumbnail: null, quantity: 2, weightGrams: 10000, priceMinor: '1250000' },
  deliveryMethod: 'SHIPPING',
  version: 1,
  ...over,
})

describe('orderFromOverview', () => {
  it('keeps the delivery method and whether the order is paid', () => {
    expect(orderFromOverview(row('a')).delivery.method).toBe('Shipping')
    expect(orderFromOverview(row('a')).paid).toBe(true)
    const pickup = orderFromOverview(row('b', { deliveryMethod: 'PICKUP', paymentStatus: 'UNPAID', paidAt: null }))
    expect(pickup.delivery.method).toBe('Pickup')
    expect(pickup.paid).toBe(false)
  })
})

describe('inRange', () => {
  const now = new Date('2026-10-20T12:00:00Z')
  const at = (iso: string) => ({ placedAt: iso })
  it('counts days back from now, and the calendar month', () => {
    expect(inRange(at('2026-10-14T12:00:00Z'), 'Last 7 days', now)).toBe(true)
    expect(inRange(at('2026-10-12T12:00:00Z'), 'Last 7 days', now)).toBe(false)
    expect(inRange(at('2026-09-21T12:00:00Z'), 'Last 30 days', now)).toBe(true)
    expect(inRange(at('2026-09-19T12:00:00Z'), 'Last 30 days', now)).toBe(false)
    expect(inRange(at('2026-10-01T12:00:00Z'), 'This month', now)).toBe(true)
    expect(inRange(at('2026-09-30T12:00:00Z'), 'This month', now)).toBe(false)
    expect(inRange(at('2025-01-01T00:00:00Z'), 'All time', now)).toBe(true)
  })
})

describe('applyFilters', () => {
  const orders: Order[] = [
    orderFromOverview(row('old-cheap', { createdAt: '2026-10-18T08:00:00Z', total: '1000000' })),
    orderFromOverview(row('new-dear', { createdAt: '2026-10-20T08:00:00Z', total: '5000000' })),
    orderFromOverview(row('pickup-unpaid', { createdAt: '2026-10-19T08:00:00Z', total: '2000000', deliveryMethod: 'PICKUP', paymentStatus: 'UNPAID' })),
  ]
  const ids = (list: Order[]) => list.map((o) => o.id)
  it('leaves everything in, newest first, by default', () => {
    expect(ids(applyFilters([...orders], DEFAULT_FILTERS))).toEqual(['new-dear', 'pickup-unpaid', 'old-cheap'])
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0)
  })
  it('narrows by delivery method and by payment', () => {
    expect(ids(applyFilters([...orders], { ...DEFAULT_FILTERS, delivery: 'pickup' }))).toEqual(['pickup-unpaid'])
    expect(ids(applyFilters([...orders], { ...DEFAULT_FILTERS, delivery: 'shipping' }))).toEqual(['new-dear', 'old-cheap'])
    expect(ids(applyFilters([...orders], { ...DEFAULT_FILTERS, payment: 'unpaid' }))).toEqual(['pickup-unpaid'])
    expect(ids(applyFilters([...orders], { ...DEFAULT_FILTERS, payment: 'paid', delivery: 'pickup' }))).toEqual([])
    expect(activeFilterCount({ ...DEFAULT_FILTERS, payment: 'paid', delivery: 'pickup' })).toBe(2)
  })
  it('sorts by date either way and by the order total', () => {
    expect(ids(applyFilters([...orders], { ...DEFAULT_FILTERS, sort: 'oldest' }))).toEqual(['old-cheap', 'pickup-unpaid', 'new-dear'])
    expect(ids(applyFilters([...orders], { ...DEFAULT_FILTERS, sort: 'highest' }))).toEqual(['new-dear', 'pickup-unpaid', 'old-cheap'])
    expect(ids(applyFilters([...orders], { ...DEFAULT_FILTERS, sort: 'lowest' }))).toEqual(['old-cheap', 'pickup-unpaid', 'new-dear'])
  })
  it('offers every value the filters can take', () => {
    for (const g of ORDER_FILTER_GROUPS) expect(g.options.map((o) => o.value)).toContain(DEFAULT_FILTERS[g.key])
  })
})
