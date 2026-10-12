import type { ReactNode } from 'react'
import image15 from '../../assets/images/onboarding-image15.png'
import image16 from '../../assets/images/onboarding-image16.png'

interface OnboardingLayoutProps {
  children: ReactNode
  /** ReviewDetails needs a scrollable page instead of fixed h-screen */
  scrollable?: boolean
  /** ReviewDetails positions the right panel slightly above center */
  rightPanelTop?: string
}

function OnboardingRightPanel({ top = '50%' }: { top?: string }) {
  return (
    <div
      className="-translate-y-1/2 absolute bg-[#e3e3e3] h-[976px] overflow-clip right-[24px] rounded-[25px] w-[676px]"
      style={{ top }}
    >
      {/* image15 — centered both axes */}
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute h-[976px] w-[732.651px]"
        style={{ left: 'calc(50% + 0.5px)', top: '50%' }}
      >
        <img src={image15} alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" />
      </div>

      {/* image16 — top-anchored */}
      <div className="-translate-x-1/2 absolute h-[1013.999px] left-1/2 top-0 w-[675.999px]">
        <img src={image16} alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" />
      </div>

      {/* gradient overlay */}
      <div
        className="-translate-x-1/2 absolute bg-gradient-to-t bottom-0 from-[#101604] h-[976px] to-[rgba(16,22,4,0)] to-[50%] w-[675px]"
        style={{ left: 'calc(50% + 0.5px)' }}
      />
    </div>
  )
}

export default function OnboardingLayout({
  children,
  scrollable = false,
  rightPanelTop,
}: OnboardingLayoutProps) {
  if (scrollable) {
    return (
      <div className="bg-white w-full" style={{ minHeight: '1100px' }}>
        <div className="max-w-[1440px] mx-auto relative" style={{ minHeight: '1100px' }}>
          <OnboardingRightPanel top={rightPanelTop ?? 'calc(50% - 30px)'} />
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white w-full h-screen overflow-hidden">
      <div className="max-w-[1440px] mx-auto relative h-full">
        <OnboardingRightPanel top={rightPanelTop ?? '50%'} />
        {children}
      </div>
    </div>
  )
}
