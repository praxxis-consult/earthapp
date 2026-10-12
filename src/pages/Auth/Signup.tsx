import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import farmImg from '../../assets/images/signup-farm.jpeg'
import arrowDown from '../../assets/icons/signup-arrow-down.svg'
import chevronDown24 from '../../assets/icons/signup-chevron-down-24.svg'
import chevronDown16 from '../../assets/icons/signup-chevron-down-16.svg'
import flagUs from '../../assets/icons/signup-flag-us.svg'
import checkboxUnchecked from '../../assets/icons/signup-checkbox.svg'
import LoginModal from '../../components/ui/LoginModal'
import OtpModal from '../../components/ui/OtpModal'

const jakarta = (weight: number): React.CSSProperties => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

const ACCOUNT_TYPES = ['Buyer', 'Seller', 'Both']

// ── Shared field label ──────────────────────────────────────────────────────
function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[#101604] text-[16px] leading-[24px] tracking-[-0.32px] w-full"
      style={jakarta(500)}
    >
      {children}
    </label>
  )
}

// ── Shared text input ───────────────────────────────────────────────────────
function TextInput({
  id, type = 'text', value, onChange, placeholder,
}: {
  id?: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] tracking-[-0.28px] leading-[24px] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e]"
      style={{ ...jakarta(400), color: '#101604' }}
    />
  )
}

