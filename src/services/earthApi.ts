/**
 * Client for the Earth API (v1). Every call goes to this origin under /v1, which the dev server
 * (vite.config.js) and Vercel (vercel.json) proxy to the API, because the API is plain HTTP with no
 * CORS. The access token lives in memory and localStorage; the refresh token is an HttpOnly cookie
 * the API scopes to /v1/auth, so a page reload rotates a fresh access token without a login.
 */

export interface Problem {
  type: string
  title: string
  status: number
  detail?: string
  correlationId?: string
  errors?: { path?: string; code?: string }[]
}

export class ApiError extends Error {
  status: number
  type: string
  title: string
  detail: string
  correlationId?: string
  errors: { path?: string; code?: string }[]
  retryAfter?: number

  constructor(status: number, problem: Partial<Problem>, retryAfter?: number) {
    super(problem.detail || problem.title || `Request failed (${status})`)
    this.status = status
    this.type = problem.type ?? ''
    this.title = problem.title ?? ''
    this.detail = problem.detail ?? ''
    this.correlationId = problem.correlationId
    this.errors = problem.errors ?? []
    this.retryAfter = retryAfter
  }

  /** The last path segment of the problem type, e.g. "code-invalid", "rate-limited". */
  get code() {
    return this.type.split('/').pop() ?? ''
  }

  /** Per-field problems keyed by the API's field path. */
  get fieldErrors() {
    const out: Record<string, string> = {}
    for (const e of this.errors) if (e.path) out[e.path] = e.code ?? 'invalid'
    return out
  }
}

export interface Session {
  accessToken: string
  expiresAt: string
}

const SESSION_KEY = 'earth.session'
let session: Session | null = readStoredSession()
let refreshing: Promise<Session | null> | null = null

function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Session
    return s.accessToken && s.expiresAt ? s : null
  } catch {
    return null
  }
}

export function getSession() {
  return session
}

export function setSession(next: Session | null) {
  session = next
  try {
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    /* storage blocked: the token still lives for this page */
  }
}

const expiringSoon = (s: Session) => new Date(s.expiresAt).getTime() - Date.now() < 60_000

/** Rotates the access token with the refresh cookie. Resolves null when there is no live session. */
export function refreshSession(): Promise<Session | null> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch('/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'content-type': 'application/json',
            ...(session ? { authorization: `Bearer ${session.accessToken}` } : {}),
          },
          body: '{}',
        })
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) setSession(null)
          return null
        }
        const s = (await res.json()) as Session
        setSession(s)
        return s
      } catch {
        return null
      } finally {
        refreshing = null
      }
    })()
  }
  return refreshing
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  /** Attach the bearer token (and refresh it first when it is about to expire). */
  auth?: boolean
  /** multipart upload: the body is sent as-is with no JSON headers. */
  form?: FormData
  signal?: AbortSignal
}

async function parse(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, form, signal } = opts
  if (auth && session && expiringSoon(session)) await refreshSession()

  const send = () => {
    const headers: Record<string, string> = { accept: 'application/json' }
    if (!form) headers['content-type'] = 'application/json'
    if (auth && session) headers['authorization'] = `Bearer ${session.accessToken}`
    return fetch(path, {
      method,
      headers,
      credentials: 'include',
      body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
      signal,
    })
  }

  let res = await send()
  // A token the server no longer accepts: rotate once and retry, then give up.
  if (res.status === 401 && auth && (await refreshSession())) res = await send()

  if (res.ok) return (await parse(res)) as T
  const problem = ((await parse(res)) ?? {}) as Partial<Problem>
  const retryAfter = res.headers.get('retry-after')
  throw new ApiError(res.status, problem, retryAfter ? Number(retryAfter) || undefined : undefined)
}

/* ---------- accounts & auth ---------- */

export type AccountType = 'BUYING' | 'SELLING' | 'BOTH'
export type OtpIntent = 'ACCOUNT_CONFIRMATION' | 'LOGIN'

export interface Account {
  id: string
  accountType: AccountType
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  status: 'CONFIRMED'
  confirmedAt: string
}

export const accounts = {
  create: (data: {
    accountType: AccountType
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    termsConsent: true
  }) => request<{ status: 'accepted' }>('/v1/accounts', { method: 'POST', body: data }),

  requestOtp: (email: string, intent: OtpIntent) =>
    request<{ status: 'accepted' }>('/v1/auth/otp/request', { method: 'POST', body: { email, intent } }),

  resendOtp: (email: string, intent: OtpIntent) =>
    request<{ status: 'accepted' }>('/v1/auth/otp/resend', { method: 'POST', body: { email, intent } }),

  confirm: (email: string, code: string) =>
    request<{ status: 'confirmed' }>('/v1/auth/otp/verify', {
      method: 'POST',
      body: { email, intent: 'ACCOUNT_CONFIRMATION', code },
    }),

  login: async (email: string, code: string) => {
    const s = await request<Session & { tokenType: 'Bearer' }>('/v1/auth/otp/verify', {
      method: 'POST',
      body: { email, intent: 'LOGIN', code },
    })
    setSession({ accessToken: s.accessToken, expiresAt: s.expiresAt })
    return s
  },

  me: () => request<Account>('/v1/accounts/me', { auth: true }),

  logout: async () => {
    try {
      await request<null>('/v1/auth/logout', { method: 'POST', body: {}, auth: true })
    } finally {
      setSession(null)
    }
  },
}

/* ---------- stores & onboarding ---------- */

