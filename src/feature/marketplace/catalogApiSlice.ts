import { apiSlice } from '../../app/api/apiSlice'
import { allPages } from '../stores/storesApiSlice'
import { COUNTRY, REGIONS, toListing, type Listing, type PublicStore } from '../../lib/catalog'
import type { Category, Product } from '../../services/earthApi'

/**
 * The public catalogue: LIVE stores and their published listings. The API lists stores per
 * country and region, so the marketplace browses one region at a time.
 */
export const catalogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listRegion: builder.query<Listing[], { region: string; country?: string }>({
      async queryFn({ region, country = COUNTRY }, _, __, baseQuery) {
        const categories = await allPages<Category>((c) => baseQuery(`/store-categories?limit=50${c ? `&cursor=${encodeURIComponent(c)}` : ''}`))
        if ('error' in categories) return categories
        const storeList = await allPages<PublicStore>((c) =>
          baseQuery(`/stores?country=${country}&region=${encodeURIComponent(region)}&limit=50${c ? `&cursor=${encodeURIComponent(c)}` : ''}`),
        )
        if ('error' in storeList) return storeList
        const listings: Listing[] = []
        for (const s of storeList.data) {
          const products = await allPages<Product>((c) => baseQuery(`/stores/${s.id}/products?limit=50${c ? `&cursor=${encodeURIComponent(c)}` : ''}`))
          if ('error' in products) return products
          listings.push(...products.data.map((p) => toListing(p, s, categories.data)))
        }
        return { data: listings.sort((a, b) => b.listedAt.localeCompare(a.listedAt)) }
      },
      providesTags: ['Catalog'],
    }),
    /**
     * Every published listing in the country, newest first (the landing page's catalogue). The
     * API lists stores per region, so this asks every region at once and joins the answers;
     * a country-wide listing on the API replaces this with one call.
     */
    listCountry: builder.query<Listing[], { country?: string } | void>({
      async queryFn(arg, _, __, baseQuery) {
        const country = (arg && arg.country) || COUNTRY
        const categories = await allPages<Category>((c) => baseQuery(`/store-categories?limit=50${c ? `&cursor=${encodeURIComponent(c)}` : ''}`))
        if ('error' in categories) return categories
        const perRegion = await Promise.all(
          REGIONS.map((region) =>
            allPages<PublicStore>((c) =>
              baseQuery(`/stores?country=${country}&region=${encodeURIComponent(region)}&limit=50${c ? `&cursor=${encodeURIComponent(c)}` : ''}`),
            ),
          ),
        )
        const failed = perRegion.find((r) => 'error' in r)
        if (failed && 'error' in failed) return failed
        const storeList = perRegion.flatMap((r) => ('data' in r ? r.data : []))
        const perStore = await Promise.all(
          storeList.map((s) => allPages<Product>((c) => baseQuery(`/stores/${s.id}/products?limit=50${c ? `&cursor=${encodeURIComponent(c)}` : ''}`))),
        )
        const listings: Listing[] = []
        perStore.forEach((products, i) => {
          if ('data' in products) listings.push(...products.data.map((p) => toListing(p, storeList[i], categories.data)))
        })
        return { data: listings.sort((a, b) => b.listedAt.localeCompare(a.listedAt)) }
      },
      providesTags: ['Catalog'],
    }),
    /** One store's published listings (the "Share my store" link); null when the store is not public. */
    listStore: builder.query<{ store: PublicStore; listings: Listing[] } | null, string>({
      async queryFn(storeId, _, __, baseQuery) {
        const store = await baseQuery(`/stores/${encodeURIComponent(storeId)}`)
        // 404: no such store; 400: not even a store id (a mangled link). Both read as "not on the marketplace".
        if (store.error) return store.error.status === 404 || store.error.status === 400 ? { data: null } : { error: store.error }
        const s = store.data as PublicStore
        const [products, categories] = await Promise.all([
          allPages<Product>((c) => baseQuery(`/stores/${s.id}/products?limit=50${c ? `&cursor=${encodeURIComponent(c)}` : ''}`)),
          allPages<Category>((c) => baseQuery(`/store-categories?limit=50${c ? `&cursor=${encodeURIComponent(c)}` : ''}`)),
        ])
        if ('error' in products) return products
        if ('error' in categories) return categories
        const listings = products.data.map((p) => toListing(p, s, categories.data)).sort((a, b) => b.listedAt.localeCompare(a.listedAt))
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
        const [store, categories] = await Promise.all([
          baseQuery(`/stores/${p.storeId}`),
          allPages<Category>((c) => baseQuery(`/store-categories?limit=50${c ? `&cursor=${encodeURIComponent(c)}` : ''}`)),
        ])
        if (store.error) return { error: store.error }
        if ('error' in categories) return categories
        return { data: toListing(p, store.data as PublicStore, categories.data) }
      },
      providesTags: ['Catalog'],
    }),
  }),
})

export const { useListRegionQuery, useListCountryQuery, useListStoreQuery, useGetListingQuery } = catalogApiSlice
