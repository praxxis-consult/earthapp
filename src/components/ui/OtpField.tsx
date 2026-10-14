import type { ChangeEvent } from 'react'
import { jakarta } from '../../utils/styles'

interface OtpFieldProps {
  id: string
  value: string
  onChange: (digits: string) => void
  error?: string
  notice?: string
  countdown: string
  canResend: boolean
  onResend: () => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}

/**
 * Figma "Frame 2147237035": the "6-digit code" label (14/24), the 000-000 field (48, #f7f7f7),
 * then 16px below the countdown (16/24 #807e7e) and "Resend OTP" (16/24 Medium #007c53).
 */
export default function OtpField({ id, value, onChange, error, notice, countdown, canResend, onResend, inputRef }: OtpFieldProps) {
  const display = value.length > 3 ? `${value.slice(0, 3)}-${value.slice(3)}` : value
  function handle(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value.replace(/\D/g, '').slice(0, 6))
  }
  return (
    <div className="flex flex-col gap-[16px] w-full">
      <div className="flex flex-col gap-[8px] w-full">
        <label htmlFor={id} className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(500)}>
          6-digit code
        </label>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          value={display}
          onChange={handle}
          placeholder="000-000"
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-status`}
          className="h-[48px] w-full rounded-[30px] bg-[#f7f7f7] px-[16px] py-[8px] text-[14px] leading-[24px] text-[#101604] outline-none border border-transparent focus:border-[#007c53] placeholder:text-[#807e7e]"
          style={jakarta(400)}
        />
        <p
          id={`${id}-status`}
          role="status"
          aria-live="polite"
          className={`text-[13px] leading-[20px] ${error || notice ? '' : 'sr-only'}`}
          style={{ ...jakarta(400), color: error ? '#b13b3b' : '#007c53' }}
        >
          {error || notice}
        </p>
      </div>
      <div className="flex items-center justify-between w-full text-[16px] leading-[24px]">
        <span className="text-[#807e7e]" style={jakarta(400)}>
          {countdown}
        </span>
        <button
          type="button"
          onClick={onResend}
          aria-disabled={!canResend}
          className="text-right text-[#007c53] transition-opacity"
          style={{ ...jakarta(500), opacity: canResend ? 1 : 0.4, cursor: canResend ? 'pointer' : 'default' }}
        >
          Resend OTP
        </button>
      </div>
    </div>
  )
}
