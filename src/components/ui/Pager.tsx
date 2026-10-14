import pagePrevIcon from '../../assets/icons/db-page-prev.svg'
import pageNextIcon from '../../assets/icons/db-page-next.svg'
import { jakarta } from '../../utils/styles'

interface PagerProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

/**
 * Figma "Frame 1000011548" (561:5295 and copies): 74 tall, padding 16/64, gap 16, 1px #f7f7f7
 * frame, radius 20; 40px page pills (active #f2f9f7/#007c53, others #f7f7f7/#807e7e); the first
 * three pages, the neighbours of the current one and the last, with … between.
 */
export default function Pager({ page, pageCount, onChange }: PagerProps) {
  const current = Math.min(Math.max(1, page), Math.max(1, pageCount))
  const pages: (number | '…')[] = []
  for (let p = 1; p <= pageCount; p++) {
    if (p <= 3 || p === pageCount || Math.abs(p - current) <= 1) pages.push(p)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }
  return (
    <nav
      aria-label="Pages"
      className="flex items-center justify-center gap-[16px] h-[74px] px-[64px] rounded-[20px] border border-[#f7f7f7] bg-white max-md:h-auto max-md:flex-wrap max-md:gap-[8px] max-md:px-[16px] max-md:py-[16px]"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        aria-label="Previous page"
        className="size-[20px] disabled:opacity-50"
      >
        <img src={pagePrevIcon} alt="" className="size-[20px]" />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`gap-${i}`}
            className="flex items-center justify-center size-[40px] rounded-[30px] bg-[#f7f7f7] text-[#807e7e] text-[14px] leading-[18px]"
            style={jakarta(600)}
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === current ? 'page' : undefined}
            className="flex items-center justify-center size-[40px] rounded-[30px] text-[14px] leading-[18px]"
            style={{
              ...jakarta(600),
              background: p === current ? '#f2f9f7' : '#f7f7f7',
              color: p === current ? '#007c53' : '#807e7e',
            }}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, current + 1))}
        disabled={current === pageCount}
        aria-label="Next page"
        className="size-[20px] disabled:opacity-50"
      >
        <img src={pageNextIcon} alt="" className="size-[20px]" />
      </button>
    </nav>
  )
}
