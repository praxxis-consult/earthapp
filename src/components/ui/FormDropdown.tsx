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
}

/** A labelled select (Figma "Frame 2147237027") that opens the design's selector menu. */
export default function FormDropdown({ label, value, placeholder, options, onSelect, id, labelSize = 14 }: FormDropdownProps) {
  const { open, setOpen, ref } = useMenu()
  const labelClass = labelSize === 16 ? 'text-[16px] leading-[24px]' : 'text-[14px] leading-[24px]'
  return (
    <div className="flex flex-col gap-[8px] items-start w-full" ref={ref}>
      <label htmlFor={id} className={`text-[#101604] ${labelClass} w-full`} style={jakarta(500)}>
        {label}
      </label>
      <div className="relative w-full">
        <SelectTrigger id={id} value={value} placeholder={placeholder} open={open} onToggle={() => setOpen((o) => !o)} />
        {open && (
          <MenuList className="absolute left-0 top-[52px] z-30">
            {options.map((opt) => (
              <MenuItem
                key={opt}
                label={opt}
                selected={opt === value}
                onSelect={() => {
                  onSelect(opt)
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
