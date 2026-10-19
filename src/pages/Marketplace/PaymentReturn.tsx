import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import badge from '../../assets/icons/onboarding-badge.svg'
import { useConfirmPaymentMutation } from '../../feature/orders/ordersApiSlice'
import { confirmOutcome } from '../../data/orderFlow'
import { describeError, toApiError } from '../../services/earthApi'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

/**
 * Where Paystack sends the buyer back (`/payment-return?orderId=`). Nothing in the URL is trusted:
 * the page asks the API to confirm the payment with Paystack (`POST /orders/{id}/payment/confirm`)
 * and shows what it found. A 409 means "not verified yet", so the buyer can check again.
 */
export default function PaymentReturn() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const orderId = params.get('orderId') ?? ''
  const [confirm, { isLoading }] = useConfirmPaymentMutation()
  const [result, setResult] = useState<{ paid: boolean; title: string; body: string } | null>(null)
  const ran = useRef('')

  async function check() {
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

  useEffect(() => {
    if (!orderId || ran.current === orderId) return
    ran.current = orderId
    void check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const view = !orderId ? { paid: false, title: 'No order to confirm', body: 'This page expects to be opened from a payment. Your orders are under My orders.' } : result

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[40px] flex justify-center max-md:px-[16px] max-md:pt-[24px]">
        <section className="bg-white rounded-[24px] p-[24px] w-full max-w-[580px] flex flex-col items-center gap-[40px] max-md:gap-[24px] max-md:p-[16px]" aria-busy={isLoading || (!view && Boolean(orderId))}>
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
            {orderId && view && !view.paid && (
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
