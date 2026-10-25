import { useCallback, useRef, useState } from 'react'
import { useCreateCheckoutMutation, useLazyGetCheckoutQuery, useStartCheckoutPaymentMutation, type Checkout, type CheckoutStore } from './checkoutApiSlice'
import { toApiError } from '../../services/earthApi'
import { purchaseRule, purchaseRuleMessage, type ProductNamer } from '../../lib/purchaseRule'

export type CheckoutPhase = { phase: 'idle' } | { phase: 'preparing' } | { phase: 'paying' } | { phase: 'redirecting' } | { phase: 'error'; message: string }

/**
 * Where Paystack sends the buyer back after a combined payment: this app's return page. The
 * callback is fixed when the checkout is created, before the API has given it an id, so it carries
 * the client id; Paystack appends the payment `reference`, which ends in the API's checkout id.
 */
export const checkoutReturnUrl = (clientCheckoutId: string): string => `${window.location.origin}/payment-return?checkoutId=${encodeURIComponent(clientCheckoutId)}`

const MAP_KEY = (clientId: string) => `earth.checkout.${clientId}`
const UUID_AT_END = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** The API's checkout id for a return: from the payment reference Paystack appended (it ends in the id), else what this browser noted when it created the checkout. */
export function resolveCheckoutId(clientId: string, reference: string): string {
  const m = reference.match(UUID_AT_END)
  if (m) return m[0]
  try {
    return localStorage.getItem(MAP_KEY(clientId)) ?? ''
  } catch {
    return ''
  }
}

const POLL_MS = 2000
const READY_WAIT_MS = 90_000
const LINK_WAIT_MS = 90_000

/** What a cancelled checkout means to the buyer: the rule and product its `failure` names when it has one, else its `problemType`. */
export function checkoutProblem(checkout: Pick<Checkout, 'problemType'> & Partial<Pick<Checkout, 'failure'>>, nameOf?: ProductNamer): string {
  const rule = purchaseRule(checkout.failure)
  if (rule) return purchaseRuleMessage(rule, nameOf)
  const type = checkout.problemType
  if (type === 'financial/invalid') return 'One of these orders is more than its seller can take in a single order right now. Order less from that store, or split it into smaller orders.'
  if (type === 'orders/state-conflict') return 'Something in the cart changed just now: stock, a price or a minimum quantity. Check the lines and try again.'
  return `This checkout could not be prepared${type ? ` (${type})` : ''}. Try again in a moment.`
}

/**
 * Takes a cart to the single hosted payment: create the checkout, wait for the worker to prepare
 * every store (READY), ask for the payment and wait for its link, then leave for Paystack. Both
 * waits are bounded; a cancellation names its reason and NEEDS_ATTENTION is reported, never
 * retried forever. The client checkout id is kept per attempt so a retry of the same body is
 * exactly that, not a second checkout.
 */
export function useCheckout(nameOf?: ProductNamer) {
  const [create] = useCreateCheckoutMutation()
  const [startPayment] = useStartCheckoutPaymentMutation()
  const [read] = useLazyGetCheckoutQuery()
  const [state, setState] = useState<CheckoutPhase>({ phase: 'idle' })
  const active = useRef(0)

  const place = useCallback(
    async (cartVersion: number, stores: CheckoutStore[], clientCheckoutId: string): Promise<void> => {
      const run = ++active.current
      const fail = (message: string) => setState({ phase: 'error', message })
      setState({ phase: 'preparing' })
      let checkout: Checkout
      try {
        checkout = await create({ clientCheckoutId, cartVersion, stores, callbackUrl: checkoutReturnUrl(clientCheckoutId) }).unwrap()
      } catch (e) {
        const problem = toApiError(e)
        return fail(problem.status === 409 ? 'The cart changed since this page loaded. Reload it and try again.' : problem.status === 503 ? 'Checkout is briefly unavailable. Try again in a moment.' : problem.message || 'The checkout could not be started.')
      }
      const id = checkout.id
      // The return page gets the client id back; note the API's id against it for the browser that comes back.
      try {
        localStorage.setItem(MAP_KEY(clientCheckoutId), id)
      } catch {
        /* storage blocked: the reference Paystack appends still names it */
      }
      const until = Date.now() + READY_WAIT_MS
      while (checkout.status === 'PREPARING' && Date.now() < until) {
        await new Promise((r) => setTimeout(r, POLL_MS))
        if (run !== active.current) return
        checkout = await read(id, false).unwrap()
      }
      if (checkout.status === 'CANCELLED' || checkout.status === 'CANCELLING') return fail(checkoutProblem(checkout, nameOf))
      if (checkout.status === 'NEEDS_ATTENTION') return fail('This checkout needs attention from Earth before it can go ahead. Please message support with the reference ' + checkout.reference + '.')
      if (checkout.status === 'PREPARING') return fail('The sellers’ stock is taking longer than usual to reserve. Try again in a moment; nothing was charged.')
      setState({ phase: 'paying' })
      if (!checkout.authorizationUrl) {
        try {
          checkout = await startPayment(id).unwrap()
        } catch (e) {
          const problem = toApiError(e)
          if (problem.status !== 409) return fail(problem.status === 503 ? 'Payments are briefly unavailable. Try again in a moment.' : problem.message || 'The payment could not be started.')
        }
      }
      const linkUntil = Date.now() + LINK_WAIT_MS
      while (!checkout.authorizationUrl && Date.now() < linkUntil) {
        if (checkout.status === 'CANCELLED' || checkout.status === 'CANCELLING') return fail(checkoutProblem(checkout, nameOf))
        if (checkout.status === 'NEEDS_ATTENTION') return fail('This payment needs attention from Earth before it can go ahead. Please message support with the reference ' + checkout.reference + '.')
        await new Promise((r) => setTimeout(r, POLL_MS))
        if (run !== active.current) return
        checkout = await read(id, false).unwrap()
      }
      if (!checkout.authorizationUrl) return fail('The payment page is taking longer than usual to prepare. Try again in a moment; your orders are kept under My orders.')
      setState({ phase: 'redirecting' })
      window.location.assign(checkout.authorizationUrl)
    },
    [create, startPayment, read, nameOf],
  )

  const reset = useCallback(() => {
    active.current++
    setState({ phase: 'idle' })
  }, [])

  return { state, place, reset }
}
