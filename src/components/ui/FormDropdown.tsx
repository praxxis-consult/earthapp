import { useState } from 'react'
import { MenuItem, MenuList, SelectTrigger } from './SelectorMenu'
import { useMenu } from './useMenu'
import { jakarta } from '../../utils/styles'

interface FormDropdownProps {
  label: string
  value: string
  placeholder: string
  options: string[]
  onSelect: (value: string) => void
  id?: string
  /** The sign-up frame's labels are 16px; the onboarding frames' are 14px. */
  labelSize?: 14 | 16
  /** Shown as the only row when there is nothing to choose from (a region list before a country is picked). */
  emptyHint?: string
}

/** Lists longer than this get a type-to-filter box at the top (every country, a country's regions). */
const FILTER_FROM = 12

/** A labelled select (Figma "Frame 2147237027") that opens the design's selector menu. */
export default function FormDropdown({ label, value, placeholder, options, onSelect, id, labelSize = 14, emptyHint }: FormDropdownProps) {
  const { open, setOpen, ref } = useMenu()
  const [filter, setFilter] = useState('')
  const q = filter.trim().toLowerCase()
  const shown = q ? options.filter((o) => o.toLowerCase().includes(q)) : options
  const labelClass = labelSize === 16 ? 'text-[16px] leading-[24px]' : 'text-[14px] leading-[24px]'
  return (
    <div className="flex flex-col gap-[8px] items-start w-full" ref={ref}>
      <label htmlFor={id} className={`text-[#101604] ${labelClass} w-full`} style={jakarta(500)}>
        {label}
      </label>
      <div className="relative w-full">
        <SelectTrigger id={id} value={value} placeholder={placeholder} open={open} onToggle={() => setOpen((o) => !o)} />
        {open && (
          <MenuList className="absolute left-0 top-[52px] z-30" hint={options.length === 0 ? emptyHint : undefined}>
            {options.length > FILTER_FROM && (
              <div className="px-[16px] pb-[8px]">
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Type to find"
                  aria-label={`Find ${label.toLowerCase()}`}
                  autoFocus
                  className="bg-[#f7f7f7] h-[40px] w-full rounded-[30px] px-[16px] text-[14px] leading-[24px] text-[#101604] outline-none placeholder:text-[#807e7e]"
                  style={jakarta(400)}
                />
              </div>
            )}
            {shown.map((opt) => (
              <MenuItem
                key={opt}
                label={opt}
                selected={opt === value}
                onSelect={() => {
                  onSelect(opt)
                  setFilter('')
                  setOpen(false)
                }}
              />
            ))}
          </MenuList>
        )}
      </div>
    </div>
  )
}
