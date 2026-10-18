import { apiSlice } from '../../app/api/apiSlice'
import { allPages } from '../stores/storesApiSlice'
import type { OverviewOrder } from '../overview/overviewApiSlice'
import type { ApiProblem } from '../../services/earthApi'

/** An order as `GET /orders/me` and `GET /orders/{id}` list it: the same summary the seller's overview carries. */
export type OrderSummary = OverviewOrder

type BaseQuery = (url: string) => Promise<{ data?: unknown; error?: ApiProblem }>

/**
 * The signed-in account's orders. A buyer reads the ones they placed; cancelling needs the
 * order's current version, like every write on the API. Accept/ready/dispatch belong to the
 * seller's pages.
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
    cancelOrder: builder.mutation<OrderSummary, { id: string; expectedVersion: number; reason?: string }>({
      query: ({ id, ...body }) => ({ url: `/orders/${encodeURIComponent(id)}/cancel`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { id }) => ['Orders', { type: 'Orders', id }],
    }),
  }),
})

export const { useListMyOrdersQuery, useGetOrderQuery, useCancelOrderMutation } = ordersApiSlice
