import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from './AuthModal'
import GradientButton from './GradientButton'
import OtpField from './OtpField'
import { useCountdown } from './useCountdown'
import { accounts, describeError, stores } from '../../services/earthApi'
import { useAuth } from '../../auth/useAuth'
import { jakarta } from '../../utils/styles'

interface OtpModalProps {
  /** The address the LOGIN code went to. */
  email: string
  onClose: () => void
  /** Where to go once signed in; otherwise the dashboard, or onboarding when the store is not live. */
  redirectTo?: string
}

/** Figma "auth log in" (390:2921): signs in with the emailed LOGIN code, then routes by store state. */
export default function OtpModal({ email, onClose, redirectTo }: OtpModalProps) {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { seconds, label, restart } = useCountdown()
  const inputRef = useRef<HTMLInputElement>(null)
  const canResend = seconds === 0 && !busy

  async function resend() {
    if (!canResend) return
    setBusy(true)
    setError('')
    try {
      await accounts.resendOtp(email, 'LOGIN')
      setNotice(`We sent a new code to ${email}.`)
      restart()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy(false)
    }
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

  return (
    <AuthModal onClose={onClose} onSubmit={submit} labelledBy="otp-title">
      <div className="flex flex-col gap-[8px]">
        <h2 id="otp-title" className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
          Check your email
        </h2>
        <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
          Enter the 6-digit code that we sent to your email address.
        </p>
      </div>
      <OtpField
        id="otp-input"
        value={otp}
        onChange={(v) => {
          setOtp(v)
          setError('')
        }}
        error={error}
        notice={notice}
        countdown={label}
        canResend={canResend}
        onResend={resend}
        inputRef={inputRef}
      />
      <GradientButton type="submit" className="w-full" style={{ opacity: busy ? 0.7 : 1 }}>
        {busy ? 'Signing in…' : 'Log in'}
      </GradientButton>
    </AuthModal>
  )
}
