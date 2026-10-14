import { MenuItem, MenuList, SelectTrigger } from './SelectorMenu'
import { useMenu } from './useMenu'
import { jakarta } from '../../utils/styles'

interface FormMultiDropdownProps {
  label: string
  values: string[]
  placeholder: string
  options: string[]
  onToggle: (value: string) => void
  /** Figma 421:4219's hint row: "Select up to three categories". */
  max?: number
  id?: string
}

/** A labelled multi-select that opens the design's checkbox menu (421:4219). */
export default function FormMultiDropdown({ label, values, placeholder, options, onToggle, max = 3, id }: FormMultiDropdownProps) {
  const { open, setOpen, ref } = useMenu()
  return (
    <div className="flex flex-col gap-[8px] items-start w-full" ref={ref}>
      <label htmlFor={id} className="text-[#101604] text-[14px] leading-[24px] w-full" style={jakarta(500)}>
        {label}
      </label>
      <div className="relative w-full">
        <SelectTrigger id={id} value={values.join(', ')} placeholder={placeholder} open={open} onToggle={() => setOpen((o) => !o)} />
        {open && (
          <MenuList className="absolute left-0 top-[52px] z-30" hint={`Select up to ${max === 3 ? 'three' : max} categories`}>
            {options.map((opt) => {
              const on = values.includes(opt)
              const full = !on && values.length >= max
              return (
                <MenuItem
                  key={opt}
                  label={opt}
                  selected={on}
                  checkbox
                  onSelect={() => {
                    if (!full) onToggle(opt)
                  }}
                />
              )
            })}
          </MenuList>
        )}
      </div>
    </div>
  )
}
