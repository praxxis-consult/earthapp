import { request, stores, type Category, type Product as ApiProduct } from '../services/earthApi'
import { naira } from './productView'

/** A LIVE store as the public endpoints return it. */
export interface PublicStore {
  id: string
  storeName: string
  categoryIds: string[]
  businessAddress: { country: string; region: string; area: string; street: string; landmark: string }
  status: 'LIVE'
  liveAt: string
}

/** What the marketplace cards, product page and order page render. */
export interface Listing {
  id: string
  title: string
  price: string
  priceNum: number
  unit: string
  description: string
  image: string | null
  images: string[]
  location: string
  region: string
  country: string
  quantity: string
  available: number
  moq: number
  listed: string
  categoryId: string
  category: string
  store: PublicStore
}

/**
 * The public catalogue endpoint lists LIVE stores per country and region, so the marketplace
 * browses one region at a time. The region list is Nigeria's states; the API has no
 * country-wide listing yet.
 */
export const COUNTRY = 'NG'
export const REGIONS = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]
export const DEFAULT_REGION = 'Ondo'

const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

export function toListing(p: ApiProduct, store: PublicStore, categories: Category[]): Listing {
  const images = (p.images ?? []).slice().sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)).map((i) => i.url)
  const unit = (p.soldAs ?? 'unit').toLowerCase()
  const available = p.availableQuantity ?? 0
  return {
    id: p.id,
    title: p.productName ?? 'Untitled listing',
    price: naira(p.price ?? '0').replace(/\.00$/, ''),
    priceNum: Number(p.price ?? 0),
    unit,
    description: p.description ?? '',
    image: images[0] ?? null,
    images,
    location: `${store.businessAddress.area}, ${store.businessAddress.region}`,
    region: store.businessAddress.region,
    country: store.businessAddress.country,
    quantity: `${available} ${unit}${available === 1 ? '' : 's'}`,
    available,
    moq: p.moq ?? 1,
    listed: monthYear(p.createdAt),
    categoryId: p.categoryId ?? '',
    category: categories.find((c) => c.id === p.categoryId)?.name ?? p.categoryId ?? '',
    store,
  }
}

async function page<T>(path: string): Promise<T[]> {
  const items: T[] = []
  let cursor: string | null = null
  do {
    const sep = path.includes('?') ? '&' : '?'
    const res: { items: T[]; nextCursor: string | null } = await request(`${path}${sep}limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`)
    items.push(...res.items)
    cursor = res.nextCursor
  } while (cursor)
  return items
}

const cache = new Map<string, Promise<Listing[]>>()

/** Every published listing from the LIVE stores in a region. */
export function listRegion(region: string, country = COUNTRY): Promise<Listing[]> {
  const key = `${country}/${region}`
  if (!cache.has(key)) {
    const run = (async () => {
      const [categories, storeList] = await Promise.all([
        stores.categories(),
        page<PublicStore>(`/v1/stores?country=${country}&region=${encodeURIComponent(region)}`),
      ])
      const perStore = await Promise.all(
        storeList.map(async (s) => (await page<ApiProduct>(`/v1/stores/${s.id}/products`)).map((p) => toListing(p, s, categories))),
      )
      return perStore.flat().sort((a, b) => b.listed.localeCompare(a.listed))
    })()
    cache.set(key, run)
    run.catch(() => cache.delete(key))
  }
  return cache.get(key)!
}

/** One published listing with its store; null when it is not public (404). */
export async function getListing(id: string): Promise<Listing | null> {
  try {
    const p = await request<ApiProduct>(`/v1/products/${id}`)
    const [store, categories] = await Promise.all([request<PublicStore>(`/v1/stores/${p.storeId}`), stores.categories()])
    return toListing(p, store, categories)
  } catch {
    return null
  }
}