export default function Signup() {
  const navigate = useNavigate()

  // form state
  const [accountType, setAccountType] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)

  // auth modal state (for "Log in" link)
  const [loginOpen, setLoginOpen] = useState(false)
  const [otpOpen, setOtpOpen] = useState(false)

  // close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="bg-white relative w-full h-screen overflow-hidden">

      {/* ── Right panel: farm image ─────────────────────────────────────────── */}
      <div
        className="-translate-y-1/2 absolute bg-[#e3e3e3] h-[976px] overflow-clip right-[24px] rounded-[25px] top-1/2 w-[676px]"
      >
        {/* Image — exact Figma crop: oversized, positioned by right + bottom */}
        <div
          className="absolute"
          style={{
            bottom: '-0.39px',
            right: '-112.4px',
            width: '1464.401px',
            height: '976.387px',
          }}
        >
          <img
            src={farmImg}
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          />
        </div>
        {/* Gradient overlay — centered in panel */}
        <div
          className="-translate-x-1/2 absolute bg-gradient-to-t bottom-0 from-[#101604] to-[rgba(16,22,4,0)] to-[50%] h-[976px] w-[675px]"
          style={{ left: 'calc(50% + 0.5px)' }}
        />
      </div>

      {/* ── Header: Back + Get Started ─────────────────────────────────────── */}
      <div
        className="absolute flex flex-col gap-[24px] items-start"
        style={{ left: '120px', top: '120px', width: '580px' }}
      >
        <button onClick={() => navigate(-1)} className="flex gap-[8px] items-center">
          <div className="flex items-center justify-center size-[16px] rotate-90">
            <img src={arrowDown} alt="" className="absolute block inset-0 max-w-none size-full" />
          </div>
          <span className="text-[#807e7e] text-[16px] leading-[24px] whitespace-nowrap" style={jakarta(500)}>
            Back
          </span>
        </button>

        <div className="flex flex-col gap-[8px] items-start w-full">
          <div className="flex h-[32px] items-center justify-center w-[500px]">
            <p className="text-[#101604] text-[24px] leading-[32px] w-[500px]" style={jakarta(600)}>
              Get Started
            </p>
          </div>
          <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
            Fill your details below to start trading on Earth.
          </p>
        </div>
      </div>

      {/* ── Form fields ────────────────────────────────────────────────────── */}
      <div
        className="absolute flex flex-col gap-[16px] items-start"
        style={{ left: '120px', top: '272px', width: '580px' }}
      >

        {/* Account type dropdown */}
        <div className="flex flex-col gap-[8px] w-full relative" ref={dropdownRef}>
          <FieldLabel>Account type</FieldLabel>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="bg-[#f7f7f7] flex h-[48px] items-center justify-between px-[16px] py-[8px] rounded-[30px] w-full border outline-none transition-colors"
            style={{ borderColor: dropdownOpen ? '#007c53' : 'transparent' }}
          >
            <span
              className="text-[14px] tracking-[-0.28px] leading-[24px] whitespace-nowrap"
              style={{ ...jakarta(400), color: accountType ? '#101604' : '#807e7e' }}
            >
              {accountType || 'Select account type'}
            </span>
            <img
              src={chevronDown24}
              alt=""
              className="size-[24px] shrink-0 transition-transform duration-200"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {/* Animated dropdown list */}
          <div
            className="absolute left-0 right-0 bg-white border border-[#e4dede] rounded-[16px] overflow-hidden z-30 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200 origin-top"
            style={{
              top: '80px',
              maxHeight: dropdownOpen ? '180px' : '0px',
              opacity: dropdownOpen ? 1 : 0,
              pointerEvents: dropdownOpen ? 'auto' : 'none',
              transform: dropdownOpen ? 'scaleY(1)' : 'scaleY(0.95)',
            }}
          >
            {ACCOUNT_TYPES.map((type, i) => (
              <button
                key={type}
                onClick={() => { setAccountType(type); setDropdownOpen(false) }}
                className="w-full text-left px-[16px] py-[14px] text-[14px] tracking-[-0.28px] hover:bg-[#f7f7f7] transition-colors"
                style={{
                  ...jakarta(400),
                  color: type === accountType ? '#007c53' : '#101604',
                  borderBottom: i < ACCOUNT_TYPES.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* First name + Last name */}
        <div className="flex gap-[16px] items-center w-full">
          <div className="flex flex-col gap-[8px] items-start w-[282px]">
            <FieldLabel htmlFor="first-name">First name</FieldLabel>
            <TextInput
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
            />
          </div>
          <div className="flex flex-col gap-[8px] items-start w-[282px]">
            <FieldLabel htmlFor="last-name">Last name</FieldLabel>
            <TextInput
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        {/* Email address */}
        <div className="flex flex-col gap-[8px] items-start w-full">
          <FieldLabel htmlFor="signup-email">Email address</FieldLabel>
          <TextInput
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
          />
        </div>

        {/* Phone no. (Optional) */}
        <div className="flex flex-col gap-[8px] items-start w-full">
          <p
            className="text-[#101604] text-[16px] leading-[0] tracking-[-0.32px] w-full"
            style={jakarta(500)}
          >
            <span className="leading-[24px]">Phone no. </span>
            <span className="text-[#807e7e] leading-[24px]" style={jakarta(400)}>(Optional)</span>
          </p>
          <div className="bg-[#f7f7f7] flex gap-[16px] h-[48px] items-center px-[16px] py-[8px] rounded-[30px] w-full">
            {/* Country selector */}
            <div className="flex gap-[8px] items-center shrink-0">
              <div className="flex gap-[4px] items-center">
                <div className="relative size-[24px] shrink-0">
                  <img src={flagUs} alt="" className="absolute block inset-0 max-w-none size-full" />
                </div>
                <span
                  className="text-[#807e7e] text-[14px] leading-[1.4] whitespace-nowrap text-center"
                  style={jakarta(400)}
                >
                  +1
                </span>
              </div>
              <div className="relative size-[16px] shrink-0">
                <img src={chevronDown16} alt="" className="absolute block inset-0 max-w-none size-full" />
              </div>
            </div>
            {/* Phone input */}
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="flex-1 bg-transparent text-[14px] tracking-[-0.28px] leading-[24px] outline-none min-w-0 placeholder:text-[#807e7e]"
              style={{ ...jakarta(400), color: '#101604' }}
            />
          </div>
        </div>

        {/* Terms & conditions checkbox */}
        <div className="flex gap-[8px] items-start w-full">
          <button
            onClick={() => setAgreed((a) => !a)}
            className="relative shrink-0 size-[20px] mt-[1px] outline-none"
            aria-checked={agreed}
            role="checkbox"
          >
            {agreed ? (
              /* Checked state: green fill + white tick */
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect width="20" height="20" rx="4.5" fill="#007c53" />
                <path d="M5 10.5L8.5 14L15 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <img src={checkboxUnchecked} alt="" className="absolute block inset-0 max-w-none size-full" />
            )}
          </button>
          <p className="text-[#101604] text-[14px] leading-[20px] w-[552px]" style={jakarta(400)}>
            {`By clicking "Create Account", you agree to the `}
            <button
              className="text-[#007c53] underline decoration-solid [text-underline-position:from-font] [text-decoration-skip-ink:none]"
              style={jakarta(500)}
            >
              Terms of Service
            </button>
            {' and '}
            <button
              className="text-[#007c53] underline decoration-solid [text-underline-position:from-font] [text-decoration-skip-ink:none]"
              style={jakarta(500)}
            >
              Privacy Policy
            </button>
            {' of Earth.'}
          </p>
        </div>
      </div>

      {/* ── CTA section ────────────────────────────────────────────────────── */}
      <div
        className="absolute flex flex-col gap-[24px] items-center"
        style={{ left: '120px', top: '760px', width: '580px' }}
      >
        <button
          onClick={() => navigate('/signup/verify')}
          className="border border-[#789ebb] flex h-[48px] items-center justify-center overflow-clip px-[24px] py-[8px] rounded-[30px] w-full"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgb(0,124,83) 0%, rgb(0,124,83) 100%), linear-gradient(176.5deg, rgb(117,163,199) 8.078%, rgb(48,94,130) 78.737%)',
          }}
        >
          <span
            className="bg-clip-text text-[14px] text-transparent text-center whitespace-nowrap"
            style={{
              ...jakarta(500),
              backgroundImage:
                'linear-gradient(178.92deg, rgb(255,255,255) 4.9851%, rgba(255,255,255,0.76) 85.731%)',
            }}
          >
            Create Account
          </span>
        </button>

        <p
          className="text-[0px] text-[#807e7e] text-center leading-[0] w-full"
          style={jakarta(400)}
        >
          <span className="text-[16px] leading-[24px]">Have an account already?</span>
          <span className="text-[16px] leading-[24px]">{' '}</span>
          <button
            onClick={() => setLoginOpen(true)}
            className="text-[16px] leading-[24px] text-[#007c53]"
            style={jakarta(500)}
          >
            Log in
          </button>
        </p>
      </div>

      {/* ── Auth modals (for "Log in" link) ──────────────────────────────── */}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onProceed={() => { setLoginOpen(false); setOtpOpen(true) }}
        />
      )}
      {otpOpen && <OtpModal onClose={() => setOtpOpen(false)} />}
    </div>
  )
}
