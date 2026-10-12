import badge from '../../assets/icons/onboarding-badge.svg'
import authCancel from '../../assets/icons/auth-cancel.svg'

const jakarta = (weight: number): React.CSSProperties => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

interface IdentityVerifiedModalProps {
  onProceed: () => void
  onClose: () => void
}

export default function IdentityVerifiedModal({ onProceed, onClose }: IdentityVerifiedModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white relative flex flex-col gap-[10px] items-start overflow-clip p-[24px] rounded-[24px]"
        style={{ width: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-[24px] top-[24px] flex items-center justify-center size-[24px]"
          aria-label="Close"
        >
          <img src={authCancel} alt="" className="size-[24px]" />
        </button>

        <div className="flex flex-col gap-[40px] items-center justify-center w-full">
          {/* Badge + headings */}
          <div className="flex flex-col gap-[24px] items-center w-full">
            <div className="relative shrink-0 size-[160px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={badge} />
            </div>
            <div className="flex flex-col gap-[8px] items-center text-center w-full">
              <p className="text-[#101604] text-[24px] leading-[32px] w-full" style={jakarta(600)}>
                Identity Verified
              </p>
              <p className="text-[#807e7e] text-[16px] leading-[28px] w-full" style={jakarta(400)}>
                We've checked and verified your identity successfully. Buyers will see this badge on your store profile page.
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onProceed}
            className="border border-[#789ebb] flex h-[48px] items-center justify-center overflow-clip px-[24px] py-[8px] rounded-[30px] w-full"
            style={{
              backgroundImage:
                'linear-gradient(90deg,rgb(0,124,83) 0%,rgb(0,124,83) 100%),linear-gradient(176.18deg,rgb(117,163,199) 8.078%,rgb(48,94,130) 78.737%)',
            }}
          >
            <span
              className="bg-clip-text text-[14px] text-transparent text-center whitespace-nowrap"
              style={{
                ...jakarta(500),
                backgroundImage:
                  'linear-gradient(178.06deg,rgb(255,255,255) 4.9851%,rgba(255,255,255,0.76) 85.731%)',
              }}
            >
              Proceed
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
