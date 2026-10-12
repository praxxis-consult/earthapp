import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authLogo from '../../assets/icons/auth-logo.svg'
import authCancel from '../../assets/icons/auth-cancel.svg'

const jakarta = (weight: number): React.CSSProperties => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

interface LoginModalProps {
  onClose: () => void
  onProceed: () => void
}

export default function LoginModal({ onClose, onProceed }: LoginModalProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white relative flex flex-col p-[40px] rounded-[24px]"
        style={{ width: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-[40px] top-[40px] flex items-center justify-center size-[24px]"
          aria-label="Close"
        >
          <img src={authCancel} alt="" className="size-[24px]" />
        </button>

        {/* Logo */}
        <img
          src={authLogo}
          alt="Earth"
          className="mb-[24px]"
          style={{ width: '64px', height: '62px' }}
        />

        {/* Heading */}
        <p
          className="text-[#101604] text-[24px] tracking-[-0.48px] leading-[1.3] mb-[32px]"
          style={{ ...jakarta(600), width: '320px' }}
        >
          Sign in to unlock the best of Earth
        </p>

        {/* Email field */}
        <div className="flex flex-col gap-[8px] w-full mb-[16px]">
          <label
            className="text-[#101604] text-[14px]"
            style={jakarta(500)}
            htmlFor="login-email"
          >
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] text-[14px] outline-none border border-transparent focus:border-[#007c53] transition-colors"
            style={{ ...jakarta(400), color: '#101604' }}
          />
        </div>

        {/* Proceed button */}
        <button
          onClick={onProceed}
          className="flex h-[48px] items-center justify-center rounded-[30px] w-full mb-[20px]"
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
            Proceed
          </span>
        </button>

        {/* Register link */}
        <p className="text-center text-[14px] text-[#807e7e]" style={jakarta(400)}>
          New to Earth?{' '}
          <button
            onClick={() => { onClose(); navigate('/signup') }}
            className="text-[#007c53]"
            style={jakarta(600)}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  )
}
