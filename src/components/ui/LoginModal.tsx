import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from './AuthModal'
import GradientButton from './GradientButton'
import { describeError } from '../../services/earthApi'
import { useRequestOtpMutation } from '../../feature/authentication/authApiSlice'
import { jakarta } from '../../utils/styles'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface LoginModalProps {
  onClose: () => void
  /** A LOGIN code has been sent to this address; show the code step. */
  onProceed: (email: string) => void
  initialEmail?: string
}

/** Figma "log in modal" (387:2682): title, email field, Proceed, "New to Earth? Register here". */
export default function LoginModal({ onClose, onProceed, initialEmail = '' }: LoginModalProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState(initialEmail)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [requestOtp] = useRequestOtpMutation()

  async function submit(e: FormEvent) {
    e.preventDefault()
    const to = email.trim().toLowerCase()
    if (!EMAIL.test(to)) return setError('Enter a valid email address.')
    setSending(true)
    setError('')
    try {
      // The API answers "accepted" whether or not the address exists, so nobody can probe it.
      await requestOtp({ email: to, intent: 'LOGIN' }).unwrap()
      onProceed(to)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthModal onClose={onClose} onSubmit={submit} labelledBy="login-title">
      <h2 id="login-title" className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
        Sign in to unlock the
        <br />
        best of Earth
      </h2>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="login-email" className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(500)}>
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'login-error' : undefined}
          className="h-[48px] w-full rounded-[30px] bg-[#f7f7f7] px-[16px] py-[8px] text-[14px] leading-[24px] text-[#101604] outline-none border border-transparent focus:border-[#007c53] placeholder:text-[#807e7e]"
          style={jakarta(400)}
        />
        {error && (
          <p id="login-error" role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-[24px]">
        <GradientButton type="submit" className="w-full" style={{ opacity: sending ? 0.7 : 1 }}>
          {sending ? 'Sending code…' : 'Proceed'}
        </GradientButton>
        <p className="text-center text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
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
    </AuthModal>
  )
}
