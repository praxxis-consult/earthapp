import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import authLogo from '../../assets/icons/auth-logo.svg'
import authCancel from '../../assets/icons/auth-cancel.svg'
import { accounts, describeError } from '../../services/earthApi'

const jakarta = (weight: number): React.CSSProperties => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface LoginModalProps {
  onClose: () => void
  /** A LOGIN code has been sent to this address; show the code step. */
  onProceed: (email: string) => void
  initialEmail?: string
}

export default function LoginModal({ onClose, onProceed, initialEmail = '' }: LoginModalProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState(initialEmail)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e: FormEvent) {
    e.preventDefault()
    const to = email.trim().toLowerCase()
    if (!EMAIL.test(to)) {
      setError('Enter a valid email address.')
      return
    }
    setSending(true)
    setError('')
    try {
      // The API answers "accepted" whether or not the address exists, so nobody can probe it.
      await accounts.requestOtp(to, 'LOGIN')
      onProceed(to)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <form
        className="bg-white relative flex flex-col p-[40px] rounded-[24px]"
        style={{ width: '480px' }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        noValidate
        aria-labelledby="login-title"
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

        {/* Logo */}
        <img src={authLogo} alt="Earth" className="mb-[24px]" style={{ width: '64px', height: '62px' }} />

        {/* Heading */}
        <p
          id="login-title"
          className="text-[#101604] text-[24px] tracking-[-0.48px] leading-[1.3] mb-[32px]"
          style={{ ...jakarta(600), width: '320px' }}
        >
          Sign in to unlock the best of Earth
        </p>

        {/* Email field */}
        <div className="flex flex-col gap-[8px] w-full mb-[16px]">
          <label className="text-[#101604] text-[14px]" style={jakarta(500)} htmlFor="login-email">
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
            className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] text-[14px] outline-none border border-transparent focus:border-[#007c53] transition-colors"
            style={{ ...jakarta(400), color: '#101604' }}
          />
          {error && (
            <p id="login-error" role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
              {error}
            </p>
          )}
        </div>

        {/* Proceed button */}
        <button
          type="submit"
          disabled={sending}
          aria-busy={sending || undefined}
          className="flex h-[48px] items-center justify-center rounded-[30px] w-full mb-[20px] disabled:opacity-70 disabled:cursor-wait"
          style={{ background: '#007c53' }}
        >
          <span
            className="text-[14px]"
            style={{
              ...jakarta(600),
              background: 'linear-gradient(178.5deg, #fff 4.99%, rgba(255,255,255,0.86) 85.73%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {sending ? 'Sending code…' : 'Proceed'}
          </span>
        </button>

        {/* Register link */}
        <p className="text-center text-[14px] text-[#807e7e]" style={jakarta(400)}>
          New to Earth?{' '}
          <button
            type="button"
            onClick={() => {
              onClose()
              navigate('/signup')
            }}
            className="text-[#007c53]"
            style={jakarta(600)}
          >
            Register here
          </button>
        </p>
      </form>
    </div>
  )
}
