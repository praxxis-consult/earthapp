import { apiSlice } from '../../app/api/apiSlice'
import type { ApiProblem } from '../../app/api/problem'
import type { Category, Onboarding, OnboardingDraft } from '../../services/earthApi'

type Page<T> = { items: T[]; nextCursor: string | null }

/** Follows keyset pagination to the end. */
export async function allPages<T>(
  fetchPage: (cursor: string | null) => Promise<{ data?: unknown; error?: ApiProblem }>,
): Promise<{ data: T[] } | { error: ApiProblem }> {
  const all: T[] = []
  let cursor: string | null = null
  do {
    const res = await fetchPage(cursor)
    if (res.error) return { error: res.error }
    const page = res.data as Page<T>
    all.push(...page.items)
    cursor = page.nextCursor
  } while (cursor)
  return { data: all }
}

export type SaveOnboardingBody =
  | (OnboardingDraft & { status: 'DRAFT'; expectedVersion: number })
  | (Required<OnboardingDraft> & { status: 'LIVE'; expectedVersion: number })

/** The seller's own store (onboarding profile) and the selling categories. */
export const storesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** null when the account has no store yet (the API answers 404). */
    getOnboarding: builder.query<Onboarding | null, void>({
      async queryFn(_, __, ___, baseQuery) {
        const res = await baseQuery('/stores/me/onboarding')
        if (res.error) return res.error.status === 404 ? { data: null } : { error: res.error }
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
    getCategories: builder.query<Category[], void>({
      queryFn: (_, __, ___, baseQuery) =>
        allPages<Category>((cursor) => baseQuery(`/store-categories?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`)),
      providesTags: ['Categories'],
      keepUnusedDataFor: 3600,
    }),
  }),
})

export const { useGetOnboardingQuery, useLazyGetOnboardingQuery, useSaveOnboardingMutation, useGetCategoriesQuery } = storesApiSlice
