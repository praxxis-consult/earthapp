import arrowDown from '../../assets/icons/signup-arrow-down.svg'
import { jakarta } from '../../utils/styles'

interface OnboardingHeaderProps {
  onBack: () => void
  /** 1-based step number. Omit for pages without a progress bar (e.g. ReviewDetails). */
  step?: number
  totalSteps?: number
  title: string
  subtitle: string
}

function BackArrow() {
  return (
    <div className="flex items-center justify-center relative shrink-0 size-[16px]">
      <div className="flex-none rotate-90">
        <div className="relative size-[16px]">
          <img src={arrowDown} alt="" className="absolute block inset-0 max-w-none size-full" />
        </div>
      </div>
    </div>
  )
}

export default function OnboardingHeader({
  onBack,
  step,
  totalSteps = 4,
  title,
  subtitle,
}: OnboardingHeaderProps) {
  return (
    <div
      className="absolute flex flex-col gap-[24px] items-start"
      style={{ left: '120px', top: '120px', width: '580px' }}
    >
      {/* Back button */}
      <button onClick={onBack} className="flex gap-[8px] items-center">
        <BackArrow />
        <span className="text-[#807e7e] text-[16px] leading-[24px] whitespace-nowrap" style={jakarta(500)}>
          Back
        </span>
      </button>

      {/* Step progress bar */}
      {step !== undefined && (
        <div className="flex flex-col gap-[8px] items-start w-full">
          <p className="text-[#131313] text-[12px] leading-[20px]" style={jakarta(600)}>
            Step {step} of {totalSteps}
          </p>
          <div className="flex gap-[8px] items-center w-full">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className="h-[4px] rounded-[10px] w-[139px]"
                style={{ background: i < step ? '#007c53' : 'rgba(0,124,83,0.1)' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Title + subtitle */}
      <div className="flex flex-col gap-[8px] items-start w-full">
        <div className="flex h-[32px] items-center justify-center w-[500px]">
          <p className="text-[#101604] text-[24px] leading-[32px] w-[500px]" style={jakarta(600)}>
            {title}
          </p>
        </div>
        <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
          {subtitle}
        </p>
      </div>
    </div>
  )
}
