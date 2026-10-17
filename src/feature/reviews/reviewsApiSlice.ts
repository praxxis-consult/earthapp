import { apiSlice } from '../../app/api/apiSlice'
import type { Page } from '../stores/storesApiSlice'

export interface Review {
  id: string
  productId: string
  author: { name: string }
  rating: number
  text: string
  createdAt: string
}

/** The listing's rating: the average (null until the first review), the count, and one bucket per star. */
export interface ReviewSummary {
  average: string | null
  count: string
  stars: { rating: number; count: string }[]
}

export interface ReviewsPage extends Page<Review> {
  summary: ReviewSummary
}

const VISITOR_KEY = 'earth.visitor'
/** One id per browser, so a visitor's repeat views of a listing count once; it carries no identity. */
export function visitorId(): string {
  try {
    const v = localStorage.getItem(VISITOR_KEY)
    if (v) return v
    const fresh = crypto.randomUUID()
    localStorage.setItem(VISITOR_KEY, fresh)
    return fresh
  } catch {
    return crypto.randomUUID()
  }
}

/**
 * Reviews come only from completed, verified purchases (`POST /products/{id}/reviews` wants the
 * order), so the public page reads them and the write form waits for the buyer's orders. Views
 * feed the seller's overview.
 */
export const reviewsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<ReviewsPage, string>({
      query: (productId) => `/products/${encodeURIComponent(productId)}/reviews?limit=50&page=1`,
      providesTags: (_r, _e, id) => [{ type: 'Reviews', id }],
    }),
    postReview: builder.mutation<Review, { productId: string; orderId: string; rating: number; text: string }>({
      query: ({ productId, ...body }) => ({ url: `/products/${encodeURIComponent(productId)}/reviews`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'Reviews', id: productId }],
    }),
    recordView: builder.mutation<{ accepted: true }, string>({
      query: (productId) => ({ url: `/products/${encodeURIComponent(productId)}/views`, method: 'POST', body: { eventId: crypto.randomUUID(), visitorId: visitorId() } }),
    }),
  }),
})

export const { useGetReviewsQuery, usePostReviewMutation, useRecordViewMutation } = reviewsApiSlice
