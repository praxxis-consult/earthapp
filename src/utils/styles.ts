import type { CSSProperties } from 'react'

export function jakarta(weight: number): CSSProperties {
  return {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: weight,
  }
}

export const CTA_BG =
  'linear-gradient(90deg,rgb(0,124,83) 0%,rgb(0,124,83) 100%),linear-gradient(176.5deg,rgb(117,163,199) 8.078%,rgb(48,94,130) 78.737%)'

export const CTA_TEXT_BG =
  'linear-gradient(178.06deg,rgb(255,255,255) 4.9851%,rgba(255,255,255,0.76) 85.731%)'

/**
 * A row of pills or tabs that scrolls sideways on phones instead of wrapping or overflowing the
 * page: the scrollbar is hidden and the row bleeds into the card's 16px padding so the first pill
 * still sits flush with the content edge.
 */
export const SCROLL_ROW =
  'max-md:flex-nowrap max-md:overflow-x-auto max-md:-mx-[16px] max-md:px-[16px] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden'
