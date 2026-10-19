import { apiSlice } from '../../app/api/apiSlice'
import type { ApiProblem } from '../../app/api/problem'
import type { Category, Onboarding, OnboardingDraft } from '../../services/earthApi'

/** One page of a list endpoint: `?page=&limit=` in, `hasNext`/`nextPage` out. */
export interface Page<T> {
  items: T[]
  page: number
  limit: number
  hasNext: boolean
  nextPage: number | null
}

type PageResult = { data?: unknown; error?: ApiProblem }

/** Follows page-number pagination to the end, first page to last. */
export async function allPages<T>(fetchPage: (page: number) => PageResult | PromiseLike<PageResult>): Promise<{ data: T[] } | { error: ApiProblem }> {
  const all: T[] = []
  let page = 1
  for (;;) {
    const res = await fetchPage(page)
    if (res.error) return { error: res.error }
    const got = res.data as Page<T>
    all.push(...got.items)
    // A page that says "next" but points back at itself (or nowhere) would loop forever.
    const next = got.hasNext ? (got.nextPage ?? page + 1) : null
    if (next === null || next <= page) return { data: all }
    page = next
  }
}

export type SaveOnboardingBody =
  | (OnboardingDraft & { status: 'DRAFT'; expectedVersion: number })
  | (Required<OnboardingDraft> & { status: 'LIVE'; expectedVersion: number })

/** The seller's own store (onboarding profile) and the selling categories. */
export const storesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** null when the account has no store yet (404), or cannot have one (403: a buying account). */
    getOnboarding: builder.query<Onboarding | null, void>({
      async queryFn(_, __, ___, baseQuery) {
        const res = await baseQuery('/stores/me/onboarding')
        if (res.error) return res.error.status === 404 || res.error.status === 403 ? { data: null } : { error: res.error }
        return { data: res.data as Onboarding }
      },
      providesTags: ['Onboarding'],
    }),
    saveOnboarding: builder.mutation<Onboarding, SaveOnboardingBody>({
      query: (body) => ({ url: '/stores/me/onboarding', method: 'POST', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(storesApiSlice.util.upsertQueryData('getOnboarding', undefined, data))
        } catch {
          /* the caller reports the failure */
        }
      },
      invalidatesTags: ['Catalog'],
    }),
    /**
     * The store's Paystack recipient (`/stores/{id}/payment-recipient`): provisioned once the store
     * is live with a checked bank, so a buyer's payment can be split at source. The spec gives it no
     * schema; null means none has been set up (404).
     */
    getPaymentRecipient: builder.query<Record<string, unknown> | null, string>({
      async queryFn(storeId, _, __, baseQuery) {
        const res = await baseQuery(`/stores/${encodeURIComponent(storeId)}/payment-recipient`)
        if (res.error) return res.error.status === 404 ? { data: null } : { error: res.error }
        return { data: (res.data ?? {}) as Record<string, unknown> }
      },
      providesTags: ['Recipient'],
    }),
    provisionPaymentRecipient: builder.mutation<Record<string, unknown> | null, string>({
      query: (storeId) => ({ url: `/stores/${encodeURIComponent(storeId)}/payment-recipient`, method: 'POST', body: {} }),
      invalidatesTags: ['Recipient'],
    }),
    getCategories: builder.query<Category[], void>({
      queryFn: (_, __, ___, baseQuery) => allPages<Category>((page) => baseQuery(`/store-categories?limit=50&page=${page}`)),
      providesTags: ['Categories'],
      keepUnusedDataFor: 3600,
    }),
  }),
})

export const { useGetOnboardingQuery, useLazyGetOnboardingQuery, useSaveOnboardingMutation, useGetCategoriesQuery, useGetPaymentRecipientQuery, useProvisionPaymentRecipientMutation } = storesApiSlice
