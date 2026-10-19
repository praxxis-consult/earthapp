import { apiSlice } from '../../app/api/apiSlice'
import { allPages, type Page } from '../stores/storesApiSlice'
import type { OverviewOrder } from '../overview/overviewApiSlice'
import type { ApiProblem } from '../../services/earthApi'

/**
 * What an order carries beyond the overview's summary, as the seller-and-buyer walkthrough names
 * it: the payment window (`expiresAt`, fifteen minutes from creation), the buyer's note, and the
 * flags the cancel and confirm steps return. The spec has no schema for an order, so each is
 * optional and read only when present.
 */
export interface OrderExtras {
  expiresAt?: string | null
  note?: string | null
  reservationStatus?: string
  cancellationRequested?: boolean
  refundRequired?: boolean
  /** The carrier booking the delivery worker records after payment and READY: label, tracking. */
  fulfillmentDelivery?: Record<string, unknown> | null
  items?: { productId?: string; [key: string]: unknown }[]
}

/** An order as `GET /orders/me` and `GET /orders/{id}` list it: the overview's summary, plus what the order itself carries. */
export type OrderSummary = OverviewOrder & OrderExtras

/** `GET /orders/{id}/payment`: 202 from the POST means "preparing"; the hosted link appears here once the worker has it. */
export interface PaymentStatus {
  status?: string
  authorizationUrl?: string | null
  [key: string]: unknown
}

/** `POST /orders/{id}/payment/confirm`: the server verifies with Paystack itself and reports what it found. */
export interface PaymentConfirmation {
  status?: string
  orderStatus?: string
  reservationStatus?: string
  refundRequired?: boolean
  [key: string]: unknown
}

/** One recorded event on an order (`GET /orders/{id}/timeline`); its field names are read leniently in `data/orderFlow.ts`. */
export type TimelineEvent = Record<string, unknown>

/** Every write on an order sends the version the caller last read; a stale one is refused (409). */
export interface OrderAction {
  id: string
  expectedVersion: number
  reason?: string
}

type BaseQuery = (url: string) => Promise<{ data?: unknown; error?: ApiProblem }>

const transition = (step: string) => ({
  query: ({ id, ...body }: OrderAction) => ({ url: `/orders/${encodeURIComponent(id)}/${step}`, method: 'POST', body }),
  invalidatesTags: (_r: unknown, _e: unknown, { id }: OrderAction) => ['Orders' as const, { type: 'Orders' as const, id }, 'Overview' as const],
})

/**
 * Orders, both sides. The buyer creates one from a chosen quote, prepares the hosted payment,
 * confirms it on return, and may cancel; the seller accepts or declines a paid order, marks it
 * ready (which books the carrier), dispatched once the carrier has collected, and completed
 * once the carrier has delivered. `GET /orders/me` lists whichever side the account is on.
 */
export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listMyOrders: builder.query<OrderSummary[], void>({
      queryFn: (_, __, ___, baseQuery) => allPages<OrderSummary>((page) => (baseQuery as BaseQuery)(`/orders/me?limit=50&page=${page}`)),
      providesTags: ['Orders'],
    }),
    getOrder: builder.query<OrderSummary, string>({
      query: (id) => `/orders/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),
    getTimeline: builder.query<TimelineEvent[], string>({
      query: (id) => `/orders/${encodeURIComponent(id)}/timeline?page=1&limit=50`,
      transformResponse: (res: Page<TimelineEvent>) => res.items ?? [],
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),
    /** The frozen record of what was paid; only after verified payment. */
    getReceipt: builder.query<Record<string, unknown>, string>({
      query: (id) => `/orders/${encodeURIComponent(id)}/receipt`,
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),
    /** No client idempotency key: the same buyer and quote return the same order. */
    createOrder: builder.mutation<OrderSummary, { quoteId: string; note?: string }>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Orders'],
    }),
    /** 202: the worker prepares the hosted Paystack checkout; the callback is fixed on the first call. */
    startPayment: builder.mutation<PaymentStatus | null, { id: string; callbackUrl: string }>({
      query: ({ id, callbackUrl }) => ({ url: `/orders/${encodeURIComponent(id)}/payment`, method: 'POST', body: { callbackUrl } }),
    }),
    getPayment: builder.query<PaymentStatus, string>({
      query: (id) => `/orders/${encodeURIComponent(id)}/payment`,
    }),
    /** Sent with nothing: the server asks Paystack itself. 409 means "not verified yet", not "paid". */
    confirmPayment: builder.mutation<PaymentConfirmation, string>({
      query: (id) => ({ url: `/orders/${encodeURIComponent(id)}/payment/confirm`, method: 'POST', body: {} }),
      invalidatesTags: (_r, _e, id) => ['Orders', { type: 'Orders', id }],
    }),
    cancelOrder: builder.mutation<OrderSummary, OrderAction>(transition('cancel')),
    acceptOrder: builder.mutation<OrderSummary, OrderAction>(transition('accept')),
    declineOrder: builder.mutation<OrderSummary, OrderAction>(transition('decline')),
    readyOrder: builder.mutation<OrderSummary, OrderAction>(transition('ready')),
    dispatchOrder: builder.mutation<OrderSummary, OrderAction>(transition('dispatch')),
    completeOrder: builder.mutation<OrderSummary, OrderAction>(transition('complete')),
  }),
})

export const {
  useListMyOrdersQuery,
  useGetOrderQuery,
  useGetTimelineQuery,
  useGetReceiptQuery,
  useCreateOrderMutation,
  useStartPaymentMutation,
  useLazyGetPaymentQuery,
  useConfirmPaymentMutation,
  useCancelOrderMutation,
  useAcceptOrderMutation,
  useDeclineOrderMutation,
  useReadyOrderMutation,
  useDispatchOrderMutation,
  useCompleteOrderMutation,
} = ordersApiSlice
