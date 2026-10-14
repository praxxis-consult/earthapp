import { apiSlice } from '../../app/api/apiSlice'
import { allPages } from '../stores/storesApiSlice'
import { COUNTRY, toListing, type Listing, type PublicStore } from '../../lib/catalog'
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

export const { useListRegionQuery, useGetListingQuery } = catalogApiSlice
