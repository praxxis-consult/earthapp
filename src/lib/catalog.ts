import type { Category, Product as ApiProduct } from '../services/earthApi'
import { nairaFromMinor } from './productView'

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
  listedAt: string
  categoryId: string
  category: string
  store: PublicStore
}

const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

export function toListing(p: ApiProduct, store: PublicStore, categories: Category[]): Listing {
  const images = (p.images ?? []).slice().sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)).map((i) => i.url)
  const unit = (p.soldAs ?? 'unit').toLowerCase()
  const available = p.availableQuantity ?? 0
  return {
    id: p.id,
    title: p.productName ?? 'Untitled listing',
    price: nairaFromMinor(p.price ?? '0').replace(/\.00$/, ''),
    // In naira, so quantity × priceNum is a naira total; the API's `price` is kobo.
    priceNum: Number(p.price ?? 0) / 100,
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
    listedAt: p.createdAt,
    categoryId: p.categoryId ?? '',
    category: categories.find((c) => c.id === p.categoryId)?.name ?? p.categoryId ?? '',
    store,
  }
}
