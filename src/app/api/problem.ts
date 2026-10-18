/** The API's problem+json body (RFC 9457) and the error shapes the app passes around. */
export interface Problem {
  type: string
  title: string
  status: number
  detail?: string
  correlationId?: string
  errors?: { path?: string; code?: string }[]
}

/** What RTK Query keeps in state for a failed call: plain data, so it serialises. */
export interface ApiProblem {
  status: number
  data: Partial<Problem> | null
  retryAfter?: number
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

const isProblem = (e: unknown): e is ApiProblem =>
  typeof e === 'object' && e !== null && 'status' in e && typeof (e as ApiProblem).status === 'number' && 'data' in e

/** Turns whatever a query or mutation rejected with into an ApiError (status 0 = no response). */
export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e
  if (isProblem(e)) return new ApiError(e.status, e.data ?? {}, e.retryAfter)
  if (typeof e === 'object' && e !== null && 'status' in e)
    return new ApiError(0, { title: 'Network error', detail: String((e as { error?: unknown }).error ?? '') })
  return new ApiError(0, { detail: e instanceof Error ? e.message : '' })
}

/** A sentence a person can act on, for any failure from the API or the network. */
export function describeError(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const err = toApiError(e)
  switch (err.code) {
    case 'code-invalid':
      return 'That code is invalid or has expired. Check it or request a new one.'
    case 'rate-limited':
      return err.retryAfter && err.retryAfter > 120
        ? 'Too many attempts. Please try again in a little while.'
        : 'Too many attempts. Please wait a minute and try again.'
    case 'session-invalid':
      return 'Please sign in again.'
  }
  if (err.status === 409 && err.type.includes('accounts')) return 'An account already exists for this email. Log in instead.'
  if (err.status === 409) return 'Someone else saved newer details. Reload and try again.'
  if (err.status === 400 && err.errors.length) return 'Some of those details are not quite right.'
  if (err.status === 401) return 'Please sign in again.'
  if (err.status === 403) return 'Your account cannot do that yet.'
  if (err.status === 413) return 'That is too large to send.'
  if (err.status === 0 && err.title === 'Network error') return 'We could not reach Earth. Check your connection and try again.'
  // The API names the dependency it could not reach (`banks/unavailable`, `shipping/unavailable`); say so, not just "trouble".
  if (err.status === 503 && err.type.includes('/banks/')) return 'Bank verification is briefly unavailable, so your bank account could not be confirmed. Your details are kept; try again in a little while.'
  if (err.status >= 500) return 'Earth is having trouble right now. Please try again shortly.'
  return err.detail || err.title || fallback
}
