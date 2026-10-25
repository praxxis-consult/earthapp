import { describe, it, expect } from 'vitest'
import { ALL_CATEGORIES, filterListings, paginate } from '../lib/browse'
import { clampQuantity, groupItems, withAdded } from '../lib/cart'
import type { Listing } from '../lib/catalog'

const listing = (over: Partial<Listing> & { id: string }): Listing => ({
  title: 'Alluvial Gold',
  price: '₦148,000',
  priceNum: 148000,
  unit: 'gram',
  description: '',
  image: null,
  images: [],
  location: 'Uzere, Delta',
  region: 'Delta',
  country: 'NG',
  quantity: '60 grams',
  available: 60,
  moq: 1,
  weightGrams: 20,
  listed: 'October 2026',
  listedAt: '2026-10-20T00:00:00Z',
  categoryId: 'minerals',
  category: 'Minerals',
  store: { id: 's1', storeName: 'Akpolo Agro & Mine', businessAddress: { country: 'NG', region: 'Delta', area: 'Uzere', street: '', landmark: '' }, status: 'LIVE', liveAt: '2026-10-20T00:00:00Z', ratingAverage: null, ratingCount: 0, version: 1, categoryIds: ['minerals'] } as unknown as Listing['store'],
  ...over,
})

describe('filterListings', () => {
  const rows = [
    listing({ id: 'a', title: 'Alluvial Gold', priceNum: 148000, category: 'Minerals' }),
    listing({ id: 'b', title: 'Mahogany Planks', priceNum: 58000, category: 'Forestry', location: 'Oleh, Delta' }),
    listing({ id: 'c', title: 'Copper Ore', priceNum: 6500, category: 'Minerals' }),
  ]
  it('keeps everything in catalogue order by default', () => {
    expect(filterListings(rows, { category: ALL_CATEGORIES, search: '', sort: 'Most recent' }).map((r) => r.id)).toEqual(['a', 'b', 'c'])
  })
  it('narrows by category and by a search over name, place and store', () => {
    expect(filterListings(rows, { category: 'Minerals', search: '', sort: 'Most recent' }).map((r) => r.id)).toEqual(['a', 'c'])
    expect(filterListings(rows, { category: ALL_CATEGORIES, search: 'oleh', sort: 'Most recent' }).map((r) => r.id)).toEqual(['b'])
    expect(filterListings(rows, { category: ALL_CATEGORIES, search: 'akpolo', sort: 'Most recent' })).toHaveLength(3)
  })
  it('sorts by price either way', () => {
    expect(filterListings(rows, { category: ALL_CATEGORIES, search: '', sort: 'Price: Low to High' }).map((r) => r.id)).toEqual(['c', 'b', 'a'])
    expect(filterListings(rows, { category: ALL_CATEGORIES, search: '', sort: 'Price: High to Low' }).map((r) => r.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('paginate', () => {
  it('slices the page and clamps a page past the end', () => {
    const items = Array.from({ length: 25 }, (_, i) => i)
    expect(paginate(items, 1, 12).items).toHaveLength(12)
    expect(paginate(items, 3, 12)).toMatchObject({ page: 3, pageCount: 3, items: [24] })
    expect(paginate(items, 9, 12).page).toBe(3)
    expect(paginate([], 1, 12)).toEqual({ items: [], page: 1, pageCount: 1 })
  })
})

describe('cart', () => {
  const gold = listing({ id: 'gold', moq: 1, available: 60 })
  const ore = listing({ id: 'ore', title: 'Copper Ore', priceNum: 6500, moq: 20, available: 900 })
  const rice = listing({ id: 'rice', title: 'Ofada Rice', priceNum: 96000, store: { ...gold.store, id: 's2', storeName: 'Isoko Harvest Hub' } })

  it('clamps a quantity between the minimum order and what is available', () => {
    expect(clampQuantity(gold, 0)).toBe(gold.moq)
    expect(clampQuantity(gold, 99)).toBe(gold.available)
    expect(clampQuantity({ moq: 5, available: 0 }, 1)).toBe(5)
  })
  it('adds a line, or adds to the line the listing already has, within its bounds', () => {
    const first = withAdded([], gold, 2)
    expect(first).toEqual({ items: [{ storeId: gold.store.id, productId: 'gold', quantity: 2 }], quantity: 2 })
    const more = withAdded(first.items, gold, 3)
    expect(more.quantity).toBe(5)
    expect(more.items).toHaveLength(1)
    expect(withAdded(more.items, ore, 1).items).toHaveLength(2)
    expect(withAdded(more.items, ore, 1).quantity).toBe(20)
  })
  it('groups the lines by store in the order the stores were first added', () => {
    const items = withAdded(withAdded(withAdded([], gold, 2).items, ore, 20).items, rice, 1).items
    const groups = groupItems(items)
    expect(groups.map((g) => g.storeId)).toEqual([gold.store.id, rice.store.id])
    expect(groups[0].items.map((i) => i.productId)).toEqual(['gold', 'ore'])
  })
})
