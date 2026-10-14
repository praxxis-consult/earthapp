import { useEffect } from 'react'
import verifyIcon from '../../assets/icons/rc-verify.svg'
import importIcon from '../../assets/icons/rc-import.svg'
import arrowRight from '../../assets/icons/rc-arrow-right.svg'
import receiptText from '../../assets/icons/rc-receipt-text.svg'
import truckIcon from '../../assets/icons/rc-truck.svg'
import routingIcon from '../../assets/icons/rc-routing.svg'
import shieldIcon from '../../assets/icons/rc-shield-tick.svg'
import checkIcon from '../../assets/icons/rc-check.svg'
import questionIcon from '../../assets/icons/rc-message-question.svg'
import { naira } from '../../data/orders'
import { jakarta } from '../../utils/styles'

export interface ReceiptData {
  invoiceNumber: string
  receiptNumber: string
  paidAt: string
  amount: number
  product: { title: string; detail: string; image: string }
  paidWith: string
  reference: string
  deliveryTitle: string
  deliveryEta: string
  nextSteps: string[]
}

interface ReceiptModalProps {
  receipt: ReceiptData
  onViewOrder: () => void
  onTrack?: () => void
  onClose: () => void
}

/**
 * Figma "Payment receipt" (588:6216): 544 wide, radius 24, 1px #e4dede, 24px padding, 18px gaps:
 * header with the PAID chip, the tinted amount block, Download / View order, the receipt card,
 * the delivery status strip and the buyer-protection panel.
 */
