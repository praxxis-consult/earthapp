import type { CSSProperties, ReactNode } from 'react'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

interface GradientButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  style?: CSSProperties
  type?: 'button' | 'submit'
}

export default function GradientButton({
  children,
  onClick,
  className = '',
  style,
  type = 'button',
}: GradientButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`border border-[#789ebb] flex h-[48px] items-center justify-center overflow-clip px-[24px] py-[8px] rounded-[30px] ${className}`}
      style={{ backgroundImage: CTA_BG, ...style }}
    >
      <span
        className="bg-clip-text text-[14px] text-transparent text-center whitespace-nowrap"
        style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}
      >
        {children}
      </span>
    </button>
  )
}
