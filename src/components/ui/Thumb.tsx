import { useState } from 'react'

/**
 * A product thumbnail that never shows the browser's broken-image glyph: when there is no
 * source, or the host cannot serve it, a neutral tile takes its place at the same size.
 */
export default function Thumb({ src, className = '' }: { src: string | null | undefined; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <span aria-hidden className={`block bg-[#eef1ec] ${className}`} />
  return <img src={src} alt="" onError={() => setFailed(true)} className={`block object-cover ${className}`} />
}
