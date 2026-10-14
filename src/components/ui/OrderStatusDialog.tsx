import { useEffect, useRef, useState } from 'react'
import badge from '../../assets/icons/onboarding-badge.svg'
import closeIcon from '../../assets/icons/od-close-circle.svg'
import uploadIcon from '../../assets/icons/od-document-upload.svg'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

type Kind = 'evidence' | 'ready' | 'dispatched' | 'decline'

interface OrderStatusDialogProps {
  kind: Kind
  onClose: () => void
  onConfirm: () => void
}

const SUCCESS: Record<'ready' | 'dispatched', { title: string; body: string }> = {
  ready: {
    title: 'Ready for pickup',
    body: "Dispatch has been notified and is on the way to collect the package. Make sure it's packed and ready for handover.",
  },
  dispatched: {
    title: 'Package on its way',
    body: 'The order status has been successfully updated. You will be notified once the delivery is complete and the buyer receives their items.',
  },
}

/**
 * The dialogs the order page opens. "evidence" is Figma "Pickup details / Confirm Order Status"
 * (581:8392): 648 wide, a photo drop zone, Mark as ready. "ready" and "dispatched" are the
 * 580-wide "success" frames (581:8645, 581:9220). "decline" has no frame in the file; it reuses
 * the success frame's shape so the seller confirms before an order is refused.
 */
export default function OrderStatusDialog({ kind, onClose, onConfirm }: OrderStatusDialogProps) {
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function pick(file: File | undefined) {
    if (!file) return
    if (!/^image\/(jpeg|png)$/.test(file.type)) return setError('Use a JPEG or PNG photo.')
    setError('')
    setPreview(URL.createObjectURL(file))
  }

  const shell = (width: number, radius: number, children: React.ReactNode) => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-[16px]"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white relative flex flex-col w-full my-auto"
        style={{ maxWidth: width, borderRadius: radius }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )

  if (kind === 'evidence') {
    return shell(
      648,
      20,
      <div className="flex flex-col gap-[24px] px-[24px] pt-[15px] pb-[15px] max-md:px-[16px]">
        <div className="flex items-center justify-between h-[24px]">
          <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
            Confirm Order Status
          </p>
          <button type="button" onClick={onClose} aria-label="Close" className="size-[24px]">
            <img src={closeIcon} alt="" className="size-[24px]" />
          </button>
        </div>
        <div className="flex flex-col gap-[8px]">
          <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(500)}>
            Evidence
          </p>
          {/* Drop zone: 600×264, 0.8px #807e7e stroke, radius 20 */}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="relative h-[264px] w-full rounded-[20px] overflow-hidden flex items-center justify-center max-md:h-[232px]"
            style={{ border: '0.8px solid #807e7e' }}
          >
            {preview ? (
              <img src={preview} alt="Package photo" className="absolute inset-0 size-full object-cover" />
            ) : (
              <div className="flex w-[422px] max-w-full flex-col items-center gap-[40px] max-md:gap-[24px] max-md:px-[16px]">
                <img src={uploadIcon} alt="" className="size-[64px]" />
                <div className="flex flex-col items-center gap-[8px]">
                  <p className="text-[#101604] text-[20px] leading-[27px]" style={jakarta(600)}>
                    Capture image or Browse
                  </p>
                  <p className="text-[#807e7e] text-[14px] leading-[24px] text-center" style={jakarta(400)}>
                    Upload image from your device or capture with your camera.
                    <br />
                    (JPEG, JPG, PNG, IMG)
                  </p>
                </div>
              </div>
            )}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png"
            capture="environment"
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          {error && (
            <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
              {error}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => (preview ? onConfirm() : setError('Add a photo of the packed order first.'))}
          className="flex h-[48px] w-full items-center justify-center rounded-[30px]"
          style={{ backgroundImage: CTA_BG }}
        >
          <span
            className="text-[14px] leading-[18px] bg-clip-text text-transparent"
            style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}
          >
            Mark as ready
          </span>
        </button>
      </div>,
    )
  }

  const copy =
    kind === 'decline'
      ? {
          title: 'Decline this order?',
          body: 'The buyer will be refunded automatically and the order closed. This cannot be undone.',
        }
      : SUCCESS[kind]

  return shell(
    580,
    24,
    <div className="flex flex-col gap-[40px] items-center p-[24px] max-md:gap-[24px] max-md:p-[16px]">
      <div className="flex flex-col items-center gap-[24px] w-full">
        <img src={badge} alt="" className="size-[160px]" />
        <div className="flex flex-col items-center gap-[8px] text-center w-full">
          <p className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            {copy.title}
          </p>
          <p className="text-[#807e7e] text-[16px] leading-[28px]" style={jakarta(400)}>
            {copy.body}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-[16px] w-full">
        <button
          type="button"
          onClick={onConfirm}
          className="flex h-[48px] w-full items-center justify-center rounded-[30px] border border-[#789ebb]"
          style={{ backgroundImage: CTA_BG }}
        >
          <span
            className="text-[14px] leading-[18px] bg-clip-text text-transparent"
            style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}
          >
            {kind === 'decline' ? 'Yes, decline' : 'Proceed'}
          </span>
        </button>
        {kind === 'decline' && (
          <button
            type="button"
            onClick={onClose}
            className="bg-[#f7f7f7] flex h-[48px] w-full items-center justify-center rounded-[30px] text-[#101604] text-[14px]"
            style={jakarta(500)}
          >
            No, keep it
          </button>
        )}
      </div>
    </div>,
  )
}
