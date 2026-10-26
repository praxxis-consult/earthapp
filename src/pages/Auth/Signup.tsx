import { useState, type FormEvent, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import { BackButton } from '../../components/layout/OnboardingHeader'
import FormDropdown from '../../components/ui/FormDropdown'
import GradientButton from '../../components/ui/GradientButton'
import SignInDialogs from '../../components/ui/SignInDialogs'
import { MenuItem, MenuList } from '../../components/ui/SelectorMenu'
import { useMenu } from '../../components/ui/useMenu'
import farmImg from '../../assets/images/signup-farm.jpeg'
import chevronDown16 from '../../assets/icons/signup-chevron-down-16.svg'
import flagUs from '../../assets/icons/signup-flag-us.svg'
import checkboxOn from '../../assets/icons/checkbox-on.svg'
import checkboxOff from '../../assets/icons/checkbox-off.svg'
import gpsIcon from '../../assets/icons/su-gps.svg'
import { rememberSignupAddress, type SignupAddress } from '../../lib/signupAddress'
import type { GeoAddress } from '../../lib/geocode'

const MapPickerDialog = lazy(() => import('../../components/ui/MapPickerDialog'))
import { describeError, toApiError, type AccountType } from '../../services/earthApi'
import { REFERRAL_KEY } from './ReferralLanding'
import { useCreateAccountMutation } from '../../feature/authentication/authApiSlice'
import { jakarta } from '../../utils/styles'

/** The account-type menu (805:7532): Buyer or Seller. An account that does both is a seller who buys. */
const ACCOUNT_TYPES = ['Buyer', 'Seller']
const ACCOUNT_TYPE_API: Record<string, AccountType> = { Buyer: 'BUYING', Seller: 'SELLING' }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** The API's field paths, mapped to sentences a person can act on. */
const FIELD_MESSAGES: Record<string, string> = {
  accountType: 'Choose an account type.',
  firstName: 'Enter your first name.',
  lastName: 'Enter your last name.',
  email: 'Enter a valid email address.',
  phoneNumber: 'Enter a valid phone number.',
  termsConsent: 'You need to agree to the terms to continue.',
}

const DIAL_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'United States', flagSvg: flagUs },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria', flagSvg: null },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom', flagSvg: null },
  { code: '+1', flag: '🇨🇦', name: 'Canada', flagSvg: null },
  { code: '+233', flag: '🇬🇭', name: 'Ghana', flagSvg: null },
  { code: '+254', flag: '🇰🇪', name: 'Kenya', flagSvg: null },
  { code: '+27', flag: '🇿🇦', name: 'South Africa', flagSvg: null },
  { code: '+61', flag: '🇦🇺', name: 'Australia', flagSvg: null },
  { code: '+49', flag: '🇩🇪', name: 'Germany', flagSvg: null },
  { code: '+33', flag: '🇫🇷', name: 'France', flagSvg: null },
  { code: '+91', flag: '🇮🇳', name: 'India', flagSvg: null },
  { code: '+86', flag: '🇨🇳', name: 'China', flagSvg: null },
  { code: '+55', flag: '🇧🇷', name: 'Brazil', flagSvg: null },
]

const LABEL = 'text-[#101604] text-[16px] leading-[24px] w-full'
const INPUT =
  'bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] leading-[24px] text-[#101604] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e] aria-[invalid=true]:border-[#b13b3b]'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
      {message}
    </p>
  )
}

function TextField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  error?: string
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-[8px] items-start w-full min-w-0">
      <label htmlFor={id} className={LABEL} style={jakarta(500)}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={INPUT}
        style={jakarta(400)}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

/**
 * Figma "create acc" (805:7443, formerly 393:2975): Back + "Get Started" at 120/120, the form 40px below (account
 * type, first and last name side by side, email, phone with a dial-code picker, the terms
 * checkbox), then "Create Account" 64px below and "Have an account already? Log in".
 */
