import { useEffect, useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import authLogo from '../../assets/icons/auth-logo.svg'
import authCancel from '../../assets/icons/auth-cancel.svg'
import { accounts, describeError, stores } from '../../services/earthApi'
import { useAuth } from '../../auth/useAuth'

const jakarta = (weight: number): React.CSSProperties => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

const OTP_SECONDS = 24

interface OtpModalProps {
  /** The address the LOGIN code went to. */
  email: string
  onClose: () => void
  /** Where to go once signed in; otherwise the dashboard, or onboarding when the store is not live. */
  redirectTo?: string
}

/** Signs in with the emailed LOGIN code, then routes by store state. */
export default function OtpModal({ email, onClose, redirectTo }: OtpModalProps) {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [otp, setOtp] = useState('')
  const [seconds, setSeconds] = useState(OTP_SECONDS)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const canResend = seconds === 0 && !busy

  function tick() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  async function handleResend() {
    if (!canResend) return
    setBusy(true)
    setError('')
    try {
      await accounts.resendOtp(email, 'LOGIN')
      setNotice(`We sent a new code to ${email}.`)
      setSeconds(OTP_SECONDS)
      tick()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy(false)
    }
  }

  // Start countdown on mount
  useEffect(() => {
    tick()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  function handleOtpChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow digits only, max 6
    const raw = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(raw)
    setError('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Enter the six digits from the email.')
      inputRef.current?.focus()
      return
    }
    setBusy(true)
    setError('')
    try {
      await signIn(email, otp)
      // A seller whose store is not live yet picks up where onboarding stopped.
      let to = redirectTo ?? '/dashboard'
      if (!redirectTo) {
        const onboarding = await stores.onboarding().catch(() => null)
        if (!onboarding || onboarding.status === 'DRAFT') to = '/onboarding/store'
      }
      onClose()
      navigate(to, { replace: true })
    } catch (err) {
      setError(describeError(err))
      inputRef.current?.select()
    } finally {
      setBusy(false)
    }
  }

  // Format as "000-000"
  const displayOtp = otp.length > 3 ? `${otp.slice(0, 3)}-${otp.slice(3)}` : otp

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <form
        className="bg-white relative flex flex-col gap-[40px] p-[40px] rounded-[24px]"
        style={{ width: '480px' }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        noValidate
        aria-labelledby="otp-title"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[40px] top-[40px] flex items-center justify-center size-[24px]"
          aria-label="Close"
        >
          <img src={authCancel} alt="" className="size-[24px]" />
        </button>

        {/* Top section: logo + headings + input */}
        <div className="flex flex-col gap-[40px] items-start w-full">
          {/* Logo */}
          <img src={authLogo} alt="Earth" style={{ width: '62px', height: '64px' }} />

          {/* Heading + subtitle */}
          <div className="flex flex-col gap-[8px] w-full">
            <p id="otp-title" className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
              Check your email
            </p>
            <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
              Enter the 6-digit code that we sent to {email}.
            </p>
          </div>

          {/* OTP field + timer row */}
          <div className="flex flex-col gap-[16px] w-full">
            <div className="flex flex-col gap-[8px] w-full">
              <label
                className="text-[#101604] text-[14px] tracking-[-0.28px] leading-[24px]"
                style={jakarta(500)}
                htmlFor="otp-input"
              >
                6-digit code
              </label>
              <input
                ref={inputRef}
                id="otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={displayOtp}
                onChange={handleOtpChange}
                placeholder="000-000"
                aria-invalid={error ? true : undefined}
                aria-describedby="otp-status"
                className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] text-[14px] tracking-[-0.28px] outline-none border border-transparent focus:border-[#007c53] transition-colors"
                style={{ ...jakarta(400), color: '#101604' }}
              />
              <p
                id="otp-status"
                role="status"
                aria-live="polite"
                className={`text-[13px] leading-[20px] ${error || notice ? '' : 'sr-only'}`}
                style={{ ...jakarta(400), color: error ? '#b13b3b' : '#007c53' }}
              >
                {error || notice}
              </p>
            </div>

            {/* Countdown + Resend */}
            <div className="flex items-center justify-between w-full">
              <span className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
                {mm}:{ss}
              </span>
              <button
                type="button"
                onClick={handleResend}
                aria-disabled={!canResend}
                className="text-[16px] leading-[24px] text-right transition-opacity"
                style={{
                  ...jakarta(500),
                  color: '#007c53',
                  opacity: canResend ? 1 : 0.4,
                  cursor: canResend ? 'pointer' : 'default',
                }}
              >
                Resend OTP
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section: CTA + register */}
        <div className="flex flex-col gap-[24px] items-center w-full">
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy || undefined}
            className="flex h-[48px] items-center justify-center rounded-[30px] w-full disabled:opacity-70 disabled:cursor-wait"
            style={{ background: '#007c53' }}
          >
            <span
              className="text-[14px]"
              style={{
                ...jakarta(500),
                background: 'linear-gradient(177deg, #fff 4.99%, rgba(255,255,255,0.76) 85.73%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {busy ? 'Signing in…' : 'Log in'}
            </span>
          </button>

          <p className="text-[16px] text-[#807e7e] text-center" style={jakarta(400)}>
            New to Earth?{' '}
            <button
              type="button"
              onClick={() => {
                onClose()
                navigate('/signup')
              }}
              className="text-[#007c53]"
              style={jakarta(500)}
            >
              Register here
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
