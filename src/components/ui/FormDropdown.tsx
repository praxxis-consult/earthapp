import { useState, useRef, useEffect } from 'react'
import chevronDown from '../../assets/icons/signup-chevron-down-24.svg'
import { jakarta } from '../../utils/styles'

interface FormDropdownProps {
  label: string
  value: string
  placeholder: string
  options: string[]
  onSelect: (value: string) => void
  id?: string
}

export default function FormDropdown({
  label,
  value,
  placeholder,
  options,
  onSelect,
  id,
}: FormDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  return (
    <div className="flex flex-col gap-[8px] items-start w-full" ref={ref}>
      {id ? (
        <label
          htmlFor={id}
          className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] w-full"
          style={jakarta(500)}
        >
          {label}
        </label>
      ) : (
        <p
          className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] w-full"
          style={jakarta(500)}
        >
          {label}
        </p>
      )}

      <div className="relative w-full">
        <button
          id={id}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="bg-[#f7f7f7] flex h-[48px] items-center justify-between px-[16px] py-[8px] rounded-[30px] w-full border border-transparent"
        >
          <span
            className="text-[14px] leading-[24px] tracking-[-0.28px] whitespace-nowrap truncate"
            style={{ ...jakarta(400), color: value ? '#101604' : '#807e7e' }}
          >
            {value || placeholder}
          </span>
          <div
            className="relative shrink-0 size-[24px] transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <img src={chevronDown} alt="" className="absolute block inset-0 max-w-none size-full" />
          </div>
        </button>

        <div
          className="absolute top-[52px] left-0 w-full bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] overflow-hidden z-10 transition-all duration-200 origin-top"
          style={{
            maxHeight: open ? '200px' : '0px',
            opacity: open ? 1 : 0,
            transform: open ? 'scaleY(1)' : 'scaleY(0.96)',
          }}
        >
          <div className="overflow-y-auto max-h-[200px]">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onSelect(opt); setOpen(false) }}
                className="flex items-center w-full px-[16px] py-[12px] hover:bg-[#f7f7f7] transition-colors text-left"
              >
                <span className="text-[14px] leading-[24px]" style={{ ...jakarta(400), color: '#101604' }}>
                  {opt}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
