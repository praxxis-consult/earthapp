import { apiSlice } from '../../app/api/apiSlice'

/** One account that joined through the handle; no email is disclosed. */
export interface ReferredAccount {
  id: string
  name: string
  roles: ('Buyer' | 'Seller' | string)[]
  joinedAt: string
}

/** `GET /referrals/me` (25 October): the store owner's stable handle and who joined through it. */
export interface Referrals {
  handle: string
  counts: { joined: string }
  items: ReferredAccount[]
  page: number
  limit: number
  hasNext: boolean
  nextPage: number | null
}

/**
 * Referrals belong to store owners: the API answers a buyer's `GET /referrals/me` with 404, which
 * reads here as `null` (no handle, nothing to share). The link people type is `/r/<handle>`, and
 * the handle goes with the account they create.
 */
export const referralsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReferrals: builder.query<Referrals | null, void>({
      async queryFn(_, __, ___, baseQuery) {
        const res = await baseQuery('/referrals/me?page=1&limit=50')
        if (res.error) return res.error.status === 404 ? { data: null } : { error: res.error }
        return { data: res.data as Referrals }
      },
      providesTags: ['Account'],
    }),
  }),
})

export const { useGetReferralsQuery } = referralsApiSlice
