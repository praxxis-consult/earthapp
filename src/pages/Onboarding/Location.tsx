import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../components/layout/OnboardingLayout'
import OnboardingHeader from '../../components/layout/OnboardingHeader'
import FormDropdown from '../../components/ui/FormDropdown'
import GradientButton from '../../components/ui/GradientButton'
import gpsIcon from '../../assets/icons/onboarding-gps.svg'
import { describeError } from '../../services/earthApi'
import { COUNTRY_NAMES, countryCode, countryName, saveDraft, useDraft } from '../../onboarding/draft'
import { regionsOf } from '../../data/locations'
import { jakarta } from '../../utils/styles'
import { areaProblem, streetProblem } from '../../lib/address'

const inputClass =
  'bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] leading-[24px] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e]'
const labelClass = 'text-[#101604] text-[14px] leading-[24px] w-full'

/**
 * The design has one Address line with "Select from map"; the API (and the review step) want
 * region, area and street apart, so the address is three fields here until a map picker exists.
 */
export default function Location() {
  const navigate = useNavigate()
  const [draft, update] = useDraft()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const a = draft.address
  const set = (patch: Partial<typeof a>) => update({ address: { ...a, ...patch } })

  async function proceed() {
    if (!a.country) return setError('Select your country.')
    if (!a.region.trim()) return setError('Select your region or state.')
    if (!a.area.trim()) return setError('Enter your area or town.')
    if (!a.street.trim()) return setError('Enter your street address.')
    // Carriers resolve a Nigerian address as typed: the street starts with its number and names the road.
    const carrierIssue = a.country === 'NG' ? (streetProblem(a.street) ?? areaProblem(a.area)) : null
    if (carrierIssue) return setError(carrierIssue)
    setBusy(true)
    setError('')
    try {
      await saveDraft()
      navigate('/onboarding/verify-id')
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <OnboardingLayout>
      <OnboardingHeader
        onBack={() => navigate(-1)}
        step={2}
        title="Location"
        subtitle="Let us know what you are selling. You can add more later."
      />

      <div className="mt-[40px] flex flex-col gap-[16px] items-start w-full">
        <FormDropdown
          label="Country"
          value={countryName(a.country)}
          placeholder="Select country"
          options={COUNTRY_NAMES}
          onSelect={(name) => {
            const country = countryCode(name)
            // A region belongs to its country: changing the country clears a region that is not in the new list.
            set({ country, region: regionsOf(country).includes(a.region) ? a.region : '' })
          }}
        />

        <div className="flex gap-[16px] items-start w-full max-sm:flex-col">
          {/* The marketplace lists stores by country and region, so the region is picked from the
              same list the location filter uses (src/data/locations.ts), not typed. */}
          <div className="flex-1 min-w-0 max-sm:w-full">
            <FormDropdown
              id="region"
              label="Region/State"
              value={a.region}
              placeholder={a.country ? 'Select region or state' : 'Select a country first'}
              options={regionsOf(a.country)}
              emptyHint={a.country ? 'No regions listed for this country.' : 'Select a country first.'}
              onSelect={(region) => set({ region })}
            />
          </div>
          <div className="flex flex-col gap-[8px] items-start flex-1 min-w-0 max-sm:w-full">
            <label htmlFor="area" className={labelClass} style={jakarta(500)}>
              Area
            </label>
            <input
              id="area"
              type="text"
              value={a.area}
              maxLength={120}
              onChange={(e) => set({ area: e.target.value })}
              placeholder="e.g. Okitipupa"
              className={inputClass}
              style={{ ...jakarta(400), color: '#101604' }}
            />
          </div>
        </div>

        {/* Address with GPS */}
        <div className="flex flex-col gap-[8px] items-start w-full">
          <label htmlFor="address" className={labelClass} style={jakarta(500)}>
            Address
          </label>
          <div className="bg-[#f7f7f7] flex h-[48px] items-center justify-between px-[16px] py-[8px] rounded-[30px] w-full">
            <input
              id="address"
              type="text"
              value={a.street}
              maxLength={240}
              onChange={(e) => set({ street: e.target.value })}
              placeholder="Enter address"
              className="bg-transparent flex-1 text-[14px] leading-[24px] outline-none placeholder:text-[#807e7e]"
              style={{ ...jakarta(400), color: '#101604' }}
            />
            {/* "Select from map" needs a maps key; shown as designed, inert until one exists. */}
            <div className="flex gap-[8px] items-center justify-center shrink-0" title="Map picking is coming soon">
              <div className="relative shrink-0 size-[20px]">
                <img src={gpsIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
              </div>
              <span className="text-[#007c53] text-[12px] leading-[24px] whitespace-nowrap" style={jakarta(500)}>
                Select from map
              </span>
            </div>
          </div>
        </div>

        {/* Landmark + hint */}
        <div className="flex flex-col gap-[16px] items-start w-full">
          <div className="flex flex-col gap-[8px] items-start w-full">
            <label htmlFor="landmark" className={labelClass} style={jakarta(500)}>
              Landmark
            </label>
            <input
              id="landmark"
              type="text"
              value={a.landmark}
              maxLength={240}
              onChange={(e) => set({ landmark: e.target.value })}
              placeholder="e.g. Opp. Mobil filling station"
              className={inputClass}
              style={{ ...jakarta(400), color: '#101604' }}
            />
          </div>
          <p className="text-[#807e7e] text-[14px] leading-[18px]" style={jakarta(400)}>
            Something a delivery agent can ask a passer-by.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
            {error}
          </p>
        )}
      </div>

      <GradientButton onClick={proceed} className="mt-[64px] w-full" style={{ opacity: busy ? 0.7 : 1 }}>
        {busy ? 'Saving…' : 'Proceed'}
      </GradientButton>
    </OnboardingLayout>
  )
}
