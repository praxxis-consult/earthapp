import { useEffect, type ReactNode } from 'react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  /** Which edge the panel slides in from. */
  side?: 'left' | 'right'
  label: string
  children: ReactNode
  /** Extra classes on the panel (width, background); defaults to a 300px white panel. */
  className?: string
}

/**
 * The phone and tablet navigation panel: a dimmed backdrop and a panel that slides in from one
 * edge. Used below the `lg` breakpoint by the public navbar and the dashboard sidebar, so both
 * behave the same way (Escape and backdrop close it, the page behind stops scrolling, the panel
 * is a labelled dialog). It renders nothing while closed and is meant to be hidden at `lg` and
 * above by the caller, where the full-width navigation is shown instead.
 */
export default function Drawer({ open, onClose, side = 'left', label, children, className = '' }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={label}>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 w-full h-full cursor-default"
        style={{ background: 'rgba(16,22,4,0.45)' }}
      />
      <div
        className={`absolute top-0 bottom-0 ${side === 'left' ? 'left-0' : 'right-0'} w-[300px] max-w-[85vw] bg-white flex flex-col overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,0.18)] ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
