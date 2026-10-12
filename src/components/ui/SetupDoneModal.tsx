import badge from '../../assets/icons/onboarding-badge.svg'
import copyIcon from '../../assets/icons/db-copy.svg'
import authCancel from '../../assets/icons/auth-cancel.svg'
import GradientButton from './GradientButton'
import { jakarta } from '../../utils/styles'

interface SetupDoneModalProps {
  onDashboard: () => void
  onClose: () => void
}

export default function SetupDoneModal({ onDashboard, onClose }: SetupDoneModalProps) {
  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.origin + '/store/akpolo-agro-mine')
  }

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
              <img src={badge} alt="" className="absolute block inset-0 max-w-none size-full" />
            </div>
            <div className="flex flex-col gap-[8px] items-center text-center w-full">
              <p className="text-[#101604] text-[24px] leading-[32px] w-[500px]" style={jakarta(600)}>
                Your store is live! 🎉
              </p>
              <p className="text-[#807e7e] text-[16px] leading-[28px]" style={jakarta(400)}>
                Users across the platform can now find you. Share your store link where your customers already are.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-[16px] items-start w-full">
            <GradientButton onClick={onDashboard} className="w-full">
              Go to Dashboard
            </GradientButton>

            <button
              onClick={handleCopyLink}
              className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[24px] py-[8px] rounded-[30px] w-full"
            >
              <div className="relative shrink-0 size-[24px]">
                <img src={copyIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
              </div>
              <p className="text-[#101604] text-[14px] text-center whitespace-nowrap" style={jakarta(500)}>
                Copy link
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
