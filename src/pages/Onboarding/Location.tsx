import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../components/layout/OnboardingLayout'
import OnboardingHeader from '../../components/layout/OnboardingHeader'
import FormDropdown from '../../components/ui/FormDropdown'
import GradientButton from '../../components/ui/GradientButton'
import gpsIcon from '../../assets/icons/onboarding-gps.svg'
import { jakarta } from '../../utils/styles'

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia',
  'Tanzania', 'Cameroon', "Côte d'Ivoire", 'Senegal', 'Uganda',
]

export default function Location() {
  const navigate = useNavigate()
  const [country, setCountry] = useState('')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')

  return (
    <OnboardingLayout>
      <OnboardingHeader
        onBack={() => navigate(-1)}
        step={2}
        title="Location"
        subtitle="Let us know what you are selling. You can add more later."
      />

      <div
        className="absolute flex flex-col gap-[16px] items-start"
        style={{ left: '120px', top: '328px', width: '580px' }}
      >
        <FormDropdown
          label="Country"
          value={country}
          placeholder="Select country"
          options={COUNTRIES}
          onSelect={setCountry}
        />

        {/* Address with GPS */}
        <div className="flex flex-col gap-[8px] items-start w-full">
          <label
            htmlFor="address"
            className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] w-full"
            style={jakarta(500)}
          >
            Address
          </label>
          <div className="bg-[#f7f7f7] flex h-[48px] items-center justify-between px-[16px] py-[8px] rounded-[30px] w-full">
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              className="bg-transparent flex-1 text-[14px] leading-[24px] tracking-[-0.28px] outline-none placeholder:text-[#807e7e]"
              style={{ ...jakarta(400), color: '#101604' }}
            />
            <div className="flex gap-[8px] items-center justify-center shrink-0">
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
            <label
              htmlFor="landmark"
              className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] w-full"
              style={jakarta(500)}
            >
              Landmark
            </label>
            <input
              id="landmark"
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Opp. Mobil filling station"
              className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] tracking-[-0.28px] leading-[24px] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e]"
              style={{ ...jakarta(400), color: '#101604' }}
            />
          </div>
          <p className="text-[#807e7e] text-[14px]" style={jakarta(400)}>
            Something a delivery agent can ask a passer-by.
          </p>
        </div>
      </div>

      <GradientButton
        onClick={() => navigate('/onboarding/verify-id')}
        style={{ position: 'absolute', left: '120px', top: '698px', width: '580px' }}
      >
        Proceed
      </GradientButton>
    </OnboardingLayout>
  )
}
