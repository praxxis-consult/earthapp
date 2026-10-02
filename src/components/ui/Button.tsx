import type { ButtonHTMLAttributes, ReactNode } from 'react'
import arrowRight from '../../assets/icons/arrow-right.svg'
import arrowRightDark from '../../assets/icons/arrow-right-dark.svg'

type ButtonVariant = 'primary' | 'ghost' | 'accent' | 'dark'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
}

const variantStyles: Record<ButtonVariant, { wrapper: string; arrow?: string }> = {
  primary: {
    wrapper: 'bg-primary text-white',
    arrow: arrowRight,
  },
  ghost: {
    wrapper: 'text-primary-dark',
  },
  accent: {
    wrapper: 'bg-accent-lime text-primary-dark',
    arrow: arrowRightDark,
  },
  dark: {
    wrapper: 'bg-dark-muted text-white',
  },
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const { wrapper, arrow } = variantStyles[variant]

  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center gap-1
        h-12 px-6 rounded-[30px] shrink-0
        font-jakarta font-medium text-sm tracking-[-0.28px] whitespace-nowrap cursor-pointer
        transition-opacity hover:opacity-90
        ${wrapper} ${className}
      `}
    >
      {children}
      {arrow && <img src={arrow} alt="" className="size-6 shrink-0" />}
    </button>
  )
}
