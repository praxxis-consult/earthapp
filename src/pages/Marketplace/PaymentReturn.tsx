import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import PaymentSuccessModal from '../../components/ui/PaymentSuccessModal'
import badge from '../../assets/icons/onboarding-badge.svg'
import { useConfirmPaymentMutation } from '../../feature/orders/ordersApiSlice'
import { useConfirmCheckoutPaymentMutation, useLazyGetCheckoutQuery, type Checkout } from '../../feature/checkout/checkoutApiSlice'
import { checkoutProblem, resolveCheckoutId } from '../../feature/checkout/useCheckout'
import { useSaveCartMutation } from '../../feature/cart/cartApiSlice'
import { confirmOutcome } from '../../data/orderFlow'
import { describeError, toApiError } from '../../services/earthApi'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

const CHECKOUT_WAIT_MS = 60_000
const POLL_MS = 2000

/**
 * Where Paystack sends the buyer back: `/payment-return?orderId=` for one order, or
 * `?checkoutId=` for a combined payment (25 October). Nothing in the URL is trusted: the page asks
 * the API to confirm the payment with Paystack (`POST /orders/{id}/payment/confirm`, or
 * `POST /checkouts/{id}/payment/confirm` and then the checkout read back until it is PAID) and
 * shows what it found. A 409 means "not verified yet", so the buyer can check again. Once a
 * combined payment is verified the cart it froze is emptied (under the cart version the checkout
 * took; a cart changed since is left alone).
 */
