import { jakarta } from '../../utils/styles'

interface OptionRowProps {
  name: string
  value: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
  /** The 20px glyph in the 40px mint tile. */
  icon: string
  title: string
  subtitle: string
  /** The right-hand figure: "Free", "₦4,096", "Quoted next"; none for a row with no price. */
  price?: string
  /** A small pill after the title ("Default"). */
  badge?: string
}

/**
 * One choice in the checkout's delivery list (880:50442): a 74px row on #f7f7f7, radius 15,
 * 16 padding; the 20px radio, the 40px mint tile with the glyph, the 14/600 title over the
 * 12/400 line, and the 16/600 price at the right. The frame is 637 wide in its own context; here
 * the row fills the 648px dialog's content width. The radio is drawn here (20px ring, 1.25
 * stroke, a 10px dot when chosen) rather than exported, so it reads the same at every size.
 */
export default function OptionRow({ name, value, checked, onChange, disabled, icon, title, subtitle, price, badge }: OptionRowProps) {
  return (
    // On a phone the price takes part of the width, so the line below the title wraps and the row grows past 74.
    <label className={`flex h-[74px] items-center justify-between gap-[16px] rounded-[15px] border border-[#f7f7f7] bg-[#f7f7f7] p-[16px] max-md:h-auto max-md:min-h-[74px] max-md:gap-[12px] ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
      <span className="flex min-w-0 items-center gap-[16px]">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} className="sr-only" />
        <span aria-hidden="true" className={`flex size-[20px] shrink-0 items-center justify-center rounded-full border-[1.25px] bg-white ${checked ? 'border-[#007c53]' : 'border-[#807e7e]'}`}>
          {checked && <span className="size-[10px] rounded-full bg-[#007c53]" />}
        </span>
        <span className="flex size-[40px] shrink-0 items-center justify-center rounded-[10px] bg-[#f2f8f6]">
          <img src={icon} alt="" className="size-[20px]" />
        </span>
        <span className="flex min-w-0 flex-col gap-[4px]">
          <span className="flex min-w-0 items-center gap-[8px]">
            <span className="truncate text-[#101604] text-[14px] leading-[18px]" style={jakarta(600)}>
              {title}
            </span>
            {badge && (
              <span className="shrink-0 rounded-[30px] px-[8px] py-[2px] text-[#007c53] text-[11px] leading-[14px]" style={{ ...jakarta(600), background: 'rgba(0,124,83,0.08)' }}>
                {badge}
              </span>
            )}
          </span>
          <span className="truncate text-[#807e7e] text-[12px] leading-[15px] max-md:whitespace-normal max-md:line-clamp-2" style={jakarta(400)}>
            {subtitle}
          </span>
        </span>
      </span>
      {price && (
        <span className="shrink-0 text-[#101604] text-[16px] leading-[20px]" style={jakarta(600)}>
          {price}
        </span>
      )}
    </label>
  )
}