export interface Address {
  country: string
  region: string
  area: string
  street: string
  landmark: string
}
export type IdentityType = 'NIN' | 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'VOTER_ID' | 'OTHER'
export interface Identity {
  type: IdentityType
  number: string
}
export interface Bank {
  country: string
  bankName: string
  accountNumber: string
  accountName: string
}
export interface Onboarding {
  id: string
  storeName: string
  categoryIds: string[]
  businessAddress: Address
  status: 'DRAFT' | 'LIVE' | 'SUSPENDED'
  version: number
  liveAt: string | null
  verificationStatus: 'UNVERIFIED'
  identity?: Identity
  bank?: Bank
  selfieUrl?: string
  missingFields: string[]
}
export interface OnboardingDraft {
  storeName?: string
  categoryIds?: string[]
  businessAddress?: Address
  identity?: Identity
  bank?: Bank
  selfieUrl?: string
}
export interface Category {
  id: string
  name: string
}

export const stores = {
  /** null when the account has no store yet (the API answers 404). */
  onboarding: async () => {
    try {
      return await request<Onboarding>('/v1/stores/me/onboarding', { auth: true })
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  },
  saveDraft: (draft: OnboardingDraft, expectedVersion: number) =>
    request<Onboarding>('/v1/stores/me/onboarding', {
      method: 'POST',
      auth: true,
      body: { ...draft, status: 'DRAFT', expectedVersion },
    }),
  goLive: (full: Required<OnboardingDraft>, expectedVersion: number) =>
    request<Onboarding>('/v1/stores/me/onboarding', {
      method: 'POST',
      auth: true,
      body: { ...full, status: 'LIVE', expectedVersion },
    }),
  categories: async () => {
    const all: Category[] = []
    let cursor: string | null = null
    do {
      const page: { items: Category[]; nextCursor: string | null } = await request(
        `/v1/store-categories?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
      )
      all.push(...page.items)
      cursor = page.nextCursor
    } while (cursor)
    return all
  },
}

/* ---------- uploads ---------- */

export const uploads = {
  image: (file: File, purpose: 'SELFIE' | 'PRODUCT_IMAGE') => {
    const form = new FormData()
    form.append('file', file)
    form.append('purpose', purpose)
    return request<{ id: string; url: string; purpose: typeof purpose }>('/v1/uploads', {
      method: 'POST',
      form,
      auth: true,
    })
  },
}

/* ---------- products ---------- */

export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
export interface PickupHours {
  timezone: string
  days: { day: Weekday; intervals: { opens: string; closes: string }[] }[]
}
export interface ProductInput {
  id?: string
  productName?: string
  categoryId?: string
  description?: string
  price?: string
  currency?: 'NGN'
  soldAs?: string
  approximateWeightGrams?: number
  moq?: number
  images?: { url: string; isPrimary: boolean }[]
  availableQuantity?: number
  pickupLocation?: { type: 'BUSINESS' } | { type: 'CUSTOM'; address: Address }
  pickupHours?: PickupHours
  note?: string
  status: 'DRAFT' | 'PUBLISHED'
  expectedVersion: number
}
export interface Product extends Omit<ProductInput, 'expectedVersion' | 'id'> {
  id: string
  storeId: string
  sku: string
  version: number
  createdAt: string
  updatedAt: string
}

export const products = {
  save: (input: ProductInput) => request<Product>('/v1/products', { method: 'POST', auth: true, body: input }),
  mine: async (status?: 'DRAFT' | 'PUBLISHED') => {
    const all: Product[] = []
    let cursor: string | null = null
    try {
      do {
        const q = new URLSearchParams()
        q.set('limit', '50')
        if (status) q.set('status', status)
        if (cursor) q.set('cursor', cursor)
        const page: { items: Product[]; nextCursor: string | null } = await request(`/v1/products/me?${q}`, {
          auth: true,
        })
        all.push(...page.items)
        cursor = page.nextCursor
      } while (cursor)
    } catch (e) {
      // No store yet: the API says 404 rather than an empty list.
      if (!(e instanceof ApiError && e.status === 404)) throw e
    }
    return all
  },
  one: (id: string) => request<Product>(`/v1/products/${encodeURIComponent(id)}`),
  ofStore: (storeId: string) =>
    request<{ items: Product[]; nextCursor: string | null }>(
      `/v1/stores/${encodeURIComponent(storeId)}/products?limit=50`,
    ),
}

/** A sentence a person can act on, for any failure from the API or the network. */
export function describeError(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (e instanceof ApiError) {
    switch (e.code) {
      case 'code-invalid':
        return 'That code is invalid or has expired. Check it or request a new one.'
      case 'rate-limited':
        return e.retryAfter && e.retryAfter > 120
          ? 'Too many attempts. Please try again in a little while.'
          : 'Too many attempts. Please wait a minute and try again.'
      case 'session-invalid':
        return 'Please sign in again.'
    }
    if (e.status === 409 && e.type.includes('accounts'))
      return 'An account already exists for this email. Log in instead.'
    if (e.status === 409) return 'Someone else saved newer details. Reload and try again.'
    if (e.status === 400 && e.errors.length) return 'Some of those details are not quite right.'
    if (e.status === 413) return 'That is too large to send.'
    if (e.status >= 500 || e.status === 503) return 'Earth is catching its breath. Please try again in a minute.'
    return e.detail || e.title || fallback
  }
  if (e instanceof TypeError) return 'You seem to be offline. Check your connection and try again.'
  return fallback
}