export default function PaymentReturn() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const orderId = params.get('orderId') ?? ''
  // A combined payment comes back with the client id we sent and the reference Paystack appends; the API's id is read from those.
  const clientCheckoutId = params.get('checkoutId') ?? ''
  const checkoutId = clientCheckoutId ? resolveCheckoutId(clientCheckoutId, params.get('reference') ?? params.get('trxref') ?? '') : ''
  const [confirm, { isLoading: confirmingOrder }] = useConfirmPaymentMutation()
  const [confirmCheckout, { isLoading: confirmingCheckout }] = useConfirmCheckoutPaymentMutation()
  const [readCheckout] = useLazyGetCheckoutQuery()
  const [saveCart] = useSaveCartMutation()
  const [polling, setPolling] = useState(false)
  const isLoading = confirmingOrder || confirmingCheckout || polling
  const [result, setResult] = useState<{ paid: boolean; title: string; body: string } | null>(null)
  const ran = useRef('')

  async function checkCheckout() {
    try {
      let c: Checkout = await confirmCheckout(checkoutId).unwrap()
      setPolling(true)
      const until = Date.now() + CHECKOUT_WAIT_MS
      while (c.status !== 'PAID' && c.paymentStatus !== 'VERIFIED' && !['CANCELLED', 'NEEDS_ATTENTION'].includes(c.status) && Date.now() < until) {
        await new Promise((r) => setTimeout(r, POLL_MS))
        c = await readCheckout(checkoutId, false).unwrap()
      }
      setPolling(false)
      const n = c.orders.filter((o) => o.orderId).length
      if (c.paymentStatus === 'VERIFIED' || c.status === 'PAID') {
        setResult({ paid: true, title: 'Payment successful', body: `Your payment is verified and ${n === 1 ? 'your order is' : `your ${n} orders are`} with the ${n === 1 ? 'seller' : 'sellers'}. Each one accepts and prepares its own order; follow them under My orders.` })
        // The cart the checkout froze is done with; a cart changed since keeps its lines (409 is left alone).
        saveCart({ expectedVersion: c.cartVersion, items: [] }).unwrap().catch(() => {})
      } else if (c.status === 'CANCELLED') setResult({ paid: false, title: 'This checkout was cancelled', body: checkoutProblem(c.problemType) })
      else if (c.status === 'NEEDS_ATTENTION') setResult({ paid: false, title: 'Needs attention', body: `This payment needs attention from Earth. Please message support with the reference ${c.reference}.` })
      else setResult({ paid: false, title: 'Not confirmed yet', body: 'Paystack has not confirmed this payment. If you paid, give it a moment and check again.' })
    } catch (e) {
      setPolling(false)
      const problem = toApiError(e)
      setResult(
        problem.status === 409
          ? { paid: false, title: 'Not confirmed yet', body: `${problem.detail || 'Paystack has not confirmed this payment.'} If you paid, give it a moment and check again.` }
          : { paid: false, title: 'We could not check the payment', body: describeError(e) },
      )
    }
  }

  async function check() {
    if (checkoutId) return checkCheckout()
    if (!orderId) return
    try {
      setResult(confirmOutcome(await confirm(orderId).unwrap()))
    } catch (e) {
      const problem = toApiError(e)
      setResult(
        problem.status === 409
          ? { paid: false, title: 'Not confirmed yet', body: `${problem.detail || 'Paystack has not confirmed this payment.'} If you paid, give it a moment and check again.` }
          : { paid: false, title: 'We could not check the payment', body: describeError(e) },
      )
    }
  }

  const key = checkoutId || orderId
  const unmatched = Boolean(clientCheckoutId) && !checkoutId
  useEffect(() => {
    if (!key || ran.current === key) return
    ran.current = key
    void check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const view = unmatched
    ? { paid: false, title: 'We could not match this payment', body: 'This device has no record of the checkout and the payment reference did not come back with you. If you paid, your orders are under My orders with their payment state.' }
    : !key
      ? { paid: false, title: 'No order to confirm', body: 'This page expects to be opened from a payment. Your orders are under My orders.' }
      : result

  // A confirmed payment shows the "Payment successful" card (828:28307) over the dashboard; the other outcomes keep the page below.
  if (key && view?.paid)
    return (
      <DashboardLayout>
        {checkoutId ? <PaymentSuccessModal followTo="/dashboard/purchases" followLabel="Follow my orders" body={view.body} /> : <PaymentSuccessModal orderId={orderId} body={view.body} />}
      </DashboardLayout>
    )

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[40px] flex justify-center max-md:px-[16px] max-md:pt-[24px]">
        <section className="bg-white rounded-[24px] p-[24px] w-full max-w-[580px] flex flex-col items-center gap-[40px] max-md:gap-[24px] max-md:p-[16px]" aria-busy={isLoading || (!view && Boolean(key))}>
          <div className="flex flex-col items-center gap-[24px] w-full">
            <img src={badge} alt="" className="size-[160px]" style={{ opacity: view?.paid ? 1 : 0.5 }} />
            <div className="flex flex-col items-center gap-[8px] text-center w-full">
              <p className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
                {view ? view.title : 'Checking your payment…'}
              </p>
              <p className="text-[#807e7e] text-[16px] leading-[28px]" style={jakarta(400)}>
                {view ? view.body : 'Paystack is asked whether the payment went through. This takes a moment.'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-[16px] w-full">
            {key && view && !view.paid && (
              <button type="button" onClick={check} disabled={isLoading} className="flex h-[48px] w-full items-center justify-center rounded-[30px] border border-[#789ebb] disabled:opacity-70" style={{ backgroundImage: CTA_BG }}>
                <span className="text-[14px] leading-[18px] bg-clip-text text-transparent" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
                  {isLoading ? 'Checking…' : 'Check again'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(orderId ? `/dashboard/purchases/${encodeURIComponent(orderId)}` : '/dashboard/purchases')}
              className={`flex h-[48px] w-full items-center justify-center rounded-[30px] ${view?.paid ? 'border border-[#789ebb]' : 'bg-[#f7f7f7]'}`}
              style={view?.paid ? { backgroundImage: CTA_BG } : undefined}
            >
              <span className={`text-[14px] leading-[18px] ${view?.paid ? 'bg-clip-text text-transparent' : 'text-[#101604]'}`} style={{ ...jakarta(500), ...(view?.paid ? { backgroundImage: CTA_TEXT_BG } : {}) }}>
                {orderId ? 'View order' : 'My orders'}
              </span>
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
