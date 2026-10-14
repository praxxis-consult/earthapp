import arrowDown from '../../assets/icons/signup-arrow-down.svg'
import { jakarta } from '../../utils/styles'

interface OnboardingHeaderProps {
  onBack: () => void
  /** 1-based step number. Omit for pages without a progress bar (Review details, sign-up). */
  step?: number
  totalSteps?: number
  title: string
  subtitle: string
}

/** Figma "Frame 2147237045": the 16px arrow-down turned to point left, then "Back". */
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex gap-[8px] items-center">
      <span className="flex items-center justify-center size-[16px] rotate-90">
        <img src={arrowDown} alt="" className="size-[16px]" />
      </span>
      <span className="text-[#807e7e] text-[16px] leading-[24px] whitespace-nowrap" style={jakarta(500)}>
        Back
      </span>
    </button>
  )
}

/**
 * Figma "Frame 2147237504": Back, the step line with four 139×4 bars (gap 8), then the title
 * (24/32) and subtitle (16/24), stacked with a 24px gap.
 */
export default function OnboardingHeader({ onBack, step, totalSteps = 4, title, subtitle }: OnboardingHeaderProps) {
  return (
    <div className="flex flex-col gap-[24px] items-start w-full">
      <BackButton onClick={onBack} />

      {step !== undefined && (
        <div className="flex flex-col gap-[8px] items-start w-full">
          <p className="text-[#131313] text-[12px] leading-[20px]" style={jakarta(600)}>
            Step {step} of {totalSteps}
          </p>
          <div className="flex gap-[8px] items-center w-full">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className="h-[4px] rounded-[10px] flex-1"
                style={{ background: i < step ? '#007c53' : 'rgba(0,124,83,0.1)' }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-[8px] items-start w-full">
        <h1 className="text-[#101604] text-[24px] leading-[32px] w-full max-w-[500px]" style={jakarta(600)}>
          {title}
        </h1>
        <p className="text-[#807e7e] text-[16px] leading-[24px] w-full" style={jakarta(400)}>
          {subtitle}
        </p>
      </div>
    </div>
  )
}
