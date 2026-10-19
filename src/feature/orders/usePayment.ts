import { useCallback, useRef, useState } from 'react'
import { useLazyGetPaymentQuery, useStartPaymentMutation } from './ordersApiSlice'
import { toApiError } from '../../services/earthApi'

export type PaymentPhase = { phase: 'idle' } | { phase: 'preparing'; orderId: string } | { phase: 'redirecting' } | { phase: 'error'; message: string }

/** Where Paystack sends the buyer back: this app's own return page, with the order to confirm. */
export const paymentReturnUrl = (orderId: string): string => `${window.location.origin}/payment-return?orderId=${encodeURIComponent(orderId)}`

const POLL_MS = 2000
const WAIT_MS = 90_000

/**
 * Takes a created order to the hosted Paystack page: `POST /orders/{id}/payment` answers 202
 * while a worker prepares the checkout, and `GET` on the same path carries `authorizationUrl`
 * once it is ready. The wait is bounded; PREPARING with nothing after that, or NEEDS_ATTENTION,
 * is reported rather than retried forever. The callback is fixed on the first call, so a
 * second attempt for the same order reuses it.
 */
export function usePayment() {
  const [start] = useStartPaymentMutation()
  const [getPayment] = useLazyGetPaymentQuery()
  const [state, setState] = useState<PaymentPhase>({ phase: 'idle' })
  const active = useRef(0)

  const pay = useCallback(
    async (orderId: string) => {
      const run = ++active.current
      setState({ phase: 'preparing', orderId })
      const go = (url: string) => {
        setState({ phase: 'redirecting' })
        window.location.assign(url)
      }
      try {
        const first = await start({ id: orderId, callbackUrl: paymentReturnUrl(orderId) }).unwrap()
        if (first?.authorizationUrl) return go(first.authorizationUrl)
      } catch (e) {
        const problem = toApiError(e)
        // 409: the checkout was already prepared for this order; its link is read below.
        if (problem.status !== 409) return setState({ phase: 'error', message: describe(problem.status, problem.message) })
      }
      const until = Date.now() + WAIT_MS
      while (Date.now() < until) {
        if (run !== active.current) return
        try {
          const status = await getPayment(orderId, false).unwrap()
          if (status.authorizationUrl) return go(status.authorizationUrl)
          if (String(status.status).toUpperCase() === 'NEEDS_ATTENTION')
            return setState({ phase: 'error', message: 'This payment needs attention from Earth before it can go ahead. Please message support with your order number.' })
        } catch (e) {
          const problem = toApiError(e)
          if (problem.status !== 404 && problem.status !== 409) return setState({ phase: 'error', message: describe(problem.status, problem.message) })
        }
        await new Promise((r) => setTimeout(r, POLL_MS))
      }
      setState({ phase: 'error', message: 'The payment page is taking longer than usual to prepare. Try again in a moment; your order is kept.' })
    },
    [start, getPayment],
  )

  const reset = useCallback(() => {
    active.current++
    setState({ phase: 'idle' })
  }, [])

  return { state, pay, reset }
}

function describe(status: number, message: string): string {
  if (status === 409) return 'This order no longer accepts payment. Place it again from the listing.'
  if (status === 503) return 'Payments are briefly unavailable. Try again in a moment.'
  return message || 'The payment could not be started.'
}
