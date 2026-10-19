import { describe, it, expect, beforeEach } from 'vitest'
import { resetSavedCache, snapshot, toggleSaved, removeSaved } from '../lib/saved'
import { amountSpent } from '../data/purchases'
import type { Listing } from '../lib/catalog'

const listing = (id: string): Listing =>
  ({ id, title: `Item ${id}`, price: '₦2,000', priceNum: 2000, unit: 'bag', description: '', image: null, images: [], location: 'Ajah, Lagos', region: 'Lagos', country: 'NG', quantity: '20 bags', available: 20, moq: 1, listed: 'October 2026', listedAt: '2026-10-19T00:00:00Z', categoryId: 'c', category: 'Cat', store: { id: 's1', storeName: 'Betta Store' } }) as unknown as Listing

describe('saved listings', () => {
  beforeEach(() => {
    localStorage.clear()
    resetSavedCache()
  })
  it('toggles a listing on and off, newest first, per account', () => {
    expect(toggleSaved('a', listing('1'))).toBe(true)
    expect(toggleSaved('a', listing('2'))).toBe(true)
    expect(JSON.parse(localStorage.getItem('earth.saved.a')!).map((s: { id: string }) => s.id)).toEqual(['2', '1'])
    expect(toggleSaved('a', listing('1'))).toBe(false)
    expect(JSON.parse(localStorage.getItem('earth.saved.a')!).map((s: { id: string }) => s.id)).toEqual(['2'])
    expect(localStorage.getItem('earth.saved.b')).toBeNull()
    removeSaved('a', '2')
    expect(JSON.parse(localStorage.getItem('earth.saved.a')!)).toEqual([])
  })
  it('keeps what the card needs, with the store name and location', () => {
    const s = snapshot(listing('9'), '2026-10-19T10:00:00Z')
    expect(s).toEqual({ id: '9', title: 'Item 9', price: '₦2,000', unit: 'bag', image: null, storeName: 'Betta Store', location: 'Ajah, Lagos', savedAt: '2026-10-19T10:00:00Z' })
  })
})

describe('amount spent', () => {
  it('adds the paid orders only, kobo to naira', () => {
    expect(amountSpent([{ paymentStatus: 'PAID', total: '2150000' }, { paymentStatus: 'PENDING', total: '999999' }, { paymentStatus: 'PAID', total: '50' }])).toBe(21500.5)
    expect(amountSpent([])).toBe(0)
  })
})
