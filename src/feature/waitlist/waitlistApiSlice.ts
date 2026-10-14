import { apiSlice } from '../../app/api/apiSlice'

export type WaitlistIntent = 'BUYING' | 'SELLING' | 'BOTH'

export interface JoinWaitlistBody {
  intent: WaitlistIntent
  email: string
  city: string
  name?: string
  phone?: string
  referralCode?: string
  marketingConsent?: boolean
}

export interface WaitlistPlace {
  entryId: string
  city: string
  position: number
  priorityPoints: number
  referralCode: string
  referralsCredited: number
  status: string
}

/**
 * The launch waitlist: join (202, a code is emailed), confirm the code (the place exists from
 * then on; the response carries a short-lived place token), and read the place within the city.
 * Joining answers the same whether the address is new or known, so it cannot probe the list.
 */
export const waitlistApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    joinWaitlist: builder.mutation<{ entryId: string; status: string }, JoinWaitlistBody>({
      query: (body) => ({
        url: '/waitlist/entries',
        method: 'POST',
        body,
        // One key per attempt, so a retried click is one entry, not two.
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      }),
    }),
    resendWaitlistCode: builder.mutation<null, { email: string }>({
      query: (body) => ({ url: '/waitlist/verification', method: 'POST', body }),
    }),
    claimWaitlistPlace: builder.mutation<{ entryId: string; placeToken: string; expiresAt: string }, { email: string; code: string }>({
      query: (body) => ({ url: '/waitlist/verification/claim', method: 'POST', body }),
    }),
    getWaitlistPlace: builder.query<WaitlistPlace, string>({
      query: (placeToken) => ({ url: '/waitlist/me', headers: { 'x-place-token': placeToken } }),
    }),
  }),
})

export const { useJoinWaitlistMutation, useResendWaitlistCodeMutation, useClaimWaitlistPlaceMutation, useLazyGetWaitlistPlaceQuery } =
  waitlistApiSlice
