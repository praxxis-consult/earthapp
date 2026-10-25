import { useRef, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import { BackButton } from '../../components/layout/OnboardingHeader'
import AccountCreatedModal from '../../components/ui/AccountCreatedModal'
import GradientButton from '../../components/ui/GradientButton'
import OtpField from '../../components/ui/OtpField'
import { useCountdown } from '../../components/ui/useCountdown'
import OtpModal from '../../components/ui/OtpModal'
import otpBg from '../../assets/images/signup-otp-bg.png'
import { describeError, type AccountType } from '../../services/earthApi'
import { useConfirmAccountMutation, useRequestOtpMutation, useResendOtpMutation } from '../../feature/authentication/authApiSlice'
import { useAuth } from '../../feature/authentication/useAuth'
import { jakarta } from '../../utils/styles'

/**
 * Figma "create acc auth" (394:3195). Confirms a new account with the ACCOUNT_CONFIRMATION code.
 * Since 25 October the first confirmation signs the person in, so the modal's button goes straight
 * to onboarding (a seller) or the dashboard (a buyer); a confirmation that answered without
 * credentials (a replay) still falls back to the LOGIN code step.
 */
export default function SignupOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { email?: string; accountType?: AccountType } | null
  const email = state?.email ?? ''
  // A buying account has no store to set up: it goes straight to its dashboard.
  const seller = state?.accountType !== 'BUYING'

  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showAccountCreated, setShowAccountCreated] = useState(false)
  const [loginOtpOpen, setLoginOtpOpen] = useState(false)
  const { seconds, label, restart } = useCountdown()
  const inputRef = useRef<HTMLInputElement>(null)
  const [resendOtp] = useResendOtpMutation()
  const [confirmAccount] = useConfirmAccountMutation()
  const [requestOtp] = useRequestOtpMutation()
  const { status: authStatus, reload } = useAuth()
  const signedIn = authStatus === 'authenticated'
  const canResend = seconds === 0 && !busy

  if (!email) return <Navigate to="/signup" replace />

  async function resend() {
    if (!canResend) return
    setBusy(true)
    setError('')
    try {
      await resendOtp({ email, intent: 'ACCOUNT_CONFIRMATION' }).unwrap()
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
      const res = await confirmAccount({ email, code: otp }).unwrap()
      // A first confirmation answers credentials: the account is read so the session stands before the modal's button is pressed.
      if (res.accessToken) await reload().catch(() => {})
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
    if (signedIn) return navigate(seller ? '/onboarding/store' : '/dashboard', { replace: true })
    setBusy(true)
    try {
      await requestOtp({ email, intent: 'LOGIN' }).unwrap()
    } catch (err) {
      // A code may already be on its way (rate limit); the sign-in step can resend.
      setNotice(describeError(err))
    } finally {
      setBusy(false)
    }
    setLoginOtpOpen(true)
  }

  return (
    <>
      {showAccountCreated && <AccountCreatedModal seller={seller} onContinue={setupStore} onClose={() => setShowAccountCreated(false)} />}
      {loginOtpOpen && <OtpModal email={email} redirectTo={seller ? '/onboarding/store' : '/dashboard'} onClose={() => setLoginOtpOpen(false)} />}
      <AuthLayout images={[{ src: otpBg, className: 'object-top' }]}>
        <form onSubmit={submit} noValidate>
          <div className="flex flex-col gap-[24px] items-start">
            <BackButton onClick={() => navigate(-1)} />
            <div className="flex flex-col gap-[8px] items-start w-full">
              <h1 className="text-[#101604] text-[24px] leading-[32px] max-w-[500px]" style={jakarta(600)}>
                Authentication
              </h1>
              <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
                Enter the 6-digit code that we sent to your provided email address.
              </p>
            </div>
          </div>

          <div className="mt-[40px]">
            <OtpField
              id="signup-otp"
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
          </div>

          <GradientButton type="submit" className="mt-[64px] w-full" style={{ opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Checking…' : 'Proceed'}
          </GradientButton>
        </form>
      </AuthLayout>
    </>
  )
}
