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

// ── Data ─────────────────────────────────────────────────────────────────────

const ACCOUNT_TYPES = ['Buyer', 'Seller', 'Both']

const COUNTRIES = [
  { code: '+1',   flag: '🇺🇸', name: 'United States',  flagSvg: flagUs },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom', flagSvg: null },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria',         flagSvg: null },
  { code: '+1',   flag: '🇨🇦', name: 'Canada',          flagSvg: null },
  { code: '+61',  flag: '🇦🇺', name: 'Australia',       flagSvg: null },
  { code: '+49',  flag: '🇩🇪', name: 'Germany',         flagSvg: null },
  { code: '+33',  flag: '🇫🇷', name: 'France',          flagSvg: null },
  { code: '+91',  flag: '🇮🇳', name: 'India',           flagSvg: null },
  { code: '+86',  flag: '🇨🇳', name: 'China',           flagSvg: null },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil',          flagSvg: null },
]

// ── Shared primitives ─────────────────────────────────────────────────────────

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

function TextInput({
  id, type = 'text', value, onChange, placeholder,
}: {
  id?: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
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

// ── Back arrow icon (matches Figma structure exactly) ─────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

export default function Signup() {
  const navigate = useNavigate()

  const [accountType,    setAccountType]    = useState('')
  const [accountOpen,    setAccountOpen]    = useState(false)
  const [firstName,      setFirstName]      = useState('')
  const [lastName,       setLastName]       = useState('')
  const [email,          setEmail]          = useState('')
  const [phone,          setPhone]          = useState('')
  const [country,        setCountry]        = useState(COUNTRIES[0])
  const [countryOpen,    setCountryOpen]    = useState(false)
  const [agreed,         setAgreed]         = useState(false)
  const [loginOpen,      setLoginOpen]      = useState(false)
  const [otpOpen,        setOtpOpen]        = useState(false)

  const accountRef = useRef<HTMLDivElement>(null)
  const countryRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  return (
    <div className="bg-white w-full h-screen overflow-hidden">
      {/* ── Max-width container ── */}
      <div className="max-w-[1440px] mx-auto relative h-full">

        {/* ── Right panel ──────────────────────────────────────────────────── */}
        <div className="-translate-y-1/2 absolute bg-[#e3e3e3] h-[976px] overflow-clip right-[24px] rounded-[25px] top-1/2 w-[676px]">
          {/* Farm image — exact Figma crop coordinates */}
          <div
            className="absolute"
            style={{ bottom: '-0.39px', right: '-112.4px', width: '1464.401px', height: '976.387px' }}
          >
            <img src={farmImg} alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" />
          </div>
          {/* Gradient overlay */}
          <div
            className="-translate-x-1/2 absolute bg-gradient-to-t bottom-0 from-[#101604] to-[rgba(16,22,4,0)] to-[50%] h-[976px] w-[675px]"
            style={{ left: 'calc(50% + 0.5px)' }}
          />
        </div>

        {/* ── Header: Back + title ─────────────────────────────────────────── */}
        <div
          className="absolute flex flex-col gap-[24px] items-start"
          style={{ left: '120px', top: '120px', width: '580px' }}
        >
          <button onClick={() => navigate(-1)} className="flex gap-[8px] items-center">
            <BackArrow />
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

        {/* ── Form fields ──────────────────────────────────────────────────── */}
        <div
          className="absolute flex flex-col gap-[16px] items-start"
          style={{ left: '120px', top: '272px', width: '580px' }}
        >

          {/* Account type */}
          <div className="flex flex-col gap-[8px] w-full relative" ref={accountRef}>
            <FieldLabel>Account type</FieldLabel>
            <button
              onClick={() => setAccountOpen((o) => !o)}
              className="bg-[#f7f7f7] flex h-[48px] items-center justify-between px-[16px] py-[8px] rounded-[30px] w-full border outline-none transition-colors"
              style={{ borderColor: accountOpen ? '#007c53' : 'transparent' }}
            >
              <span
                className="text-[14px] tracking-[-0.28px] leading-[24px] whitespace-nowrap"
                style={{ ...jakarta(400), color: accountType ? '#101604' : '#807e7e' }}
              >
                {accountType || 'Select account type'}
              </span>
              <div className="relative shrink-0 size-[24px]">
                <img
                  src={chevronDown24}
                  alt=""
                  className="absolute block inset-0 max-w-none size-full transition-transform duration-200"
                  style={{ transform: accountOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </div>
            </button>

            {/* Animated dropdown */}
            <div
              className="absolute left-0 right-0 bg-white border border-[#e4dede] rounded-[16px] overflow-hidden z-30 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200 origin-top"
              style={{
                top: '80px',
                maxHeight: accountOpen ? '180px' : '0px',
                opacity: accountOpen ? 1 : 0,
                transform: accountOpen ? 'scaleY(1)' : 'scaleY(0.96)',
                pointerEvents: accountOpen ? 'auto' : 'none',
              }}
            >
              {ACCOUNT_TYPES.map((type, i) => (
                <button
                  key={type}
                  onClick={() => { setAccountType(type); setAccountOpen(false) }}
                  className="w-full text-left px-[16px] py-[14px] text-[14px] tracking-[-0.28px] leading-[24px] hover:bg-[#f7f7f7] transition-colors"
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

          {/* Email */}
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

          {/* Phone */}
          <div className="flex flex-col gap-[8px] items-start w-full">
            <p className="text-[#101604] text-[16px] leading-[0] tracking-[-0.32px] w-full" style={jakarta(500)}>
              <span className="leading-[24px]">Phone no. </span>
              <span className="text-[#807e7e] leading-[24px]" style={jakarta(400)}>(Optional)</span>
            </p>
            <div className="bg-[#f7f7f7] flex gap-[16px] h-[48px] items-center px-[16px] py-[8px] rounded-[30px] w-full relative">

              {/* Country code selector */}
              <div ref={countryRef} className="relative shrink-0">
                <button
                  onClick={() => setCountryOpen((o) => !o)}
                  className="flex gap-[8px] items-center outline-none"
                >
                  <div className="flex gap-[4px] items-center">
                    {country.flagSvg ? (
                      <div className="relative shrink-0 size-[24px]">
                        <img src={country.flagSvg} alt="" className="absolute block inset-0 max-w-none size-full" />
                      </div>
                    ) : (
                      <span className="text-[20px] leading-none">{country.flag}</span>
                    )}
                    <span className="text-[#807e7e] text-[14px] leading-[1.4] whitespace-nowrap text-center" style={jakarta(400)}>
                      {country.code}
                    </span>
                  </div>
                  <div className="relative shrink-0 size-[16px]">
                    <img
                      src={chevronDown16}
                      alt=""
                      className="absolute block inset-0 max-w-none size-full transition-transform duration-200"
                      style={{ transform: countryOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </div>
                </button>

                {/* Country dropdown */}
                <div
                  className="absolute left-0 bg-white border border-[#e4dede] rounded-[16px] overflow-y-auto z-40 shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-all duration-200 origin-top"
                  style={{
                    top: '36px',
                    width: '220px',
                    maxHeight: countryOpen ? '280px' : '0px',
                    opacity: countryOpen ? 1 : 0,
                    transform: countryOpen ? 'scaleY(1)' : 'scaleY(0.96)',
                    pointerEvents: countryOpen ? 'auto' : 'none',
                  }}
                >
                  {COUNTRIES.map((c, i) => (
                    <button
                      key={`${c.name}-${i}`}
                      onClick={() => { setCountry(c); setCountryOpen(false) }}
                      className="w-full flex items-center gap-[10px] px-[14px] py-[12px] hover:bg-[#f7f7f7] transition-colors text-left"
                      style={{ borderBottom: i < COUNTRIES.length - 1 ? '1px solid #f5f5f5' : 'none' }}
                    >
                      <span className="text-[18px] leading-none shrink-0">{c.flag}</span>
                      <span className="text-[13px] text-[#101604] flex-1 truncate" style={jakarta(400)}>{c.name}</span>
                      <span className="text-[13px] text-[#807e7e] shrink-0" style={jakarta(500)}>{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone input */}
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="flex-1 bg-transparent text-[14px] tracking-[-0.28px] leading-[24px] outline-none min-w-0 placeholder:text-[#807e7e] whitespace-nowrap"
                style={{ ...jakarta(400), color: '#101604' }}
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex gap-[8px] items-start w-full">
            <button
              onClick={() => setAgreed((a) => !a)}
              className="relative shrink-0 size-[20px] mt-[1px] outline-none"
              role="checkbox"
              aria-checked={agreed}
            >
              {agreed ? (
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
                className="text-[#007c53] underline decoration-solid"
                style={jakarta(500)}
              >
                Terms of Service
              </button>
              {' and '}
              <button
                className="text-[#007c53] underline decoration-solid"
                style={jakarta(500)}
              >
                Privacy Policy
              </button>
              {' of Earth.'}
            </p>
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <div
          className="absolute flex flex-col gap-[24px] items-center"
          style={{ left: '120px', top: '760px', width: '580px' }}
        >
          <button
            onClick={() => navigate('/signup/verify')}
            className="border border-[#789ebb] flex h-[48px] items-center justify-center overflow-clip px-[24px] py-[8px] rounded-[30px] w-full"
            style={{
              backgroundImage:
                'linear-gradient(90deg,rgb(0,124,83) 0%,rgb(0,124,83) 100%),linear-gradient(176.5deg,rgb(117,163,199) 8.078%,rgb(48,94,130) 78.737%)',
            }}
          >
            <span
              className="bg-clip-text text-[14px] text-transparent text-center whitespace-nowrap"
              style={{
                ...jakarta(500),
                backgroundImage:
                  'linear-gradient(178.92deg,rgb(255,255,255) 4.9851%,rgba(255,255,255,0.76) 85.731%)',
              }}
            >
              Create Account
            </span>
          </button>

          <p className="text-[#807e7e] text-[16px] leading-[24px] text-center w-full" style={jakarta(400)}>
            Have an account already?{' '}
            <button onClick={() => setLoginOpen(true)} className="text-[#007c53]" style={jakarta(500)}>
              Log in
            </button>
          </p>
        </div>

      </div>{/* end max-width container */}

      {/* Auth modals */}
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
