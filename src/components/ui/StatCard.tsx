import type { ReactNode } from 'react'
import { jakarta } from '../../utils/styles'

/**
 * The lime-to-green fill of the first stat card (overview 464:8211, orders 561:3808, both
 * 261×120). The frame's gradient handles sit outside the card and its colour bands run parallel
 * to the width handle, which solves to 175.03° with the lime stop at -61.8% and the green stop
 * at 74.7% of the gradient line: the top-left corner is already half way to green and the
 * bottom edge is fully green. Sampled against the frame's export: within 1/255.
 */
export const STAT_GRADIENT = 'linear-gradient(175.03deg, #aee74a -61.8%, #007c53 74.7%)'

interface StatCardProps {
  label: string
  value: ReactNode
  /** A caption beside the figure ("all time", "from 2 reviews"). */
  sub?: string
  /** The highlighted first card, on the lime-to-green fill. */
  gradient?: boolean
}

/**
 * A dashboard stat card (overview 459:1048, orders 561:3325): 120 tall, radius 20, 24px side
 * padding, the 14/24 label at 16 from the top, the 32/48 figure 16 from the bottom, and the
 * 12/15 caption 22px below the figure's top (not on its baseline).
 */
export default function StatCard({ label, value, sub, gradient = false }: StatCardProps) {
  return (
    <div
      className="h-[120px] rounded-[20px] overflow-hidden px-[24px] pt-[16px] pb-[16px] flex flex-col justify-between max-md:h-auto max-md:min-h-[120px] max-md:px-[16px]"
      style={gradient ? { backgroundImage: STAT_GRADIENT } : { background: 'white' }}
    >
      <p className="text-[14px] leading-[24px]" style={{ ...jakarta(500), color: gradient ? '#ffffff' : '#807e7e' }}>
        {label}
      </p>
      <div className="flex items-start gap-[8px]">
        <p className="text-[32px] leading-[48px]" style={{ ...jakarta(700), color: gradient ? '#ffffff' : '#101604' }}>
          {value}
        </p>
        {sub && (
          <p
            className="text-[12px] leading-[15px] mt-[22px] whitespace-nowrap"
            style={{ ...jakarta(400), color: gradient ? 'rgba(255,255,255,0.75)' : '#807e7e' }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}
