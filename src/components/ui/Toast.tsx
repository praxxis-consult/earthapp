import { useEffect } from 'react'
import documentIcon from '../../assets/icons/db-document-text.svg'
import { jakarta } from '../../utils/styles'

interface ToastProps {
  title: string
  body?: string
  onDone: () => void
  /** Milliseconds before it goes away on its own. */
  duration?: number
}

/**
 * Figma "Inventory note" (474:2920): 489.5×64 at the content's top right, fill #f2f8f6, radius 16,
 * shadow 0 10 28 rgba(20,43,33,0.1), padding 12/16, gap 12, document icon, 14/17.64 SemiBold + 12/20.
 */
export default function Toast({ title, body, onDone, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, duration)
    return () => clearTimeout(t)
  }, [onDone, duration])

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute right-[24px] top-[40px] z-20 flex w-[489.5px] max-w-[calc(100%-48px)] gap-[12px] rounded-[16px] bg-[#f2f8f6] px-[16px] py-[12px] shadow-[0_10px_28px_rgba(20,43,33,0.1)]"
    >
      <img src={documentIcon} alt="" className="size-[24px] shrink-0" />
      <div className="flex flex-col gap-[2px] min-w-0">
        <p className="text-[#101604] text-[14px] leading-[18px]" style={jakarta(600)}>
          {title}
        </p>
        {body && (
          <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
            {body}
          </p>
        )}
      </div>
    </div>
  )
}
