import { describe, it, expect, vi } from 'vitest'
import type { ApiProblem } from '../services/earthApi'

/**
 * The catalogue's sweep: the API lists stores per (country, region) pair, so a country or the
 * launch markets are many small calls that fill the page in as they land.
 */

// The sweep reads through the app's base query; here it answers from a small fake API.
const stores = [{ id: 's1', storeName: 'QA Agro Store', businessAddress: { country: 'NG', region: 'Ondo', area: 'Okitipupa' } }]
const products = [{ id: 'p1', storeId: 's1', productName: 'Organic Tomatoes', price: '2500', soldAs: 'KG', availableQuantity: 5, createdAt: '2026-10-01T00:00:00Z', categoryId: 'vegetables', images: [] }]
const calls: string[] = []
let failing: (url: string) => boolean = () => false
async function fakeBaseQuery(url: string): Promise<{ data?: unknown; error?: ApiProblem }> {
  calls.push(url)
  if (failing(url)) return { error: { status: 503, data: null } }
  if (url.startsWith('/store-categories')) return { data: { items: [{ id: 'vegetables', name: 'Vegetables' }], nextCursor: null } }
  if (url.startsWith('/stores?')) {
    const q = new URLSearchParams(url.slice(url.indexOf('?') + 1))
    return { data: { items: q.get('country') === 'NG' && q.get('region') === 'Ondo' ? stores : [], nextCursor: null } }
  }
  if (/^\/stores\/s1\/products/.test(url)) return { data: { items: products, nextCursor: null } }
  return { error: { status: 404, data: null } }
}
vi.mock('../app/api/apiSlice', async (orig) => ({ ...(await orig<typeof import('../app/api/apiSlice')>()), baseQuery: fakeBaseQuery }))

const { pooled, listPlaces, catalogApiSlice } = await import('../feature/marketplace/catalogApiSlice')
const { store } = await import('../app/store')
const { COUNTRIES, regionsOf, countryName, LAUNCH_COUNTRIES } = await import('../data/locations')

describe('pooled', () => {
  it('runs at most `width` tasks at once and keeps the order', async () => {
    let running = 0
    let peak = 0
    const tasks = Array.from({ length: 10 }, (_, i) => async () => {
      running++
      peak = Math.max(peak, running)
      await new Promise((r) => setTimeout(r, 5))
      running--
      return i
    })
    expect(await pooled(tasks, 3)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(peak).toBe(3)
  })
})

describe('listPlaces', () => {
  const categories = [{ id: 'vegetables', name: 'Vegetables' }]
  it('joins the stores of every place with their products', async () => {
    failing = () => false
    const res = await listPlaces(fakeBaseQuery, categories as never, [{ country: 'NG', region: 'Ondo' }, { country: 'NG', region: 'Delta' }])
    expect('data' in res && res.data.map((l) => l.title)).toEqual(['Organic Tomatoes'])
    expect('data' in res && res.data[0].category).toBe('Vegetables')
  })
  it('keeps the places that answered when one fails, and errors only when all fail', async () => {
    failing = (url) => url.includes('region=Delta')
    const partial = await listPlaces(fakeBaseQuery, categories as never, [{ country: 'NG', region: 'Ondo' }, { country: 'NG', region: 'Delta' }])
    expect('data' in partial && partial.data.length).toBe(1)
    failing = (url) => url.startsWith('/stores?')
    const none = await listPlaces(fakeBaseQuery, categories as never, [{ country: 'NG', region: 'Ondo' }, { country: 'NG', region: 'Delta' }])
    expect('error' in none && none.error.status).toBe(503)
    failing = () => false
  })
})

describe('the sweeping queries', () => {
  it('answers at once as pending, then fills the cache country by country', async () => {
    calls.length = 0
    const sub = store.dispatch(catalogApiSlice.endpoints.listCountry.initiate({ country: 'NG' }))
    const first = await sub
    expect(first.data).toEqual({ listings: [], pending: ['Nigeria'], error: null })
    await vi.waitFor(() => {
      const entry = catalogApiSlice.endpoints.listCountry.select({ country: 'NG' })(store.getState())
      expect(entry.data?.pending).toEqual([])
    }, { timeout: 4000 })
    const done = catalogApiSlice.endpoints.listCountry.select({ country: 'NG' })(store.getState()).data!
    expect(done.listings.map((l) => l.title)).toEqual(['Organic Tomatoes'])
    expect(done.error).toBeNull()
    // every region of Nigeria was asked for, once
    const asked = calls.filter((u) => u.startsWith('/stores?country=NG'))
    expect(asked.length).toBe(regionsOf('NG').length)
    sub.unsubscribe()
  })
  it('reports an error only when nothing could be read', async () => {
    failing = (url) => url.startsWith('/stores?')
    const sub = store.dispatch(catalogApiSlice.endpoints.listRegion.initiate({ country: 'GH', region: 'Ashanti' }))
    await sub
    await vi.waitFor(() => {
      const entry = catalogApiSlice.endpoints.listRegion.select({ country: 'GH', region: 'Ashanti' })(store.getState())
      expect(entry.data?.pending).toEqual([])
    })
    const data = catalogApiSlice.endpoints.listRegion.select({ country: 'GH', region: 'Ashanti' })(store.getState()).data!
    expect(data.error?.status).toBe(503)
    expect(data.listings).toEqual([])
    failing = () => false
    sub.unsubscribe()
  })
})

describe('locations', () => {
  it('knows every country and its regions from the open data set', () => {
    expect(COUNTRIES.length).toBeGreaterThan(240)
    expect(regionsOf('NG')).toContain('Ondo')
    expect(regionsOf('GH')).toContain('Ashanti')
    expect(regionsOf('XX')).toEqual([])
    expect(countryName('TZ')).toBe('Tanzania')
    expect(countryName('CI')).toBe("Côte d'Ivoire")
    expect(COUNTRY_SORTED(COUNTRIES.map((c) => c.name))).toBe(true)
    for (const c of LAUNCH_COUNTRIES) expect(regionsOf(c).length).toBeGreaterThan(0)
  })
})
const COUNTRY_SORTED = (names: string[]) => names.every((n, i) => i === 0 || names[i - 1].localeCompare(n) <= 0)
