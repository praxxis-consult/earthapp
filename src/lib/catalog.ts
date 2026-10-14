import type { Category, Product as ApiProduct } from '../services/earthApi'
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
  listedAt: string
  categoryId: string
  category: string
  store: PublicStore
}

/** The API lists stores per country and region; the region list is Nigeria's states until a country-wide listing exists. */
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
    listedAt: p.createdAt,
    categoryId: p.categoryId ?? '',
    category: categories.find((c) => c.id === p.categoryId)?.name ?? p.categoryId ?? '',
    store,
  }
}
