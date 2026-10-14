import { useEffect, useState, useRef, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import otpBg from '../../assets/images/signup-otp-bg.png'
import arrowDown from '../../assets/icons/signup-arrow-down.svg'
import AccountCreatedModal from '../../components/ui/AccountCreatedModal'
import OtpModal from '../../components/ui/OtpModal'
import { accounts, describeError } from '../../services/earthApi'

const jakarta = (weight: number): React.CSSProperties => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

const OTP_SECONDS = 24

function BackArrow() {
  return (
    <div className="flex items-center justify-center relative shrink-0 size-[16px]">
      <div className="flex-none rotate-90">
        <div className="relative size-[16px]">
          <img src={arrowDown} alt="" className="absolute block inset-0 max-w-none size-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Confirms a new account with the ACCOUNT_CONFIRMATION code. The API does not sign the person in
 * on confirmation, so "Setup store" requests a LOGIN code and shows the sign-in code step before
 * onboarding opens.
 */
export default function SignupOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email ?? ''

  const [otp, setOtp] = useState('')
  const [seconds, setSeconds] = useState(OTP_SECONDS)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showAccountCreated, setShowAccountCreated] = useState(false)
  const [loginOtpOpen, setLoginOtpOpen] = useState(false)
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
      await accounts.resendOtp(email, 'ACCOUNT_CONFIRMATION')
      setNotice(`We sent a new code to ${email}.`)
      setSeconds(OTP_SECONDS)
      tick()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    tick()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!email) return <Navigate to="/signup" replace />

  function handleOtpChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      await accounts.confirm(email, otp)
      setShowAccountCreated(true)
    } catch (err) {
      setError(describeError(err))
      inputRef.current?.select()
    } finally {
      setBusy(false)
    }
  }

  async function setupStore() {
    setShowAccountCreated(false)
    setBusy(true)
    try {
      await accounts.requestOtp(email, 'LOGIN')
    } catch (err) {
      // A code may already be on its way (rate limit); the sign-in step can resend.
      setNotice(describeError(err))
    } finally {
      setBusy(false)
    }
    setLoginOtpOpen(true)
  }

  const displayOtp = otp.length > 3 ? `${otp.slice(0, 3)}-${otp.slice(3)}` : otp
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <>
      {showAccountCreated && (
        <AccountCreatedModal onSetupStore={setupStore} onClose={() => setShowAccountCreated(false)} />
      )}
      {loginOtpOpen && <OtpModal email={email} redirectTo="/onboarding/store" onClose={() => setLoginOtpOpen(false)} />}
      <form className="bg-white w-full h-screen overflow-hidden" onSubmit={submit} noValidate>
        {/* ── Max-width container ── */}
        <div className="max-w-[1440px] mx-auto relative h-full">
          {/* ── Right panel: quarry image ──────────────────────────────────────── */}
          <div className="-translate-y-1/2 absolute bg-[#e3e3e3] h-[976px] overflow-clip right-[24px] rounded-[25px] top-1/2 w-[676px]">
            {/* Image — centered, slightly taller than panel */}
            <div
              className="-translate-x-1/2 absolute"
              style={{ bottom: '-0.38px', left: 'calc(50% + 0.5px)', width: '675px', height: '1012.376px' }}
            >
              <img
                src={otpBg}
                alt=""
                className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
              />
            </div>
            {/* Gradient */}
            <div
              className="-translate-x-1/2 absolute bg-gradient-to-t bottom-0 from-[#101604] to-[rgba(16,22,4,0)] to-[50%] h-[976px] w-[675px]"
              style={{ left: 'calc(50% + 0.5px)' }}
            />
          </div>

          {/* ── Header ────────────────────────────────────────────────────────── */}
          <div
            className="absolute flex flex-col gap-[24px] items-start"
            style={{ left: '120px', top: '120px', width: '580px' }}
          >
            <button type="button" onClick={() => navigate(-1)} className="flex gap-[8px] items-center">
              <BackArrow />
              <span className="text-[#807e7e] text-[16px] leading-[24px] whitespace-nowrap" style={jakarta(500)}>
                Back
              </span>
            </button>

            <div className="flex flex-col gap-[8px] items-start w-full">
              <div className="flex h-[32px] items-center justify-center w-[500px]">
                <p className="text-[#101604] text-[24px] leading-[32px] w-[500px]" style={jakarta(600)}>
                  Authentication
                </p>
              </div>
              <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
                Enter the 6-digit code that we sent to {email}.
              </p>
            </div>
          </div>

          {/* ── OTP field + timer ─────────────────────────────────────────────── */}
          <div
            className="absolute flex flex-col gap-[16px] items-start"
            style={{ left: '120px', top: '272px', width: '580px' }}
          >
            <div className="flex flex-col gap-[8px] items-start w-full">
              <label
                htmlFor="signup-otp"
                className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] w-full"
                style={jakarta(500)}
              >
                6-digit code
              </label>
              <input
                ref={inputRef}
                id="signup-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={displayOtp}
                onChange={handleOtpChange}
                placeholder="000-000"
                aria-invalid={error ? true : undefined}
                aria-describedby="signup-otp-status"
                className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] tracking-[-0.28px] leading-[24px] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e] whitespace-nowrap"
                style={{ ...jakarta(400), color: '#101604' }}
              />
              <p
                id="signup-otp-status"
                role="status"
                aria-live="polite"
                className={`text-[13px] leading-[20px] ${error || notice ? '' : 'sr-only'}`}
                style={{ ...jakarta(400), color: error ? '#b13b3b' : '#007c53' }}
              >
                {error || notice}
              </p>
            </div>

            {/* Timer + Resend */}
            <div className="flex items-center justify-between w-full whitespace-nowrap text-[16px] leading-[24px]">
              <span className="text-[#807e7e]" style={jakarta(400)}>
                {mm}:{ss}
              </span>
              <button
                type="button"
                onClick={handleResend}
                aria-disabled={!canResend}
                className="text-right transition-opacity duration-300"
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

          {/* ── Proceed button ────────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy || undefined}
            className="absolute border border-[#789ebb] flex h-[48px] items-center justify-center overflow-clip px-[24px] py-[8px] rounded-[30px] disabled:opacity-70 disabled:cursor-wait"
            style={{
              left: '120px',
              top: '456px',
              width: '580px',
              backgroundImage:
                'linear-gradient(90deg,rgb(0,124,83) 0%,rgb(0,124,83) 100%),linear-gradient(176.5deg,rgb(117,163,199) 8.078%,rgb(48,94,130) 78.737%)',
            }}
          >
            <span
              className="bg-clip-text text-[14px] text-transparent text-center whitespace-nowrap"
              style={{
                ...jakarta(500),
                backgroundImage: 'linear-gradient(178.06deg,rgb(255,255,255) 4.9851%,rgba(255,255,255,0.76) 85.731%)',
              }}
            >
              {busy ? 'Checking…' : 'Proceed'}
            </span>
          </button>
        </div>
        {/* end max-width container */}
      </form>
    </>
  )
}
