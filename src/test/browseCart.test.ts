import { describe, it, expect, beforeEach } from 'vitest'
import { ALL_CATEGORIES, filterListings, paginate } from '../lib/browse'
import { addToCart, clampQuantity, clearStoreLines, groupByStore, removeFromCart, resetCartCache, setCartQuantity } from '../lib/cart'
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
  beforeEach(() => {
    resetCartCache()
    localStorage.clear()
  })
  const gold = listing({ id: 'gold', moq: 1, available: 60 })
  const ore = listing({ id: 'ore', title: 'Copper Ore', priceNum: 6500, moq: 20, available: 900 })
  const rice = listing({ id: 'rice', title: 'Ofada Rice', priceNum: 96000, store: { ...gold.store, id: 's2', storeName: 'Isoko Harvest Hub' } })

  it('keeps a quantity between the minimum order and what is available', () => {
    expect(clampQuantity(ore, 5)).toBe(20)
    expect(clampQuantity(ore, 1000)).toBe(900)
    expect(clampQuantity({ moq: 2, available: 0 }, 5)).toBe(2)
  })
  it('adds a line, adds to it on a second add, and answers the quantity', () => {
    expect(addToCart('acct', gold, 2)).toBe(2)
    expect(addToCart('acct', gold, 3)).toBe(5)
    expect(addToCart('acct', ore, 1)).toBe(20)
    expect(JSON.parse(localStorage.getItem('earth.cart.acct')!)).toHaveLength(2)
  })
  it('groups the lines by store with the goods total, and clears a store once ordered', () => {
    addToCart('acct', gold, 2)
    addToCart('acct', ore, 20)
    addToCart('acct', rice, 1)
    setCartQuantity('acct', 'gold', 4)
    resetCartCache()
    const groups = groupByStore(JSON.parse(localStorage.getItem('earth.cart.acct')!))
    expect(groups.map((g) => [g.storeName, g.lines.length, g.goodsTotal])).toEqual([
      ['Akpolo Agro & Mine', 2, 4 * 148000 + 20 * 6500],
      ['Isoko Harvest Hub', 1, 96000],
    ])
    clearStoreLines('acct', 's1')
    removeFromCart('acct', 'nothing')
    expect(JSON.parse(localStorage.getItem('earth.cart.acct')!).map((l: { listing: Listing }) => l.listing.id)).toEqual(['rice'])
  })
  it('keeps carts apart per account', () => {
    addToCart('one', gold, 1)
    expect(localStorage.getItem('earth.cart.two')).toBeNull()
  })
})
