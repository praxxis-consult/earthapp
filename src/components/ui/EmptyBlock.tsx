import type { ReactNode } from 'react'
import emptyBg from '../../assets/icons/db-empty-bg.svg'
import emptyIllustration from '../../assets/icons/db-empty-illustration.svg'
import { jakarta } from '../../utils/styles'

interface EmptyBlockProps {
  title: string
  copy: string
  /** A control under the copy (products 467:12444 has the Add product button there). */
  action?: ReactNode
  className?: string
}

/**
 * The dashboard's "nothing here yet" block (overview 431:4736, products 467:11522, orders
 * 561:3689): the 200px illustration (its backdrop at 23.57/16.07, the tilted box at 31.56/21.67),
 * then the 20/25 title and 14/24 copy centred in a 429px column with an 8px gap, and an optional
 * action 24px below.
 */
export default function EmptyBlock({ title, copy, action, className = '' }: EmptyBlockProps) {
  return (
    <div className={`flex flex-col items-center gap-[24px] w-full ${className}`}>
      <div className="flex flex-col items-center w-[429px] max-w-full">
        <div className="relative size-[200px]">
          <div className="absolute" style={{ left: '23.57px', top: '16.07px', width: '153.208px', height: '140px' }}>
            <img src={emptyBg} alt="" className="absolute block inset-0 max-w-none size-full" />
          </div>
          <div
            className="absolute flex items-center justify-center"
            style={{ left: '31.56px', top: '21.67px', width: '137.713px', height: '162.27px' }}
          >
            <div style={{ transform: 'rotate(-20.53deg)' }}>
              <img src={emptyIllustration} alt="" style={{ width: '95.564px', height: '137.487px' }} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[8px] items-center text-center w-full">
          <p className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
            {title}
          </p>
          <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
            {copy}
          </p>
        </div>
      </div>
      {action}
    </div>
  )
}
