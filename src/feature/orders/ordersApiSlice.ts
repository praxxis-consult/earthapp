import { apiSlice } from '../../app/api/apiSlice'
import { allPages, type Page } from '../stores/storesApiSlice'
import type { OverviewOrder } from '../overview/overviewApiSlice'
import type { ApiProblem } from '../../services/earthApi'
import { normalizeOrder } from '../../data/orderFlow'

/** A party's address on an order, as the API records it. */
export interface OrderAddress {
  country: string
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

/** One line of an order. */
export interface OrderItem {
  productId: string
  name: string
  thumbnail: string | null
  priceMinor: string
  quantity: number
  weightGrams: number
  perishable: boolean | null
}

/** The money on an order, kobo strings: what the buyer pays and how it splits (seen 19 October). */
export interface OrderPricing {
  policyId: string
  currency: string
  goods: string
  carrier: string
  commission: string
  deliveryMarkup: string
  tax: string
  buyerTotal: string
  sellerAllocation: string
  carrierAllocation: string
  earthAllocation: string
}

/** One recorded event on an order (`GET /orders/{id}/timeline` and the order's own `timeline.items`). */
export interface TimelineEvent {
  sequence: number
  /** "order.created", "payment.initializing", "payment.pending", "payment.verified", … */
  kind: string
  actor_id: string | null
  actor_kind?: string
  reason: string | null
  created_at: string
}

/**
 * What `GET /orders/{id}` carries beyond the list summary, as seen on 19 October: the lines,
 * both addresses, the chosen carrier, the money split, the recorded events, the payment window
 * (`expiresAt`, fifteen minutes) and the seller's acceptance deadline.
 */
export interface OrderExtras {
  buyerId?: string
  sellerId?: string
  expiresAt?: string | null
  acceptanceDeadline?: string | null
  acceptancePolicy?: { minutes: number; basis: string; openingHours: unknown } | null
  paymentReviewReason?: string | null
  reservationStatus?: string
  cancellationRequested?: boolean
  refundRequired?: boolean
  refundedMinor?: string
  refundOutstandingMinor?: string
  customerSince?: string
  note?: string | null
  items?: OrderItem[]
  address?: OrderAddress
  pickup?: OrderAddress
  delivery?: { provider: string; carrier: string; service: string; estimate: string } | null
  pricing?: OrderPricing
  timeline?: { items: TimelineEvent[] }
  /** SHIPPING (a carrier delivers) or SELF_PICKUP (the buyer collects from the seller's pickup address). Since Ralph's PR #20 (25 October) `fulfillmentMethod` is the name, with `deliveryMethod` kept as an identical alias. */
  fulfillmentMethod?: 'SHIPPING' | 'SELF_PICKUP' | string | null
  deliveryMethod?: 'SHIPPING' | 'SELF_PICKUP' | string | null
  /** Set when the order was one store of a combined checkout; its payment lives on the checkout. */
  checkoutId?: string | null
  /** The carrier booking after payment and READY: `{ status, tracking, confirmedPickup, checkedAt }`. */
  fulfillmentDelivery?: { status?: string; tracking?: Record<string, unknown> | null; confirmedPickup?: unknown; checkedAt?: string } | null
}

/** An order as the pages use it: the list summary every endpoint shares, plus whatever the detail added. */
export type OrderSummary = OverviewOrder & OrderExtras

/** `GET /orders/{id}` as the API answers it: no `item`/`total` summary, but `items`, `amountPaid` and the rest. */
export type OrderDetailRaw = Omit<OverviewOrder, 'item' | 'itemCount' | 'firstItem' | 'total' | 'currency'> & OrderExtras & { amountPaid: string; items: OrderItem[] }

/** `GET /orders/{id}/payment`: 202 from the POST means "preparing"; the hosted link appears here once the worker has it, and `status` reads PAID after. */
export interface PaymentStatus {
  orderId?: string
  status?: string
  reference?: string
  authorizationUrl?: string | null
  [key: string]: unknown
}

/** `GET /orders/{id}/receipt`, after verified payment. */
export interface Receipt {
  orderId: string
  invoiceNumber: string
  paymentReference: string
  providerTransactionId: string
  provider: string
  environment: string
  amount: string
  currency: string
  paidAt: string
  refundedMinor: string
  refundOutstandingMinor: string
  version: number
}

/** `POST /orders/{id}/payment/confirm`: the server verifies with Paystack itself and reports what it found. */
export interface PaymentConfirmation {
  status?: string
  orderStatus?: string
  reservationStatus?: string
  refundRequired?: boolean
  [key: string]: unknown
}

/** Every write on an order sends the version the caller last read; a stale one is refused (409). */
export interface OrderAction {
  id: string
  expectedVersion: number
  reason?: string
}

export type CreateOrderBody = { quoteId: string; note?: string } | { fulfillmentMethod: 'SELF_PICKUP'; clientOrderId: string; storeId: string; items: { productId: string; quantity: number }[]; note?: string }

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
      transformResponse: (raw: OrderDetailRaw) => normalizeOrder(raw),
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),
    getTimeline: builder.query<TimelineEvent[], string>({
      query: (id) => `/orders/${encodeURIComponent(id)}/timeline?page=1&limit=50`,
      transformResponse: (res: Page<TimelineEvent>) => res.items ?? [],
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),
    /** The frozen record of what was paid; only after verified payment. */
    getReceipt: builder.query<Receipt, string>({
      query: (id) => `/orders/${encodeURIComponent(id)}/receipt`,
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),
    /** From a carrier quote (the same buyer and quote return the same order), or a self-pickup order under a client id (25 October): no quote, address or carrier fee. */
    createOrder: builder.mutation<OrderDetailRaw, CreateOrderBody>({
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
    cancelOrder: builder.mutation<OrderDetailRaw, OrderAction>(transition('cancel')),
    /** A paid self-pickup order marked READY by the seller: the original buyer confirms they collected it, which completes it. */
    confirmPickup: builder.mutation<OrderDetailRaw, OrderAction>(transition('pickup/confirm')),
    acceptOrder: builder.mutation<OrderDetailRaw, OrderAction>(transition('accept')),
    declineOrder: builder.mutation<OrderDetailRaw, OrderAction>(transition('decline')),
    readyOrder: builder.mutation<OrderDetailRaw, OrderAction>(transition('ready')),
    dispatchOrder: builder.mutation<OrderDetailRaw, OrderAction>(transition('dispatch')),
    completeOrder: builder.mutation<OrderDetailRaw, OrderAction>(transition('complete')),
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
  useConfirmPickupMutation,
  useAcceptOrderMutation,
  useDeclineOrderMutation,
  useReadyOrderMutation,
  useDispatchOrderMutation,
  useCompleteOrderMutation,
} = ordersApiSlice
