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
  /** YYYY-MM-DD, the day the carrier collects from the seller: today to seven days ahead, Lagos time. */
  pickupDate: string
}

/**
 * The parcel a seller ships in. `shipbubbleCategoryId` is one of the carrier's own categories
 * (`GET /delivery/providers/shipbubble/categories`); a guessed id is refused at quote time.
 */
export interface Parcel {
  lengthCm: number
  widthCm: number
  heightCm: number
  emptyWeightGrams: number
  maxWeightGrams: number
  shipbubbleCategoryId: number
  /** Kept when an older profile carries it; the current walkthrough no longer sends it. */
  terminalPackagingId?: string
}

/** A seller's delivery setup (`/delivery/stores/{storeId}/shipping`): pickup contact and parcel. */
export interface ShippingProfile {
  storeId: string
  version: number
  profile: { pickup: DeliveryAddress; parcel: Parcel }
}

/** One of Shipbubble's goods categories, by its own numeric id ("Groceries" was 2178251 when the walkthrough was written). */
export interface ShipbubbleCategory {
  id: number
  name: string
}

/**
 * One carrier offer for a basket. The walkthrough says a quote answer carries `items`, each with
 * an `id` the order is created from, a total and an expiry (two minutes); it names no other
 * field, so the rest is read leniently in `data/quotes.ts` until a quote can be produced.
 */
export interface Quote {
  id: string
  [key: string]: unknown
}

export interface QuoteResponse {
  items: Quote[]
  [key: string]: unknown
}

/**
 * Delivery on Earth: a seller's pickup contact and parcel (what the carriers need to quote), and
 * the buyer's `POST /delivery/quotes`, which compares live carrier rates for a basket. Shipbubble
 * is the default provider; the buyer picks a courier from the returned rates, not a provider.
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
    /** Public; the list is the carrier's own and changes rarely. */
    getShipbubbleCategories: builder.query<ShipbubbleCategory[], void>({
      query: () => '/delivery/providers/shipbubble/categories',
      transformResponse: (res: { items: ShipbubbleCategory[] }) => res.items,
      keepUnusedDataFor: 3600,
    }),
    requestQuotes: builder.mutation<QuoteResponse, QuoteRequest>({
      query: (body) => ({ url: '/delivery/quotes', method: 'POST', body }),
    }),
  }),
})

export const { useGetShippingProfileQuery, useSaveShippingProfileMutation, useGetShipbubbleCategoriesQuery, useRequestQuotesMutation } = deliveryApiSlice
