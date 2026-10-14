import { useEffect, type FormEvent, type ReactNode } from 'react'
import authLogo from '../../assets/icons/auth-logo.svg'
import authCancel from '../../assets/icons/auth-cancel.svg'

interface AuthModalProps {
  children: ReactNode
  onClose: () => void
  onSubmit: (e: FormEvent) => void
  labelledBy: string
}

/**
 * Figma "log in modal" / "auth log in" (387:2682, 390:2921): 580 wide, white, radius 24, 40px
 * padding, the 62×64 logo at the top, the close icon at 516/40, and the body stacked with a 40px
 * gap beneath the logo.
 */
export default function AuthModal({ children, onClose, onSubmit, labelledBy }: AuthModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-[16px]"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative flex w-[580px] max-w-full max-h-[calc(100vh-32px)] overflow-y-auto flex-col gap-[40px] rounded-[24px] bg-white p-[40px] max-md:gap-[32px] max-md:p-[24px]"
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        noValidate
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[40px] top-[40px] flex size-[24px] items-center justify-center max-md:right-[24px] max-md:top-[24px]"
          aria-label="Close"
        >
          <img src={authCancel} alt="" className="size-[24px]" />
        </button>
        <img src={authLogo} alt="Earth" className="h-[64px] w-[62px]" />
        {children}
      </form>
    </div>
  )
}
