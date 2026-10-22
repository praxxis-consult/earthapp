import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import glow from '../../assets/icons/bm-paid-glow.svg'
import { jakarta } from '../../utils/styles'

interface PaymentSuccessModalProps {
  orderId: string
  /** What the API said about the order once the payment was confirmed. */
  body?: string
}

/**
 * "Payment successful" (828:28307): a 580×480 card, radius 24, 24 padding; the 160px badge, the
 * 24/32 title and 16/28 copy 8 apart (24 below the badge), then the two 48px buttons 16 apart,
 * 40 below the copy. The frame's close glyph is hidden, so the two buttons (and Escape, which
 * follows the order) are the ways on.
 */
export default function PaymentSuccessModal({ orderId, body }: PaymentSuccessModalProps) {
  const navigate = useNavigate()
  const follow = () => navigate(`/dashboard/purchases/${encodeURIComponent(orderId)}`)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') follow()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div role="dialog" aria-modal="true" aria-labelledby="paid-title" className="bg-white w-[580px] max-w-full rounded-[24px] p-[24px] flex flex-col gap-[40px] max-md:gap-[24px]">
        <div className="flex flex-col items-center gap-[24px]">
          <img src={glow} alt="" className="size-[160px]" />
          <div className="flex flex-col items-center gap-[8px] text-center">
            <h2 id="paid-title" className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
              Payment successful
            </h2>
            <p className="min-h-[56px] text-[#807e7e] text-[16px] leading-[28px]" style={jakarta(400)}>
              {body || 'Your order has been placed successfully. We’ve sent a confirmation email with your order details.'}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-[16px]">
          {/* 828:28315: the gradient sits under a solid #007c53, so the button reads green */}
          <button type="button" onClick={follow} autoFocus className="flex h-[48px] w-full items-center justify-center rounded-[30px] bg-[#007c53] px-[24px]">
            <span className="text-white text-[14px] leading-[18px]" style={jakarta(500)}>
              Follow my order
            </span>
          </button>
          <button type="button" onClick={() => navigate('/dashboard/marketplace')} className="flex h-[48px] w-full items-center justify-center rounded-[30px] bg-[#f7f7f7] px-[24px]">
            <span className="text-[#101604] text-[14px] leading-[18px]" style={jakarta(500)}>
              Go to marketplace
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
