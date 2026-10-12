import { useState, useRef, useEffect } from 'react'
import chevronDown from '../../assets/icons/signup-chevron-down-24.svg'
import { jakarta } from '../../utils/styles'

interface FormMultiDropdownProps {
  label: string
  values: string[]
  placeholder: string
  options: string[]
  onToggle: (value: string) => void
}

export default function FormMultiDropdown({
  label,
  values,
  placeholder,
  options,
  onToggle,
}: FormMultiDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const displayValue = values.length > 0 ? values.join(', ') : placeholder

  return (
    <div className="flex flex-col gap-[8px] items-start w-full" ref={ref}>
      <p className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] w-full" style={jakarta(500)}>
        {label}
      </p>

      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="bg-[#f7f7f7] flex h-[48px] items-center justify-between px-[16px] py-[8px] rounded-[30px] w-full border border-transparent"
        >
          <span
            className="text-[14px] leading-[24px] tracking-[-0.28px] whitespace-nowrap truncate"
            style={{ ...jakarta(400), color: values.length > 0 ? '#101604' : '#807e7e' }}
          >
            {displayValue}
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
            maxHeight: open ? '240px' : '0px',
            opacity: open ? 1 : 0,
            transform: open ? 'scaleY(1)' : 'scaleY(0.96)',
          }}
        >
          <div className="overflow-y-auto max-h-[240px]">
            {options.map((opt) => {
              const checked = values.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onToggle(opt)}
                  className="flex items-center gap-[12px] w-full px-[16px] py-[12px] hover:bg-[#f7f7f7] transition-colors text-left"
                >
                  {checked ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="0.75" y="0.75" width="18.5" height="18.5" rx="4.25" fill="#007c53" stroke="#007c53" strokeWidth="1.5"/>
                      <path d="M5 10.5L8.5 14L15 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="0.75" y="0.75" width="18.5" height="18.5" rx="4.25" stroke="#807E7E" strokeWidth="1.5"/>
                    </svg>
                  )}
                  <span className="text-[14px] leading-[24px]" style={{ ...jakarta(400), color: '#101604' }}>
                    {opt}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
