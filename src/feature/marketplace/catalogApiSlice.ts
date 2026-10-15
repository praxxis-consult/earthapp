import type { BaseQueryApi } from '@reduxjs/toolkit/query'
import { apiSlice, baseQuery as earthBaseQuery } from '../../app/api/apiSlice'
import { allPages } from '../stores/storesApiSlice'
import { LAUNCH_COUNTRIES, countryName, regionsOf } from '../../data/locations'
import { toListing, type Listing, type PublicStore } from '../../lib/catalog'
import type { ApiProblem, Category, Product } from '../../services/earthApi'

type BaseQuery = (url: string) => Promise<{ data?: unknown; error?: ApiProblem }>
export type Place = { country: string; region: string }

/**
 * A catalogue answer that fills in as it is read. The API only lists stores per (country, region)
 * pair, both required, so a country or the launch markets are hundreds of small calls; the page
 * shows what has arrived while `pending` names the places still being read. `error` is set when a
 * place could not be read at all; it matters to the page only when nothing else arrived.
 */
export interface Catalog {
  listings: Listing[]
  pending: string[]
  error: ApiProblem | null
}

/** One labelled batch of the sweep: the page learns the label is done when its last batch lands. */
type Group = { label: string; places: Place[] }

/** Runs `tasks` at most `width` at a time; the API is one host and a sweep is many small calls. */
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

const CATEGORIES = (baseQuery: BaseQuery) =>
  allPages<Category>((c) => baseQuery(`/store-categories?limit=50${c ? `&cursor=${encodeURIComponent(c)}` : ''}`))
const STORES = (baseQuery: BaseQuery, { country, region }: Place) =>
  allPages<PublicStore>((c) =>
    baseQuery(`/stores?country=${encodeURIComponent(country)}&region=${encodeURIComponent(region)}&limit=50${c ? `&cursor=${encodeURIComponent(c)}` : ''}`),
  )
const PRODUCTS = (baseQuery: BaseQuery, storeId: string) =>
  allPages<Product>((c) => baseQuery(`/stores/${encodeURIComponent(storeId)}/products?limit=50${c ? `&cursor=${encodeURIComponent(c)}` : ''}`))

const newestFirst = (a: Listing, b: Listing) => b.listedAt.localeCompare(a.listedAt)

/**
 * The published listings in the given places. One unreachable place does not lose the others;
 * it is an error only when nothing could be read.
 */
export async function listPlaces(
  baseQuery: BaseQuery,
  categories: Category[],
  places: Place[],
  width = 8,
): Promise<{ data: Listing[] } | { error: ApiProblem }> {
  const perPlace = await pooled(places.map((place) => () => STORES(baseQuery, place)), width)
  const failed = perPlace.filter((r) => 'error' in r)
  if (failed.length === places.length && failed.length > 0) return failed[0] as { error: ApiProblem }
  const storeList = perPlace.flatMap((r) => ('data' in r ? r.data : []))
  const perStore = await pooled(storeList.map((s) => () => PRODUCTS(baseQuery, s.id)), width)
  const listings: Listing[] = []
  perStore.forEach((products, i) => {
    if ('data' in products) listings.push(...products.data.map((p) => toListing(p, storeList[i], categories)))
  })
  return { data: listings.sort(newestFirst) }
}

/** Splits a country's regions into batches that patch the page every few places. */
const chunked = (country: string, size: number): Group[] => {
  const regions = regionsOf(country)
  const groups: Group[] = []
  for (let i = 0; i < regions.length; i += size)
    groups.push({ label: countryName(country), places: regions.slice(i, i + size).map((region) => ({ country, region })) })
  return groups
}

/**
 * A query that answers at once with an empty, pending catalogue and then fills it batch by batch
 * from `onQueryStarted` (which runs on every fetch and refetch, unlike `onCacheEntryAdded`).
 * Each patch first checks the cache entry still belongs to this request, so a refetch that
 * starts mid-sweep simply takes over.
 */
function sweep<Arg>(groupsOf: (arg: Arg) => Group[]) {
  return {
    queryFn: (arg: Arg) => ({ data: { listings: [], pending: [...new Set(groupsOf(arg).map((g) => g.label))], error: null } as Catalog }),
    keepUnusedDataFor: 300,
    providesTags: ['Catalog' as const],
    async onQueryStarted(arg: Arg, api: SweepApi) {
      try {
        await api.queryFulfilled
      } catch {
        return
      }
      const controller = new AbortController()
      const bqApi: BaseQueryApi = {
        dispatch: api.dispatch,
        getState: api.getState,
        signal: controller.signal,
        abort: (reason?: string) => controller.abort(reason),
        extra: undefined,
        endpoint: 'catalog',
        type: 'query',
      }
      const baseQuery: BaseQuery = (url) => earthBaseQuery(url, bqApi, {})
      const alive = () => api.getCacheEntry().requestId === api.requestId
      const categories = await CATEGORIES(baseQuery)
      if (!alive()) return
      if ('error' in categories) {
        api.updateCachedData((draft) => {
          draft.pending = []
          draft.error = categories.error
        })
        return
      }
      const groups = groupsOf(arg)
      const left = new Map<string, number>()
      groups.forEach((g) => left.set(g.label, (left.get(g.label) ?? 0) + 1))
      for (const group of groups) {
        if (!alive()) return
        const res = await listPlaces(baseQuery, categories.data, group.places)
        if (!alive()) return
        api.updateCachedData((draft) => {
          if ('data' in res) {
            draft.listings.push(...res.data)
            draft.listings.sort(newestFirst)
          } else {
            draft.error = res.error
          }
          const n = (left.get(group.label) ?? 1) - 1
          left.set(group.label, n)
          if (n <= 0) draft.pending = draft.pending.filter((l) => l !== group.label)
        })
      }
    },
  }
}

interface SweepApi {
  dispatch: BaseQueryApi['dispatch']
  getState: BaseQueryApi['getState']
  requestId: string
  queryFulfilled: Promise<unknown>
  getCacheEntry: () => { requestId?: string }
  updateCachedData: (recipe: (draft: Catalog) => void) => unknown
}

/** The public catalogue: LIVE stores and their published listings. */
export const catalogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** One region of one country: the only shape the API lists directly. */
    listRegion: builder.query<Catalog, Place>(sweep((place) => [{ label: `${place.region}, ${countryName(place.country)}`, places: [place] }])),
    /** Every region of one country, a dozen at a time. */
    listCountry: builder.query<Catalog, { country: string }>(sweep(({ country }) => chunked(country, 12))),
    /** The launch markets one country after another (src/data/locations.ts): the landing catalogue and "Location: Global". */
    listGlobal: builder.query<Catalog, void>(sweep(() => LAUNCH_COUNTRIES.flatMap((country) => chunked(country, 12)))),
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

export const { useListRegionQuery, useListCountryQuery, useListGlobalQuery, useListStoreQuery, useGetListingQuery } = catalogApiSlice
