import type { ReactNode } from 'react'
import checkboxOn from '../../assets/icons/checkbox-on.svg'
import checkboxOff from '../../assets/icons/checkbox-off.svg'
import chevronDown from '../../assets/icons/signup-chevron-down-24.svg'
import { jakarta } from '../../utils/styles'

/**
 * Figma "Selector menu / menu list" (421:4219): 375 wide, white, radius 24, padding 8/0, two drop
 * shadows (0 5 3 -2 @2%, 0 3 10 -2 @10%); items 52 tall with 16px padding, an optional 20px
 * checkbox (r5, #007c53 on / 1.5px #807e7e off) and 14px SemiBold text; an optional hint row.
 */
export const MENU_SHADOW = '0 5px 3px -2px rgba(0,0,0,0.02), 0 3px 10px -2px rgba(0,0,0,0.1)'

export function MenuList({
  children,
  hint,
  className = '',
  width,
}: {
  children: ReactNode
  hint?: string
  className?: string
  /**
   * The component is 375 wide on desktop and as wide as its anchor below lg (a phone's field);
   * a narrower anchor (the dial-code picker) passes its own width, capped to the viewport.
   */
  width?: number
}) {
  return (
    <div
      role="listbox"
      className={`rounded-[24px] bg-white py-[8px] overflow-hidden max-w-[calc(100vw-32px)] ${width ? '' : 'w-[375px] max-lg:w-full'} ${className}`}
      style={{ boxShadow: MENU_SHADOW, width }}
    >
      {hint && (
        <p className="h-[50px] px-[16px] py-[16px] text-[#807e7e] text-[14px] leading-[18px]" style={jakarta(400)}>
          {hint}
        </p>
      )}
      <div className="max-h-[312px] overflow-y-auto">{children}</div>
    </div>
  )
}

export function MenuItem({
  label,
  selected,
  checkbox,
  disabled,
  onSelect,
}: {
  label: string
  selected: boolean
  /** Show the design's checkbox (multi-select lists). */
  checkbox?: boolean
  /** Shown but not pickable (a multi-select at its cap); the list's hint says why. */
  disabled?: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onSelect}
      className={`flex h-[52px] w-full items-center gap-[8px] px-[16px] text-left ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#f7f7f7]'}`}
    >
      {checkbox && <img src={selected ? checkboxOn : checkboxOff} alt="" className="size-[20px] shrink-0" />}
      <span
        className="text-[14px] leading-[20px] truncate"
        style={{ ...jakarta(600), color: !checkbox && selected ? '#007c53' : '#101604' }}
      >
        {label}
      </span>
    </button>
  )
}

/** Figma "Frame 1000011119" select: 48 tall, #f7f7f7, radius 30, padding 8/16, 24px chevron. */
export function SelectTrigger({
  id,
  value,
  placeholder,
  open,
  onToggle,
  ariaLabel,
}: {
  id?: string
  value: string
  placeholder: string
  open: boolean
  onToggle: () => void
  ariaLabel?: string
}) {
  return (
    <button
      id={id}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label={ariaLabel}
      onClick={onToggle}
      className="bg-[#f7f7f7] flex h-[48px] w-full items-center justify-between gap-[8px] rounded-[30px] px-[16px] py-[8px] border transition-colors"
      style={{ borderColor: open ? '#007c53' : 'transparent' }}
    >
      <span className="text-[14px] leading-[24px] truncate" style={{ ...jakarta(400), color: value ? '#101604' : '#807e7e' }}>
        {value || placeholder}
      </span>
      <img
        src={chevronDown}
        alt=""
        className="size-[24px] shrink-0 transition-transform duration-200"
        style={{ transform: open ? 'rotate(180deg)' : 'none' }}
      />
    </button>
  )
}
