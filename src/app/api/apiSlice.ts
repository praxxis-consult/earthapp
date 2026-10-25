import { createApi, fetchBaseQuery, type BaseQueryApi, type BaseQueryFn, type FetchArgs } from '@reduxjs/toolkit/query/react'
import { logOut, setCredentials, type Credentials } from '../../feature/authentication/authSlice'
import type { ApiProblem, Problem } from './problem'
import type { RootState } from '../store'

/**
 * Every call goes to this origin under /v1, which the dev server (vite.config.js) and Vercel
 * (vercel.json) proxy to the Earth API, because the API is plain HTTP with no CORS. The access
 * token lives in the auth slice (and localStorage); the refresh token is an HttpOnly cookie the
 * API scopes to /v1/auth, so a page reload rotates a fresh access token without a login.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/v1',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const { accessToken } = (getState() as RootState).auth
    if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)
    headers.set('accept', 'application/json')
    return headers
  },
})

let refreshing: Promise<boolean> | null = null

/**
 * Rotates the access token once, however many callers ask at the same time: the session
 * bootstrap on load, a query that hit a 401, and (in development) React's doubled effects all
 * share one request. The API rotates the refresh cookie on every call, so two parallel refreshes
 * would present the same cookie twice and the second one ends the session.
 */
export function refreshOnce(dispatch: Pick<BaseQueryApi, 'dispatch'>['dispatch']): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch('/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: { accept: 'application/json', 'content-type': 'application/json' },
          body: '{}',
        })
        if (res.ok) {
          dispatch(setCredentials((await res.json()) as Credentials))
          return true
        }
        if (res.status === 401 || res.status === 403) dispatch(logOut())
      } catch {
        /* offline: the caller's own request reports it */
      }
      return false
    })().finally(() => {
      refreshing = null
    })
  }
  return refreshing
}

const expiringSoon = (expiresAt: string | null) => Boolean(expiresAt) && new Date(expiresAt!).getTime() - Date.now() < 60_000

function toProblem(error: { status: unknown; data?: unknown }, meta: { response?: Response } | undefined): ApiProblem {
  const retry = meta?.response?.headers.get('retry-after')
  return {
    status: typeof error.status === 'number' ? error.status : 0,
    data: typeof error.data === 'object' && error.data !== null ? (error.data as Partial<Problem>) : null,
    retryAfter: retry ? Number(retry) || undefined : undefined,
  }
}

/** While the API says "too many requests", nothing is sent until its Retry-After has passed (capped at a minute), so polling stops hammering it. */
let rateLimitedUntil = 0
let lastRateLimit: ApiProblem | null = null
const RATE_LIMIT_CAP_MS = 60_000

/** The bearer header, a refresh just before expiry, one retry after a 401, a pause after a 429, and problem+json errors. */
export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiProblem> = async (args, api, extraOptions) => {
  if (Date.now() < rateLimitedUntil && lastRateLimit) return { error: lastRateLimit }
  const auth = (api.getState() as RootState).auth
  if (auth.accessToken && expiringSoon(auth.expiresAt)) await refreshOnce(api.dispatch)

  let result = await rawBaseQuery(args, api, extraOptions)
  if (result.error?.status === 401 && (api.getState() as RootState).auth.accessToken) {
    if (await refreshOnce(api.dispatch)) result = await rawBaseQuery(args, api, extraOptions)
  }
  if (result.error) {
    const problem = toProblem(result.error, result.meta as { response?: Response } | undefined)
    if (problem.status === 429) {
      rateLimitedUntil = Date.now() + Math.min((problem.retryAfter ?? 30) * 1000, RATE_LIMIT_CAP_MS)
      lastRateLimit = problem
    }
    return { error: problem }
  }
  return { data: result.data }
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Account', 'Preferences', 'Onboarding', 'Categories', 'MyProducts', 'Catalog', 'Chats', 'Notifications', 'Shipping', 'Overview', 'Reviews', 'Orders', 'Recipient', 'Cart', 'Addresses', 'Checkout'],
  endpoints: () => ({}),
})
