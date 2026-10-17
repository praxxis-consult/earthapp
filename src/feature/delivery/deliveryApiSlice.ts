import { apiSlice } from '../../app/api/apiSlice'

/** Where a parcel goes: the API's delivery address (Nigeria only today), with who receives it. */
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

/**
 * The buyer's side of an order, step one: `POST /delivery/quotes` compares live carrier rates for
 * the basket and answers the quotes to choose from. The API documents no answer shape yet and
 * the QA server has no carrier behind it, so the answer is kept as it comes until it is known.
 */
export const deliveryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    requestQuotes: builder.mutation<unknown, QuoteRequest>({
      query: (body) => ({ url: '/delivery/quotes', method: 'POST', body }),
    }),
  }),
})

export const { useRequestQuotesMutation } = deliveryApiSlice
