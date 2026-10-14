import { useState, type FormEvent } from 'react'
import newsletterBg from '../../assets/images/newsletter-bg.png'
import { useAuth } from '../../feature/authentication/useAuth'
import {
  useClaimWaitlistPlaceMutation,
  useJoinWaitlistMutation,
  useLazyGetWaitlistPlaceQuery,
  useResendWaitlistCodeMutation,
  type WaitlistIntent,
  type WaitlistPlace,
} from '../../feature/waitlist/waitlistApiSlice'
import { describeError, toApiError } from '../../services/earthApi'
import { jakarta } from '../../utils/styles'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const INTENTS: { value: WaitlistIntent; label: string }[] = [
  { value: 'BUYING', label: 'Buying' },
  { value: 'SELLING', label: 'Selling' },
  { value: 'BOTH', label: 'Both' },
]

const field =
  'h-[48px] rounded-[30px] bg-[#f7f7f7] px-[16px] text-[#101604] text-[16px] leading-[24px] outline-none placeholder:text-[#666666] border-[0.5px] border-[#e4dede] focus:border-[#007c53]'

/**
 * Figma "Stay in the Loop" (384:2367): the 588px heading block at 64, then the 564px email field
 * and the Subscribe button at 259. Subscribing joins the launch waitlist on the API: the join
 * needs a city and what they are here for, so those appear once the address is in; the emailed
 * six-digit code confirms the place, which is then read back with the place token.
 */
