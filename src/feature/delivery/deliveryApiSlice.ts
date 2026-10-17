import { apiSlice } from '../../app/api/apiSlice'

/** Where a parcel goes or is collected: the API's address (Nigeria only today), with who is there. */
export interface DeliveryAddress {
  country: 'NG'
  region: string
  area: string
  street: string
  landmark: string
  postalCode: string
  firstName: string
  lastName: string
  phone: string
  email: string
}

export interface QuoteRequest {
  storeId: string
  items: { productId: string; quantity: number }[]
  address: DeliveryAddress
  /** YYYY-MM-DD, the day the carrier collects from the seller. */
  pickupDate: string
}

/** The parcel a seller ships in; the two provider references are the carriers' own catalogue ids. */
export interface Parcel {
  lengthCm: number
  widthCm: number
  heightCm: number
  emptyWeightGrams: number
  maxWeightGrams: number
  shipbubbleCategoryId: number
  terminalPackagingId: string
}

/** A seller's delivery setup (`/delivery/stores/{storeId}/shipping`): pickup contact and parcel. */
export interface ShippingProfile {
  storeId: string
  version: number
  profile: { pickup: DeliveryAddress; parcel: Parcel }
}

/**
 * Delivery on Earth: a seller's pickup contact and parcel (what the carriers need to quote), and
 * the buyer's `POST /delivery/quotes`, which compares live carrier rates for a basket. The API
 * documents no quote answer yet and the QA server has no carrier behind it, so the answer is
 * kept as it comes until it is known.
 */
export const deliveryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** null when the store has no delivery setup yet (the API answers 404). */
    getShippingProfile: builder.query<ShippingProfile | null, string>({
      async queryFn(storeId, _, __, baseQuery) {
        const res = await baseQuery(`/delivery/stores/${encodeURIComponent(storeId)}/shipping`)
        if (res.error) return res.error.status === 404 ? { data: null } : { error: res.error }
        return { data: res.data as ShippingProfile }
      },
      providesTags: ['Shipping'],
    }),
    saveShippingProfile: builder.mutation<ShippingProfile, { storeId: string; expectedVersion: number; profile: ShippingProfile['profile'] }>({
      query: ({ storeId, ...body }) => ({ url: `/delivery/stores/${encodeURIComponent(storeId)}/shipping`, method: 'PUT', body }),
      invalidatesTags: ['Shipping'],
    }),
    requestQuotes: builder.mutation<unknown, QuoteRequest>({
      query: (body) => ({ url: '/delivery/quotes', method: 'POST', body }),
    }),
  }),
})

export const { useGetShippingProfileQuery, useSaveShippingProfileMutation, useRequestQuotesMutation } = deliveryApiSlice
