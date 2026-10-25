import { apiSlice } from '../../app/api/apiSlice'

/** One settled order's money, kobo strings. */
export interface PayoutRow {
  orderId: string
  buyer: string
  date: string
  currency: 'NGN'
  amount: string
  commission: string
  vat: string
  delivery: string
  net: string
  settlementId: string
}

/** `GET /payouts/me` (25 October): provider-confirmed payouts, pending settlement and the risk tiers. All money is kobo strings. */
export interface PayoutSummary {
  currency: 'NGN'
  environment: 'test' | 'live'
  paidAllTime: string
  pending: string
  risk: {
    currency: 'NGN'
    policyId: string
    /** The store's current exposure limit, how much is in progress against it, and what is left. */
    current: string
    inProgress: string
    remaining: string
    goodOrders: number
    distinctQualifyingBuyers: number
    tiers: { limit: string; goodOrders: number; distinctBuyers: number }[]
  }
  reconciliation: { lastSyncedAt: string | null; stale: boolean }
  items: PayoutRow[]
  page: number
  limit: number
  hasNext: boolean
  nextPage: number | null
}

/**
 * The seller's payout summary. A non-owner's 404 reads as `null`; anything else (a 503 while the
 * provider is unavailable) stays an error, never an empty balance, as the guide asks.
 */
export const payoutsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPayouts: builder.query<PayoutSummary | null, void>({
      async queryFn(_, __, ___, baseQuery) {
        const res = await baseQuery('/payouts/me?page=1&limit=50')
        if (res.error) return res.error.status === 404 ? { data: null } : { error: res.error }
        return { data: res.data as PayoutSummary }
      },
      providesTags: ['Orders', 'Recipient'],
    }),
  }),
})

export const { useGetPayoutsQuery } = payoutsApiSlice
