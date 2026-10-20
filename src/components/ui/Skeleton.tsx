import type { CSSProperties } from 'react'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
}

/**
 * One loading placeholder: a block the size and shape of what is about to appear, with a soft
 * shimmer (`.skeleton` in index.css; still under prefers-reduced-motion). Pages compose these into
 * the outline of their loaded layout, so nothing jumps when the data lands. Decorative: the
 * containing region carries `aria-busy` and a visually hidden "Loading" for screen readers.
 */
export default function Skeleton({ className = '', style }: SkeletonProps) {
  return <div aria-hidden="true" className={`skeleton rounded-[12px] ${className}`} style={style} />
}

/** The accessible wrapper for a loading region: announces once, hides the placeholders from readers. */
export function LoadingRegion({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}