export default function ReceiptModal({ receipt: r, onViewOrder, onTrack, onClose }: ReceiptModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const row = (label: string, value: string, green?: boolean) => (
    <div key={label} className="flex items-baseline justify-between">
      <span className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
        {label}
      </span>
      <span className="text-[12px] leading-[15px]" style={{ ...jakarta(600), color: green ? '#007c53' : '#101604' }}>
        {value}
      </span>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-[16px]" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
        className="my-auto flex w-[544px] max-w-full flex-col gap-[18px] rounded-[24px] border border-[#e4dede] bg-white p-[24px] max-md:p-[16px]"
        style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-[5px]">
            <h2 id="receipt-title" className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
              Payment successful
            </h2>
            <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
              Invoice #{r.invoiceNumber} · Paid {r.paidAt}
            </p>
          </div>
          <span className="flex h-[24px] items-center gap-[4px] rounded-[30px] bg-[#aee74a] px-[8px] text-[#0c2310] text-[11px] leading-[14px]" style={jakarta(600)}>
            <img src={verifyIcon} alt="" className="size-[16px]" />
            PAID
          </span>
        </div>

        <div className="flex items-center gap-[14px] rounded-[16px] p-[18px]" style={{ background: 'rgba(0,124,83,0.05)' }}>
          <span className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-white">
            <img src={verifyIcon} alt="" className="size-[32px]" />
          </span>
          <div className="flex flex-col gap-[4px]">
            <p className="text-[#007c53] text-[11px] leading-[14px]" style={jakarta(500)}>
              Amount Paid
            </p>
            <p className="text-[#101604] text-[28px] leading-[35px]" style={jakarta(700)}>
              {naira(r.amount).replace(/\.00$/, '')}
            </p>
            <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
              Your payment is confirmed and the seller has been notified.
            </p>
          </div>
        </div>

        <div className="flex gap-[10px]">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-[46px] flex-1 items-center justify-center gap-[8px] rounded-[30px] border border-[#007c53] bg-white px-[16px] text-[#007c53] text-[12px] leading-[15px]"
            style={jakarta(600)}
          >
            <img src={importIcon} alt="" className="size-[16px]" />
            Download receipt
          </button>
          <button
            type="button"
            onClick={onViewOrder}
            className="flex h-[46px] flex-1 items-center justify-between rounded-[30px] bg-[#007c53] px-[16px] text-white text-[12px] leading-[15px]"
            style={{ ...jakarta(600), boxShadow: '0 6px 18px rgba(0,124,83,0.25)' }}
          >
            View order
            <img src={arrowRight} alt="" className="size-[16px]" />
          </button>
        </div>

        <div className="overflow-hidden rounded-[16px] border border-[#f7f7f7]">
          <div className="flex h-[40px] items-center justify-between bg-[#f7f7f7] px-[14px]">
            <span className="flex items-center gap-[8px] text-[#101604] text-[12px] leading-[15px]" style={jakarta(600)}>
              <img src={receiptText} alt="" className="size-[16px]" />
              Receipt details
            </span>
            <span className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(600)}>
              #{r.receiptNumber}
            </span>
          </div>
          <div className="flex items-center gap-[12px] p-[14px]">
            <img src={r.product.image} alt="" className="size-[58px] rounded-[10px] object-cover" />
            <div className="flex flex-1 flex-col gap-[3px] min-w-0">
              <p className="text-[#101604] text-[13px] leading-[16px] truncate" style={jakarta(700)}>
                {r.product.title}
              </p>
              <p className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(400)}>
                {r.product.detail}
              </p>
            </div>
            <p className="text-[#101604] text-[13px] leading-[16px]" style={jakarta(700)}>
              {naira(r.amount).replace(/\.00$/, '')}
            </p>
          </div>
          <div className="flex flex-col gap-[12px] px-[14px] pb-[14px]">
            <div className="h-px w-full bg-[#f7f7f7]" />
            {row('Invoice', `#${r.invoiceNumber}`)}
            {row('Paid with', r.paidWith)}
            {row('Transaction reference', r.reference)}
            {row('Payment status', 'Successful', true)}
          </div>
        </div>

        <div className="flex items-center gap-[12px] rounded-[12px] p-[14px]" style={{ background: 'rgba(0,124,83,0.05)' }}>
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-white">
            <img src={truckIcon} alt="" className="size-[16px]" />
          </span>
          <div className="flex flex-1 flex-col gap-[3px] min-w-0">
            <p className="text-[#101604] text-[12px] leading-[15px]" style={jakarta(600)}>
              {r.deliveryTitle}
            </p>
            <p className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(400)}>
              {r.deliveryEta}
            </p>
          </div>
          {onTrack && (
            <button type="button" onClick={onTrack} className="flex items-center gap-[8px] text-[#007c53] text-[12px] leading-[24px]" style={jakarta(500)}>
              <img src={routingIcon} alt="" className="size-[16px]" />
              Track delivery
            </button>
          )}
        </div>

        <div className="flex flex-col gap-[16px] rounded-[12px] bg-[#f7f7f7] p-[16px]">
          <div className="flex items-center gap-[10px]">
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(0,124,83,0.05)' }}>
              <img src={shieldIcon} alt="" className="size-[16px]" />
            </span>
            <div className="flex flex-col gap-[2px]">
              <p className="text-[#101604] text-[12px] leading-[15px]" style={jakarta(700)}>
                Protected marketplace payment
              </p>
              <p className="text-[#807e7e] text-[10px] leading-[15px]" style={jakarta(400)}>
                Your funds stay protected until you confirm delivery.
              </p>
            </div>
          </div>
          <div className="flex gap-[8px]">
            {['Payment secured', '48-hour issue support'].map((b) => (
              <span key={b} className="flex items-center gap-[5px] rounded-full bg-white px-[8px] py-[6px] text-[#101604] text-[10px] leading-[13px]" style={jakarta(500)}>
                <img src={checkIcon} alt="" className="size-[11px]" />
                {b}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-[8px]">
            <p className="text-[#807e7e] text-[10px] leading-[13px]" style={jakarta(700)}>
              What happens next
            </p>
            {r.nextSteps.map((s, i) => (
              <div key={s} className="flex items-center gap-[8px]">
                <span className="flex size-[18px] items-center justify-center rounded-full text-[#007c53] text-[9px] leading-[11px]" style={{ ...jakarta(700), background: 'rgba(0,124,83,0.05)' }}>
                  {i + 1}
                </span>
                <p className="text-[#101604] text-[10px] leading-[13px]" style={jakarta(400)}>
                  {s}
                </p>
              </div>
            ))}
          </div>
          <a href="mailto:support@earth.example" className="flex items-center gap-[8px] text-[#007c53] text-[12px] leading-[15px]" style={jakarta(600)}>
            <img src={questionIcon} alt="" className="size-[20px]" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
