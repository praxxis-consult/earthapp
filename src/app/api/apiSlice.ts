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

/** Rotates the access token once, however many calls hit a 401 at the same time. */
function refreshOnce(api: BaseQueryApi): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      const res = await rawBaseQuery({ url: '/auth/refresh', method: 'POST', body: {} }, api, {})
      if (res.data) {
        api.dispatch(setCredentials(res.data as Credentials))
        return true
      }
      const status = (res.error as { status?: unknown } | undefined)?.status
      if (status === 401 || status === 403) api.dispatch(logOut())
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

/** The bearer header, a refresh just before expiry, one retry after a 401, and problem+json errors. */
export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiProblem> = async (args, api, extraOptions) => {
  const auth = (api.getState() as RootState).auth
  if (auth.accessToken && expiringSoon(auth.expiresAt)) await refreshOnce(api)

  let result = await rawBaseQuery(args, api, extraOptions)
  if (result.error?.status === 401 && (api.getState() as RootState).auth.accessToken) {
    if (await refreshOnce(api)) result = await rawBaseQuery(args, api, extraOptions)
  }
  if (result.error) return { error: toProblem(result.error, result.meta as { response?: Response } | undefined) }
  return { data: result.data }
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Account', 'Onboarding', 'Categories', 'MyProducts', 'Catalog'],
  endpoints: () => ({}),
})