export default function Newsletter() {
  const { account } = useAuth()
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [intent, setIntent] = useState<WaitlistIntent>('BUYING')
  const [step, setStep] = useState<'email' | 'details' | 'code' | 'done'>('email')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [place, setPlace] = useState<WaitlistPlace | null>(null)
  const [join, joinState] = useJoinWaitlistMutation()
  const [resend] = useResendWaitlistCodeMutation()
  const [claim, claimState] = useClaimWaitlistPlaceMutation()
  const [readPlace] = useLazyGetWaitlistPlaceQuery()
  const busy = joinState.isLoading || claimState.isLoading
  const address = (email || account?.email || '').trim().toLowerCase()

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (step === 'email') {
      if (!EMAIL.test(address)) return setError('Enter a valid email address.')
      if (account?.accountType) setIntent(account.accountType)
      return setStep('details')
    }
    if (step === 'details') {
      if (city.trim().length < 2) return setError('Tell us your city, so we can count your place in it.')
      try {
        await join({
          intent,
          email: address,
          city: city.trim(),
          name: account ? `${account.firstName} ${account.lastName}` : undefined,
          marketingConsent: true,
        }).unwrap()
        setNotice(`We sent a six-digit code to ${address}.`)
        setStep('code')
      } catch (err) {
        setError(describeError(err))
      }
      return
    }
    if (step === 'code') {
      if (!/^\d{6}$/.test(code)) return setError('Enter the six digits from the email.')
      try {
        const { placeToken } = await claim({ email: address, code }).unwrap()
        setPlace(await readPlace(placeToken).unwrap())
        setStep('done')
      } catch (err) {
        const apiErr = toApiError(err)
        setError(apiErr.status === 409 ? 'This address is already confirmed on the list.' : apiErr.status === 422 ? 'That code is wrong or has expired. Request a new one.' : describeError(err))
      }
    }
  }

  async function resendCode() {
    setError('')
    try {
      await resend({ email: address }).unwrap()
      setNotice(`We sent a new code to ${address}.`)
    } catch (err) {
      setError(describeError(err))
    }
  }

  return (
    <section className="w-full h-[679px] relative overflow-hidden max-lg:h-auto max-lg:py-[64px] max-md:py-[48px]">
      <img src={newsletterBg} alt="" className="absolute inset-0 w-full h-full object-cover object-bottom" />

      <div className="absolute inset-0 flex flex-col items-center pt-[64px] max-lg:relative max-lg:inset-auto max-lg:pt-0 max-lg:px-[24px] max-md:px-[16px]">
        <div className="w-[588px] flex flex-col gap-[8px] text-center mb-[131px] max-lg:w-full max-lg:max-w-[588px] max-lg:mb-[48px]">
          <h2 className="text-[#101604] text-[48px] tracking-[-0.96px] leading-[64px] max-md:text-[32px] max-md:leading-[40px]" style={jakarta(700)}>
            Stay in the Loop
          </h2>
          <p className="text-[#807e7e] text-[16px] leading-[29.25px]" style={jakarta(400)}>
            Receive notifications regarding freshly verified export parcels, port laycans, and harvest yields.
          </p>
        </div>

        {step === 'done' && place ? (
          <div className="flex w-[695px] flex-col items-center gap-[8px] text-center max-lg:w-full max-lg:max-w-[695px]">
            <p className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
              You’re #{place.position} in {place.city}
            </p>
            <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
              We’ll email you the moment Earth opens there. Share your link{' '}
              <span className="text-[#007c53] break-all" style={jakarta(500)}>
                {window.location.origin}/?ref={place.referralCode}
              </span>{' '}
              and every friend who confirms moves you five places up.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex w-[695px] flex-col items-center gap-[16px] max-lg:w-full max-lg:max-w-[695px]">
            <div className="flex w-full gap-[16px] items-center max-md:flex-col max-md:items-stretch">
              {step === 'code' ? (
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter the six-digit code"
                  aria-label="Six-digit code"
                  className={`${field} w-[564px] max-lg:w-auto max-lg:flex-1 max-md:w-full max-md:flex-none`}
                  style={jakarta(400)}
                />
              ) : (
                <input
                  type="email"
                  autoComplete="email"
                  value={email || account?.email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  className={`${field} w-[564px] max-lg:w-auto max-lg:flex-1 max-md:w-full max-md:flex-none`}
                  style={jakarta(400)}
                />
              )}
              <button
                type="submit"
                disabled={busy}
                className="h-[48px] px-[24px] rounded-[30px] flex items-center justify-center shrink-0 disabled:opacity-70 max-md:w-full"
                style={{ backgroundImage: 'linear-gradient(90deg, rgb(0, 124, 83) 0%, rgb(0, 124, 83) 100%)' }}
              >
                <span
                  className="text-[14px] tracking-[-0.28px] bg-clip-text text-transparent whitespace-nowrap"
                  style={{ ...jakarta(500), backgroundImage: 'linear-gradient(178.3deg, rgb(255,255,255) 4.9851%, rgba(255,255,255,0.86) 85.731%)' }}
                >
                  {step === 'code' ? (busy ? 'Confirming…' : 'Confirm') : busy ? 'Joining…' : 'Subscribe'}
                </span>
              </button>
            </div>

            {step === 'details' && (
              <div className="flex w-full gap-[16px] items-center max-md:flex-col max-md:items-stretch">
                <input
                  type="text"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Your city"
                  aria-label="Your city"
                  className={`${field} flex-1`}
                  style={jakarta(400)}
                />
                <div className="flex h-[48px] items-center gap-[4px] rounded-[30px] bg-[#f7f7f7] p-[4px] max-md:w-full" role="radiogroup" aria-label="What are you here for?">
                  {INTENTS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={intent === o.value}
                      onClick={() => setIntent(o.value)}
                      className="h-[40px] rounded-[30px] px-[16px] text-[14px] leading-[18px] max-md:flex-1"
                      style={{ ...jakarta(500), background: intent === o.value ? '#007c53' : 'transparent', color: intent === o.value ? '#ffffff' : '#807e7e' }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'code' && (
              <button type="button" onClick={resendCode} className="text-[#007c53] text-[14px] leading-[24px]" style={jakarta(500)}>
                Resend the code
              </button>
            )}

            {(error || notice) && (
              <p role={error ? 'alert' : 'status'} className="text-[14px] leading-[20px] text-center" style={{ ...jakarta(400), color: error ? '#b13b3b' : '#007c53' }}>
                {error || notice}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
