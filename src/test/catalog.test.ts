import { describe, it, expect } from 'vitest'
import type { ApiProblem } from '../services/earthApi'
import { allPages } from '../feature/stores/storesApiSlice'
import { listPlace, pooled, EVERYWHERE } from '../feature/marketplace/catalogApiSlice'
import { COUNTRIES, regionsOf, countryName } from '../data/locations'

/**
 * The catalogue reads `GET /products` (every published product, or a country's, or a region's)
 * and then each listing's store; every list endpoint pages by number.
 */

const stores = [
  { id: 's1', storeName: 'QA Agro Store', businessAddress: { country: 'NG', region: 'Ondo', area: 'Okitipupa' } },
  { id: 's2', storeName: 'Akpolo Agro', businessAddress: { country: 'NG', region: 'Delta', area: 'Uzere' } },
]
const products = {
  s1: [{ id: 'p1', storeId: 's1', productName: 'Organic Tomatoes', price: '2500', soldAs: 'KG', availableQuantity: 5, approximateWeightGrams: 25000, createdAt: '2026-10-01T00:00:00Z', categoryId: 'vegetables', images: [] }],
  s2: [{ id: 'p2', storeId: 's2', productName: 'Cocoa Beans', price: '9000', soldAs: 'BAG', availableQuantity: 2, createdAt: '2026-10-05T00:00:00Z', categoryId: 'cash-crops', images: [] }],
}
const page = <T,>(items: T[], n = 1, hasNext = false) => ({ data: { items, page: n, limit: 50, hasNext, nextPage: hasNext ? n + 1 : null } })
const calls: string[] = []
let failing: (url: string) => boolean = () => false
async function fakeBaseQuery(url: string): Promise<{ data?: unknown; error?: ApiProblem }> {
  calls.push(url)
  if (failing(url)) return { error: { status: 503, data: null } }
  if (url.startsWith('/products?')) {
    const q = new URLSearchParams(url.slice(url.indexOf('?') + 1))
    const country = q.get('country')
    const region = q.get('region')
    const here = stores.filter((s) => (!country || s.businessAddress.country === country) && (!region || s.businessAddress.region === region)).map((s) => s.id)
    return page([...products.s1, ...products.s2].filter((p) => here.includes(p.storeId)))
  }
  const m = /^\/stores\/(s\d)$/.exec(url)
  if (m) return { data: stores.find((s) => s.id === m[1]) }
  return { error: { status: 404, data: null } }
}
const categories = [{ id: 'vegetables', name: 'Vegetables' }, { id: 'cash-crops', name: 'Cash crops' }]

describe('allPages', () => {
  it('follows page numbers to the last page', async () => {
    const seen: number[] = []
    const res = await allPages<number>(async (n) => {
      seen.push(n)
      return n < 3 ? page([n], n, true) : page([n], n, false)
    })
    expect(seen).toEqual([1, 2, 3])
    expect('data' in res && res.data).toEqual([1, 2, 3])
  })
  it('stops on a page that points back at itself, and on an error', async () => {
    const loop = await allPages<number>(async (n) => ({ data: { items: [n], page: n, limit: 50, hasNext: true, nextPage: n } }))
    expect('data' in loop && loop.data).toEqual([1])
    const err = await allPages<number>(async () => ({ error: { status: 500, data: null } }))
    expect('error' in err && err.error.status).toBe(500)
  })
})

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

describe('listPlace', () => {
  it('lists every store with its products, newest first, without a location filter', async () => {
    calls.length = 0
    failing = () => false
    const res = await listPlace(fakeBaseQuery, categories as never, EVERYWHERE)
    expect('data' in res && res.data.map((l) => l.title)).toEqual(['Cocoa Beans', 'Organic Tomatoes'])
    expect('data' in res && res.data[1].category).toBe('Vegetables')
    expect('data' in res && res.data[1].weightGrams).toBe(25000)
    expect('data' in res && res.data[0].weightGrams).toBe(0)
    expect(calls[0]).toBe('/products?limit=50&page=1')
  })
  it('narrows by country and by region', async () => {
    calls.length = 0
    const country = await listPlace(fakeBaseQuery, categories as never, { country: 'NG', region: '' })
    expect('data' in country && country.data.length).toBe(2)
    expect(calls[0]).toBe('/products?limit=50&page=1&country=NG')
    const region = await listPlace(fakeBaseQuery, categories as never, { country: 'NG', region: 'Delta' })
    expect('data' in region && region.data.map((l) => l.title)).toEqual(['Cocoa Beans'])
    expect(calls.find((u) => u.includes('region='))).toBe('/products?limit=50&page=1&country=NG&region=Delta')
    // a region alone means nothing to the API, so it is never sent without its country
    const stray = await listPlace(fakeBaseQuery, categories as never, { country: '', region: 'Delta' })
    expect('data' in stray && stray.data.length).toBe(2)
  })
  it('keeps the listings whose store loaded when one store fails, and errors only when the product list fails', async () => {
    failing = (url) => url === '/stores/s2'
    const partial = await listPlace(fakeBaseQuery, categories as never, EVERYWHERE)
    expect('data' in partial && partial.data.map((l) => l.title)).toEqual(['Organic Tomatoes'])
    failing = (url) => url.startsWith('/products?')
    const none = await listPlace(fakeBaseQuery, categories as never, EVERYWHERE)
    expect('error' in none && none.error.status).toBe(503)
    failing = () => false
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
    const names = COUNTRIES.map((c) => c.name)
    expect(names.every((n, i) => i === 0 || names[i - 1].localeCompare(n) <= 0)).toBe(true)
  })
})
