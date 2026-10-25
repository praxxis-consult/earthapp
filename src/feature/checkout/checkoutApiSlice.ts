import { apiSlice } from '../../app/api/apiSlice'

export type CheckoutStatus = 'PREPARING' | 'READY' | 'BINDING' | 'SUBMITTING' | 'PENDING' | 'APPLYING' | 'PAID' | 'CANCELLING' | 'CANCELLED' | 'NEEDS_ATTENTION'

/** How one store of the cart is fulfilled: the buyer collects, or a chosen carrier quote delivers. */
export type CheckoutStore = { storeId: string; fulfillmentMethod: 'SELF_PICKUP'; note?: string } | { storeId: string; fulfillmentMethod: 'SHIPPING'; quoteId: string; note?: string }

/** A combined checkout: the frozen cart, one payment, one child order per store. */
export interface Checkout {
  id: string
  status: CheckoutStatus
  version: number
  reference: string
  environment: 'test' | 'live'
  cartVersion: number
  /** Kobo, once the stores are prepared. */
  amount: string | null
  currency: 'NGN'
  paymentStatus: 'UNCONFIRMED' | 'VERIFIED'
  authorizationUrl: string | null
  expiresAt: string
  /** Why it was cancelled, e.g. `financial/invalid` or `orders/state-conflict`. */
  problemType: string | null
  orders: { storeId: string; orderId: string | null; fulfillmentMethod: 'SHIPPING' | 'SELF_PICKUP'; prepared: boolean; paymentApplied: boolean; cancelled: boolean }[]
}

/**
 * One payment for a whole cart (25 October): `POST /checkouts` freezes the saved cart and every
 * store's fulfillment choice (202, PREPARING); a worker reserves each store's order and the
 * checkout turns READY with the child order ids; `POST /checkouts/{id}/payment` asks for the
 * single hosted Paystack page, read back from `GET` once `authorizationUrl` is set; on return,
 * `POST /checkouts/{id}/payment/confirm` verifies the payment and the store allocations apply.
 * Child orders are never paid on their own: their payment record reads GROUP_CHECKOUT.
 */
export const checkoutApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCheckout: builder.mutation<Checkout, { clientCheckoutId: string; cartVersion: number; stores: CheckoutStore[]; callbackUrl: string }>({
      query: (body) => ({ url: '/checkouts', method: 'POST', body }),
      invalidatesTags: ['Orders'],
    }),
    getCheckout: builder.query<Checkout, string>({
      query: (id) => `/checkouts/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: 'Checkout', id }],
    }),
    startCheckoutPayment: builder.mutation<Checkout, string>({
      query: (id) => ({ url: `/checkouts/${encodeURIComponent(id)}/payment`, method: 'POST', body: {} }),
    }),
    confirmCheckoutPayment: builder.mutation<Checkout, string>({
      query: (id) => ({ url: `/checkouts/${encodeURIComponent(id)}/payment/confirm`, method: 'POST', body: {} }),
      invalidatesTags: (_r, _e, id) => ['Orders', 'Overview', { type: 'Checkout', id }],
    }),
  }),
})

export const { useCreateCheckoutMutation, useLazyGetCheckoutQuery, useGetCheckoutQuery, useStartCheckoutPaymentMutation, useConfirmCheckoutPaymentMutation } = checkoutApiSlice