export default function Signup() {
  const navigate = useNavigate()
  const [accountType, setAccountType] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  // Address and landmark (create acc 805:7443, 828:27004/27013): the API's account has no fields for them yet, so they are kept for the first address the buyer needs.
  const [street, setStreet] = useState('')
  const [landmark, setLandmark] = useState('')
  // What the map pin resolved beyond the street line (area, state, postal code), kept with the sign-up address.
  const [pinned, setPinned] = useState<Pick<SignupAddress, 'area' | 'region' | 'postalCode'>>({})
  const [mapOpen, setMapOpen] = useState(false)
  function fromMap(a: GeoAddress) {
    setMapOpen(false)
    setStreet([a.street, a.area, a.region].filter(Boolean).join(', '))
    setPinned({ area: a.area, region: a.region, postalCode: a.postalCode })
    if (a.landmark && !landmark) setLandmark(a.landmark)
  }
  const [dial, setDial] = useState(DIAL_CODES[0])
  const [agreed, setAgreed] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const { open: dialOpen, setOpen: setDialOpen, ref: dialRef } = useMenu()
  const [submitAccount] = useCreateAccountMutation()
  const referralHandle = (() => {
    try {
      return sessionStorage.getItem(REFERRAL_KEY) ?? ''
    } catch {
      return ''
    }
  })()

  async function createAccount(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!ACCOUNT_TYPE_API[accountType]) next.accountType = FIELD_MESSAGES.accountType
    if (!firstName.trim()) next.firstName = FIELD_MESSAGES.firstName
    if (!lastName.trim()) next.lastName = FIELD_MESSAGES.lastName
    if (!EMAIL.test(email.trim())) next.email = FIELD_MESSAGES.email
    const digits = phone.replace(/\D/g, '')
    // The phone is optional, as the field says; a typed one must be a usable number.
    if (digits && digits.replace(/^0+/, '').length < 6) next.phoneNumber = FIELD_MESSAGES.phoneNumber
    if (!agreed) next.termsConsent = FIELD_MESSAGES.termsConsent
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      await submitAccount({
        accountType: ACCOUNT_TYPE_API[accountType],
        firstName: firstName.trim().slice(0, 100),
        lastName: lastName.trim().slice(0, 100),
        email: email.trim().toLowerCase(),
        phoneNumber: digits ? `${dial.code}${digits.replace(/^0+/, '')}` : null,
        termsConsent: true,
        // Who sent them: the handle the /r/ link kept, if any.
        ...(referralHandle ? { referralHandle } : {}),
        // The address and landmark go with the account as a draft (the API's limits are 500 and 240 characters).
        ...(street.trim() ? { address: street.trim().slice(0, 500) } : {}),
        ...(landmark.trim() ? { landmark: landmark.trim().slice(0, 240) } : {}),
      }).unwrap()
      rememberSignupAddress({ street: pinned.region ? street.split(',')[0] : street, landmark, ...pinned })
      navigate('/signup/verify', { state: { email: email.trim().toLowerCase(), accountType: ACCOUNT_TYPE_API[accountType] } })
    } catch (err) {
      const e = toApiError(err)
      if (e.status === 400 && e.errors.length) {
        const mapped: Record<string, string> = {}
        for (const [path] of Object.entries(e.fieldErrors)) mapped[path] = FIELD_MESSAGES[path] ?? 'Check this field.'
        setErrors(mapped)
        setFormError(Object.keys(mapped).length ? '' : describeError(err))
      } else if (e.status === 409) {
        setFormError('An account already exists for this email.')
      } else {
        setFormError(describeError(err))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout images={[{ src: farmImg, className: 'object-[64%_100%]' }]}>
      <form onSubmit={createAccount} noValidate>
        <div className="flex flex-col gap-[24px] items-start">
          <BackButton onClick={() => navigate(-1)} />
          <div className="flex flex-col gap-[8px] items-start w-full">
            <h1 className="text-[#101604] text-[24px] leading-[32px] max-w-[500px]" style={jakarta(600)}>
              Get Started
            </h1>
            <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
              Fill your details below to start trading on Earth.
            </p>
          </div>
        </div>

        <div className="mt-[40px] flex flex-col gap-[16px] items-start">
          <div className="flex flex-col gap-[8px] w-full">
            <FormDropdown
              id="account-type"
              label="Account type"
              labelSize={16}
              value={accountType}
              placeholder="Select account type"
              options={ACCOUNT_TYPES}
              onSelect={setAccountType}
            />
            <FieldError id="account-type-error" message={errors.accountType} />
          </div>

          <div className="flex gap-[16px] items-start w-full max-sm:flex-col">
            <TextField id="first-name" label="First name" value={firstName} onChange={setFirstName} placeholder="Enter your first name" autoComplete="given-name" error={errors.firstName} />
            <TextField id="last-name" label="Last name" value={lastName} onChange={setLastName} placeholder="Enter your last name" autoComplete="family-name" error={errors.lastName} />
          </div>

          <TextField id="signup-email" label="Email address" type="email" value={email} onChange={setEmail} placeholder="Enter your email address" autoComplete="email" error={errors.email} />

          {/* Phone (394:3151): the field holds the dial code (flag 24, code 14/19.6, chevron 16) 16px before the number */}
          <div className="flex flex-col gap-[8px] items-start w-full">
            <label htmlFor="signup-phone" className={LABEL} style={jakarta(500)}>
              Phone no. (Optional)
            </label>
            <div className="bg-[#f7f7f7] flex gap-[16px] h-[48px] items-center px-[16px] py-[8px] rounded-[30px] w-full">
              <div ref={dialRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setDialOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={dialOpen}
                  aria-label={`Dial code ${dial.code}, ${dial.name}`}
                  className="flex gap-[8px] items-center"
                >
                  <span className="flex gap-[4px] items-center">
                    {dial.flagSvg ? (
                      <img src={dial.flagSvg} alt="" className="size-[24px]" />
                    ) : (
                      <span className="flex size-[24px] items-center justify-center text-[20px] leading-none">{dial.flag}</span>
                    )}
                    <span className="text-[#807e7e] text-[14px] leading-[20px]" style={jakarta(400)}>
                      {dial.code}
                    </span>
                  </span>
                  <img
                    src={chevronDown16}
                    alt=""
                    className="size-[16px] transition-transform duration-200"
                    style={{ transform: dialOpen ? 'rotate(180deg)' : 'none' }}
                  />
                </button>
                {dialOpen && (
                  <MenuList className="absolute left-[-16px] top-[40px] z-30" width={280}>
                    {DIAL_CODES.map((c) => (
                      <MenuItem
                        key={c.name}
                        label={`${c.flag} ${c.name} ${c.code}`}
                        selected={c.name === dial.name}
                        onSelect={() => {
                          setDial(c)
                          setDialOpen(false)
                        }}
                      />
                    ))}
                  </MenuList>
                )}
              </div>
              <input
                id="signup-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="flex-1 min-w-0 bg-transparent text-[14px] leading-[24px] text-[#101604] outline-none placeholder:text-[#807e7e]"
                style={jakarta(400)}
                autoComplete="tel-national"
                aria-invalid={errors.phoneNumber ? true : undefined}
                aria-describedby={errors.phoneNumber ? 'phone-error' : undefined}
              />
            </div>
            <FieldError id="phone-error" message={errors.phoneNumber} />
          </div>

          {/* Address (828:27004): 14/24 label, the field with "Select from map" at its right (gps 20 + 12/24 green, 8 apart); the map resolves a pin to street, area, state and postal code. */}
          <div className="flex flex-col gap-[8px] items-start w-full">
            <label htmlFor="signup-street" className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] w-full" style={jakarta(500)}>
              Address
            </label>
            <div className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center px-[16px] py-[8px] rounded-[30px] w-full">
              <input
                id="signup-street"
                type="text"
                value={street}
                maxLength={240}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Enter address"
                className="flex-1 min-w-0 bg-transparent text-[14px] leading-[24px] text-[#101604] outline-none placeholder:text-[#807e7e]"
                style={jakarta(400)}
                autoComplete="street-address"
              />
              <button type="button" onClick={() => setMapOpen(true)} className="flex shrink-0 items-center gap-[8px] max-md:min-h-[44px]" aria-label="Select from map">
                <img src={gpsIcon} alt="" className="size-[20px]" />
                <span className="text-[#007c53] text-[12px] leading-[24px] whitespace-nowrap max-sm:hidden" style={jakarta(500)}>
                  Select from map
                </span>
              </button>
            </div>
          </div>

          {/* Landmark (828:27013): 14/24 label, the field, then the 14/17.6 hint 16 below */}
          <div className="flex flex-col gap-[16px] items-start w-full">
            <div className="flex flex-col gap-[8px] items-start w-full">
              <label htmlFor="signup-landmark" className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] w-full" style={jakarta(500)}>
                Landmark
              </label>
              <input
                id="signup-landmark"
                type="text"
                value={landmark}
                maxLength={240}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opp. Mobil filling station"
                className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] leading-[24px] text-[#101604] outline-none placeholder:text-[#807e7e]"
                style={jakarta(400)}
              />
            </div>
            <p className="text-[#807e7e] text-[14px] leading-[17.6px]" style={jakarta(400)}>
              Something a delivery agent can ask a passer-by.
            </p>
          </div>

          {/* Terms (394:3189): 20px checkbox, 8px gap, 14/20 copy */}
          <div className="flex flex-col gap-[8px] w-full">
            <div className="flex gap-[8px] items-start w-full">
              <button
                type="button"
                onClick={() => setAgreed((a) => !a)}
                className="shrink-0 size-[20px]"
                role="checkbox"
                aria-checked={agreed}
                aria-labelledby="terms-copy"
              >
                <img src={agreed ? checkboxOn : checkboxOff} alt="" className="size-[20px]" />
              </button>
              <p id="terms-copy" className="text-[#101604] text-[14px] leading-[20px] flex-1" style={jakarta(400)}>
                By clicking “Create Account”, you agree to the{' '}
                <a href="/terms" className="text-[#007c53] underline" style={jakarta(500)}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-[#007c53] underline" style={jakarta(500)}>
                  Privacy Policy
                </a>{' '}
                of Earth.
              </p>
            </div>
            <FieldError id="terms-error" message={errors.termsConsent} />
          </div>

          {formError && (
            <p role="alert" className="text-[#b13b3b] text-[14px] leading-[20px] w-full" style={jakarta(400)}>
              {formError}{' '}
              {formError.startsWith('An account already exists') && (
                <button type="button" onClick={() => setLoginOpen(true)} className="text-[#007c53] underline" style={jakarta(500)}>
                  Log in instead
                </button>
              )}
            </p>
          )}
        </div>

        <div className="mt-[64px] flex flex-col gap-[24px] items-center">
          <GradientButton type="submit" className="w-full" style={{ opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Creating account…' : 'Create Account'}
          </GradientButton>
          <p className="text-[#807e7e] text-[16px] leading-[24px] text-center w-full" style={jakarta(400)}>
            Have an account already?{' '}
            <button type="button" onClick={() => setLoginOpen(true)} className="text-[#007c53]" style={jakarta(500)}>
              Log in
            </button>
          </p>
        </div>
      </form>

      <SignInDialogs open={loginOpen} initialEmail={email} onClose={() => setLoginOpen(false)} />
      {mapOpen && (
        <Suspense fallback={null}>
          <MapPickerDialog onPick={fromMap} onClose={() => setMapOpen(false)} />
        </Suspense>
      )}
    </AuthLayout>
  )
}
