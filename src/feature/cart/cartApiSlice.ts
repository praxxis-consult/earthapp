import { apiSlice } from '../../app/api/apiSlice'

/** One line of the account's cart, as the API keeps it: which listing of which store, and how many. */
export interface CartItem {
  storeId: string
  productId: string
  quantity: number
}

/** `GET /cart`: the account's lines across devices; every save sends the version it last read. */
export interface Cart {
  version: number
  items: CartItem[]
  updatedAt: string | null
}

/**
 * The buyer's cart on the API (25 October): account-owned, so it follows the buyer to another
 * device. `PUT /cart` replaces the whole list under `expectedVersion`; a stale version is refused
 * (409) and the caller reads again. The answer is the cart as saved, written straight into the
 * cache so the badge and the page move with it.
 */
export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<Cart, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    saveCart: builder.mutation<Cart, { expectedVersion: number; items: CartItem[] }>({
      query: (body) => ({ url: '/cart', method: 'PUT', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(cartApiSlice.util.upsertQueryData('getCart', undefined, data))
        } catch {
          /* the caller reports it */
        }
      },
    }),
  }),
})

export const { useGetCartQuery, useSaveCartMutation } = cartApiSlice
