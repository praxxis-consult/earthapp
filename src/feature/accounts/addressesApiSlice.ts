import { apiSlice } from '../../app/api/apiSlice'
import type { DeliveryAddress } from '../delivery/deliveryApiSlice'

/** A saved delivery address as `GET /accounts/me/addresses` lists it. */
export interface ApiAddress {
  id: string
  version: number
  label: string | null
  address: DeliveryAddress
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface AddressPage {
  items: ApiAddress[]
  nextCursor: string | null
  hasNext: boolean
}

/**
 * The buyer's saved delivery addresses on the API (25 October). A new one is created under a
 * client UUID (so a retry cannot double it); edits and removals send the current version; only
 * one address is the default, and removing the default names its replacement.
 */
export const addressesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listAddresses: builder.query<ApiAddress[], void>({
      async queryFn(_, __, ___, baseQuery) {
        const all: ApiAddress[] = []
        let cursor: string | null = null
        for (let page = 0; page < 20; page++) {
          const res = await baseQuery(`/accounts/me/addresses${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`)
          if (res.error) return { error: res.error }
          const data = res.data as AddressPage
          all.push(...(data.items ?? []))
          if (!data.hasNext || !data.nextCursor) break
          cursor = data.nextCursor
        }
        return { data: all }
      },
      providesTags: ['Addresses'],
    }),
    addAddress: builder.mutation<ApiAddress, { id: string; label: string | null; address: DeliveryAddress; isDefault: boolean }>({
      query: (body) => ({ url: '/accounts/me/addresses', method: 'POST', body }),
      invalidatesTags: ['Addresses'],
    }),
    updateAddress: builder.mutation<ApiAddress, { id: string; expectedVersion: number; label?: string | null; address?: DeliveryAddress; isDefault?: boolean }>({
      query: ({ id, ...body }) => ({ url: `/accounts/me/addresses/${encodeURIComponent(id)}`, method: 'PATCH', body }),
      invalidatesTags: ['Addresses'],
    }),
    removeAddress: builder.mutation<void, { id: string; expectedVersion: number; replacementAddressId?: string }>({
      query: ({ id, ...body }) => ({ url: `/accounts/me/addresses/${encodeURIComponent(id)}`, method: 'DELETE', body }),
      invalidatesTags: ['Addresses'],
    }),
  }),
})

export const { useListAddressesQuery, useAddAddressMutation, useUpdateAddressMutation, useRemoveAddressMutation } = addressesApiSlice
