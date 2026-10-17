import { apiSlice } from '../../app/api/apiSlice'
import { allPages } from '../stores/storesApiSlice'
import { toListing, type Listing, type PublicStore } from '../../lib/catalog'
import type { ApiProblem, Category, Product } from '../../services/earthApi'

type BaseQuery = (url: string) => Promise<{ data?: unknown; error?: ApiProblem }>

/** Where a visitor is browsing: '' for everywhere, a country, or one region of it. */
export type Place = { country: string; region: string }
export const EVERYWHERE: Place = { country: '', region: '' }

/** Runs `tasks` at most `width` at a time; the API is one host and a catalogue is many small calls. */
export async function pooled<T>(tasks: (() => Promise<T>)[], width: number): Promise<T[]> {
  const out: T[] = new Array(tasks.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(width, tasks.length) }, async () => {
      while (next < tasks.length) {
        const i = next++
        out[i] = await tasks[i]()
      }
    }),
  )
  return out
}

const CATEGORIES = (baseQuery: BaseQuery) => allPages<Category>((page) => baseQuery(`/store-categories?limit=50&page=${page}`))
/** `GET /stores` lists every LIVE store; `country` narrows it, and `region` (with `country`) narrows further. */
const STORES = (baseQuery: BaseQuery, { country, region }: Place) =>
  allPages<PublicStore>((page) => {
    const q = new URLSearchParams({ limit: '50', page: String(page) })
    if (country) q.set('country', country)
    if (country && region) q.set('region', region)
    return baseQuery(`/stores?${q}`)
  })
const PRODUCTS = (baseQuery: BaseQuery, storeId: string) =>
  allPages<Product>((page) => baseQuery(`/stores/${encodeURIComponent(storeId)}/products?limit=50&page=${page}`))

const newestFirst = (a: Listing, b: Listing) => b.listedAt.localeCompare(a.listedAt)

/**
 * The published listings in a place: the stores there, then each store's products (the API has
 * no cross-store product listing). One store whose products could not be read does not lose the
 * others; it is an error only when the store list itself could not be read.
 */
export async function listPlace(
  baseQuery: BaseQuery,
  categories: Category[],
  place: Place,
  width = 8,
): Promise<{ data: Listing[] } | { error: ApiProblem }> {
  const stores = await STORES(baseQuery, place)
  if ('error' in stores) return stores
  const perStore = await pooled(stores.data.map((s) => () => PRODUCTS(baseQuery, s.id)), width)
  const listings: Listing[] = []
  perStore.forEach((products, i) => {
    if ('data' in products) listings.push(...products.data.map((p) => toListing(p, stores.data[i], categories)))
  })
  return { data: listings.sort(newestFirst) }
}

/** The public catalogue: LIVE stores and their published listings. */
export const catalogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** Every published listing in a place, newest first: the landing catalogue and the marketplace. */
    listCatalog: builder.query<Listing[], Place>({
      async queryFn(place, _, __, baseQuery) {
        const categories = await CATEGORIES(baseQuery as BaseQuery)
        if ('error' in categories) return categories
        return listPlace(baseQuery as BaseQuery, categories.data, place)
      },
      providesTags: ['Catalog'],
      keepUnusedDataFor: 300,
    }),
    /** One store's published listings (the "Share my store" link); null when the store is not public. */
    listStore: builder.query<{ store: PublicStore; listings: Listing[] } | null, string>({
      async queryFn(storeId, _, __, baseQuery) {
        const store = await baseQuery(`/stores/${encodeURIComponent(storeId)}`)
        // 404: no such store; 400: not even a store id (a mangled link). Both read as "not on the marketplace".
        if (store.error) return store.error.status === 404 || store.error.status === 400 ? { data: null } : { error: store.error }
        const s = store.data as PublicStore
        const [products, categories] = await Promise.all([PRODUCTS(baseQuery as BaseQuery, s.id), CATEGORIES(baseQuery as BaseQuery)])
        if ('error' in products) return products
        if ('error' in categories) return categories
        const listings = products.data.map((p) => toListing(p, s, categories.data)).sort(newestFirst)
        return { data: { store: s, listings } }
      },
      providesTags: ['Catalog'],
    }),
    /** One published listing with its store; null when it is not public (404). */
    getListing: builder.query<Listing | null, string>({
      async queryFn(id, _, __, baseQuery) {
        const product = await baseQuery(`/products/${encodeURIComponent(id)}`)
        if (product.error) return product.error.status === 404 ? { data: null } : { error: product.error }
        const p = product.data as Product
        const [store, categories] = await Promise.all([baseQuery(`/stores/${p.storeId}`), CATEGORIES(baseQuery as BaseQuery)])
        if (store.error) return { error: store.error }
        if ('error' in categories) return categories
        return { data: toListing(p, store.data as PublicStore, categories.data) }
      },
      providesTags: ['Catalog'],
    }),
  }),
})

export const { useListCatalogQuery, useListStoreQuery, useGetListingQuery } = catalogApiSlice
