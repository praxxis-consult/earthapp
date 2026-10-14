import { useEffect, type ReactNode } from 'react'
import badge from '../../assets/icons/onboarding-badge.svg'
import infoAmber from '../../assets/icons/info-amber.svg'
import infoRed from '../../assets/icons/info-red.svg'
import GradientButton from './GradientButton'
import { jakarta } from '../../utils/styles'

const ICONS = { success: badge, warning: infoAmber, danger: infoRed }

interface Action {
  label: ReactNode
  onClick: () => void
}

interface SuccessModalProps {
  /** "failed-glow" badge (160) for success; the 127px "information" mark in amber or red otherwise. */
  icon?: keyof typeof ICONS
  title: string
  body: ReactNode
  primary: Action
  /** The second, #f7f7f7 button (Copy link, Back to products, No, cancel). */
  secondary?: Action
  /** Red primary for destructive confirmations (476:16119, 649:27395). */
  destructive?: boolean
  onClose: () => void
  labelledBy?: string
}

/**
 * Figma "success" / "warning" (394:3265, 429:4719, 687:8900, 689:8948, 476:16119 …): 580 wide,
 * radius 24, 24px padding; the icon, then the centred title (24/32) and body (16/28) 24px below,
 * then the buttons 40px below, 16px apart. The frames have no close icon; the backdrop and
 * Escape dismiss.
 */
export default function SuccessModal({
  icon = 'success',
  title,
  body,
  primary,
  secondary,
  destructive,
  onClose,
  labelledBy = 'success-modal-title',
}: SuccessModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-[16px]"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="flex w-[580px] max-w-full flex-col gap-[40px] rounded-[24px] bg-white p-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-[24px]">
          {icon === 'success' ? (
            <img src={badge} alt="" className="size-[160px]" />
          ) : (
            <span className="flex h-[160px] items-center justify-center">
              <img src={ICONS[icon]} alt="" className="size-[127px]" />
            </span>
          )}
          <div className="flex flex-col items-center gap-[8px] text-center">
            <h2 id={labelledBy} className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
              {title}
            </h2>
            <p className="text-[#807e7e] text-[16px] leading-[28px]" style={jakarta(400)}>
              {body}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-[16px]">
          {destructive ? (
            <button
              type="button"
              onClick={primary.onClick}
              className="flex h-[48px] items-center justify-center rounded-[30px] bg-[#d80027] px-[24px] text-white text-[14px] leading-[18px]"
              style={jakarta(500)}
            >
              {primary.label}
            </button>
          ) : (
            <GradientButton onClick={primary.onClick} className="w-full">
              {primary.label}
            </GradientButton>
          )}
          {secondary && (
            <button
              type="button"
              onClick={secondary.onClick}
              className="flex h-[48px] items-center justify-center gap-[8px] rounded-[30px] bg-[#f7f7f7] px-[24px] text-[#101604] text-[14px] leading-[18px]"
              style={jakarta(500)}
            >
              {secondary.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
