import { useEffect, useState } from 'react'
import { step } from '../../lib/gallery'
import { jakarta } from '../../utils/styles'
import closeIcon from '../../assets/icons/td-close.svg'
import leftIcon from '../../assets/icons/po-arrow-left.svg'
import rightIcon from '../../assets/icons/po-arrow-right.svg'

interface ImageViewerProps {
  images: string[]
  /** The photo to open on. */
  start: number
  title: string
  onClose: () => void
}

/**
 * The full-size view of a listing's photos: the current one fitted to the screen on a dark
 * backdrop, previous and next at the sides, a counter, and close. Arrow keys step, Escape closes,
 * and a swipe on a phone steps too. The thumbnail strip on the page opens it; nothing in the
 * design file draws this screen, so it follows the app's dialogs (same backdrop, white controls).
 */
export default function ImageViewer({ images, start, title, onClose }: ImageViewerProps) {
  const [at, setAt] = useState(start)
  const count = images.length
  const go = (by: 1 | -1) => setAt((i) => step(count, i, by))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  const [touchX, setTouchX] = useState<number | null>(null)
  const onTouchEnd = (x: number) => {
    if (touchX !== null && Math.abs(x - touchX) > 40) go(x < touchX ? 1 : -1)
    setTouchX(null)
  }

  if (!count) return null
  const control = 'flex items-center justify-center size-[44px] rounded-full bg-white/90 hover:bg-white shrink-0'
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
    >
      <div className="flex items-center justify-between p-[16px]" onClick={(e) => e.stopPropagation()}>
        <span className="text-white text-[14px] leading-[20px]" style={jakarta(500)} aria-live="polite">
          {at + 1} / {count}
        </span>
        <button type="button" onClick={onClose} aria-label="Close" className={control}>
          <img src={closeIcon} alt="" className="size-[20px]" />
        </button>
      </div>
      <div className="flex flex-1 min-h-0 items-center justify-between gap-[8px] px-[16px] pb-[24px]">
        <button type="button" onClick={(e) => { e.stopPropagation(); go(-1) }} aria-label="Previous photo" className={`${control} ${count < 2 ? 'invisible' : ''}`}>
          <img src={leftIcon} alt="" className="size-[20px]" />
        </button>
        <div className="flex h-full flex-1 min-w-0 items-center justify-center">
          <img key={at} src={images[at]} alt={`${title}, photo ${at + 1} of ${count}`} className="max-h-full max-w-full object-contain rounded-[12px] select-none" onClick={(e) => e.stopPropagation()} draggable={false} />
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); go(1) }} aria-label="Next photo" className={`${control} ${count < 2 ? 'invisible' : ''}`}>
          <img src={rightIcon} alt="" className="size-[20px]" />
        </button>
      </div>
    </div>
  )
}
