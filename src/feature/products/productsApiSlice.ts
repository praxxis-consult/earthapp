import { apiSlice } from '../../app/api/apiSlice'
import { allPages } from '../stores/storesApiSlice'
import type { Product, ProductInput } from '../../services/earthApi'

/** The seller's listings: create or update (DRAFT or PUBLISHED), list, read one. */
export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    saveProduct: builder.mutation<Product, ProductInput>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: ['MyProducts', 'Catalog'],
    }),
    /** Every listing of the signed-in seller, drafts included; [] when there is no store yet. */
    getMyProducts: builder.query<Product[], 'DRAFT' | 'PUBLISHED' | void>({
      async queryFn(status, _, __, baseQuery) {
        const res = await allPages<Product>((cursor) => {
          const q = new URLSearchParams({ limit: '50' })
          if (status) q.set('status', status)
          if (cursor) q.set('cursor', cursor)
          return baseQuery(`/products/me?${q}`)
        })
        if ('error' in res) return res.error.status === 404 ? { data: [] } : { error: res.error }
        return res
      },
      providesTags: ['MyProducts'],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${encodeURIComponent(id)}`,
    }),
  }),
})

export const { useSaveProductMutation, useGetMyProductsQuery, useLazyGetMyProductsQuery, useGetProductQuery } = productsApiSlice
