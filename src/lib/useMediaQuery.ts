import { useSyncExternalStore } from 'react'

const can = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'

/** Whether a CSS media query holds, kept current as the window changes (false where matchMedia is missing, as in tests). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (!can()) return () => {}
      const m = window.matchMedia(query)
      m.addEventListener('change', onChange)
      return () => m.removeEventListener('change', onChange)
    },
    () => can() && window.matchMedia(query).matches,
    () => false,
  )
}
