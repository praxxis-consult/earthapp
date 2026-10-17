import { apiSlice } from '../../app/api/apiSlice'

/** One day of the seven-day series; amounts are kobo strings, counts decimal strings. */
export interface OverviewDay {
  date: string
  dayOfWeek: number
  amountMinor?: string
  count?: string
  currency?: 'NGN'
}

export interface OverviewOrder {
  id: string
  storeId: string
  buyerName: string
  storeName: string
  status: string
  paymentStatus: string
  createdAt: string
  paidAt: string | null
  currency: 'NGN'
  /** Kobo. */
  total: string
  itemCount: number
  firstItem: string
  item: { name: string; thumbnail: string | null; quantity: number; weightGrams: number; priceMinor: string }
  deliveryMethod: 'SHIPPING'
  version: number
}

/** `GET /stores/me/overview`: the seller's last seven days, as the API computes them. */
export interface Overview {
  currency: 'NGN'
  days: number
  timezone: string
  rangeStart: string
  rangeEnd: string
  asOf: string
  /** True when the figures lag the latest events. */
  stale: boolean
  viewTrackingSince: string
  earnings: { amountMinor: string; currency: 'NGN'; basis: string }
  awaitingOrderCount: string
  completedOrderCount: string
  paymentReviewOrderCount: string
  rating: { average: string | null; count: string }
  sales: OverviewDay[]
  productViews: OverviewDay[]
  latestOrders: OverviewOrder[]
}

export const overviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query<Overview, void>({
      query: () => '/stores/me/overview',
      providesTags: ['Overview'],
    }),
  }),
})

export const { useGetOverviewQuery } = overviewApiSlice
