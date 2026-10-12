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
