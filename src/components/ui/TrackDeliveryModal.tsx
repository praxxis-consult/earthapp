import { useEffect, useState } from 'react'
import closeIcon from '../../assets/icons/td-close.svg'
import callIcon from '../../assets/icons/td-call.svg'
import tickDone from '../../assets/icons/td-tick-done.svg'
import tickPending from '../../assets/icons/td-tick-pending.svg'
import infoIcon from '../../assets/icons/td-info-circle.svg'
import chevronDown from '../../assets/icons/td-chevron-down.svg'
import truckIcon from '../../assets/icons/td-truck-14.svg'
import { initials } from '../../data/orders'
import { jakarta } from '../../utils/styles'

export interface TrackingStep {
  title: string
  detail: string
  /** "08:13 AM", or null when it has not happened yet. */
  at: string | null
}

interface TrackDeliveryModalProps {
  orderId: string
  rider: { name: string; vehicle: string }
  pickup: string
  dropoff: string
  /** 0–1 along the route. */
  progress: number
  steps: TrackingStep[]
  onClose: () => void
}

/**
 * Figma "Pickup details" track delivery (639:22820, collapsed 639:24288): 648 wide, radius 20,
 * 24px padding; the rider row (48px initials disc, name 16/24, vehicle 11/13.86, 48px call
 * button), a divider, the route bar (458×5 #007c53 at 5% with the lime 24px truck marker), then
 * "Delivery timeline" with a chevron that folds the five 37px rows, and the partner note.
 */
export default function TrackDeliveryModal({ orderId, rider, pickup, dropoff, progress, steps, onClose }: TrackDeliveryModalProps) {
  const [open, setOpen] = useState(true)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="track-title"
        className="relative w-[648px] max-w-full rounded-[20px] bg-white p-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-[24px] top-[24px] size-[24px]">
          <img src={closeIcon} alt="" className="size-[24px]" />
        </button>
        <div className="flex flex-col gap-[3px] max-w-[310px]">
          <h2 id="track-title" className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
            Track delivery
          </h2>
          <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
            Order {orderId}
          </p>
        </div>

        <div className="mt-[24px] flex flex-col gap-[24px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[16px]">
              <span className="flex size-[48px] items-center justify-center rounded-full bg-[#f2f8f6] text-[#007c53] text-[16px] leading-[20px]" style={jakarta(700)}>
                {initials(rider.name)}
              </span>
              <div className="flex flex-col gap-[4px]">
                <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
                  {rider.name}
                </p>
                <p className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(400)}>
                  {rider.vehicle}
                </p>
              </div>
            </div>
            <a
              href={`tel:${rider.name.replace(/\s+/g, '')}`}
              aria-label={`Call ${rider.name}`}
              title="The rider's number comes with the logistics API"
              className="flex size-[48px] items-center justify-center rounded-[30px] bg-[#f7f7f7]"
              onClick={(e) => e.preventDefault()}
            >
              <img src={callIcon} alt="" className="size-[20px]" />
            </a>
          </div>
          <div className="h-px w-full bg-[#f7f7f7]" />
          <div className="flex items-center gap-[16px]">
            <div className="flex flex-col gap-[4px] shrink-0">
              <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(600)}>
                {pickup}
              </p>
              <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                Pick-up
              </p>
            </div>
            <div className="relative flex-1 h-[24px]">
              <div className="absolute left-0 right-0 top-[10px] h-[5px] rounded-[50px]" style={{ background: 'rgba(0,124,83,0.05)' }}>
                <div className="h-full rounded-[50px] bg-[#007c53]" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <span
                className="absolute top-0 flex size-[24px] -translate-x-1/2 items-center justify-center rounded-full bg-[#aee74a] border-2 border-[#f7f7f7]"
                style={{ left: `${Math.round(progress * 100)}%`, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
              >
                <img src={truckIcon} alt="" className="size-[14px]" />
              </span>
            </div>
            <div className="flex flex-col items-end gap-[4px] shrink-0 text-right">
              <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(600)}>
                {dropoff}
              </p>
              <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                Drop-off
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-[40px] flex w-full items-center justify-between"
        >
          <span className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
            Delivery timeline
          </span>
          <img src={chevronDown} alt="" className="size-[24px] transition-transform" style={{ transform: open ? 'none' : 'rotate(-90deg)' }} />
        </button>

        {open && (
          <>
            <ol className="mt-[16px] flex flex-col gap-[24px]">
              {steps.map((s) => (
                <li key={s.title} className="flex items-center justify-between">
                  <div className="flex items-center gap-[16px]">
                    <img src={s.at ? tickDone : tickPending} alt={s.at ? 'Done' : 'Not yet'} className="size-[24px]" />
                    <div className="flex flex-col gap-[4px]">
                      <p className="text-[#101604] text-[14px] leading-[18px]" style={jakarta(600)}>
                        {s.title}
                      </p>
                      <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                        {s.detail}
                      </p>
                    </div>
                  </div>
                  <span className="text-[#807e7e] text-[12px] leading-[15px] text-right" style={jakarta(400)}>
                    {s.at ?? 'Not yet'}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-[24px] flex items-center gap-[8px]">
              <img src={infoIcon} alt="" className="size-[20px]" />
              <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                This update is coming directly from our logistics partner.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
