import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../components/layout/OnboardingLayout'
import OnboardingHeader from '../../components/layout/OnboardingHeader'
import FormDropdown from '../../components/ui/FormDropdown'
import GradientButton from '../../components/ui/GradientButton'
import IdentityVerifiedModal from '../../components/ui/IdentityVerifiedModal'
import { jakarta } from '../../utils/styles'

const ID_TYPES = [
  'International Passport',
  'National ID Card',
  "Driver's License",
  "Voter's Card",
  'NIN Slip',
]

export default function VerifyId() {
  const navigate = useNavigate()
  const [idType, setIdType] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [showVerifiedModal, setShowVerifiedModal] = useState(false)

  return (
    <>
      <OnboardingLayout>
        <OnboardingHeader
          onBack={() => navigate(-1)}
          step={3}
          title="Prove who you are"
          subtitle="We check your Identity Number against a selfie."
        />

        <div
          className="absolute flex flex-col gap-[16px] items-start"
          style={{ left: '120px', top: '328px', width: '580px' }}
        >
          <FormDropdown
            label="Means of identity"
            value={idType}
            placeholder="Select option"
            options={ID_TYPES}
            onSelect={setIdType}
          />

          <div className="flex flex-col gap-[8px] items-start w-full">
            <label
              htmlFor="id-number"
              className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] w-full"
              style={jakarta(500)}
            >
              Identification number
            </label>
            <input
              id="id-number"
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter identification number"
              className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] tracking-[-0.28px] leading-[24px] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e]"
              style={{ ...jakarta(400), color: '#101604' }}
            />
          </div>
        </div>

        <GradientButton
          onClick={() => setShowVerifiedModal(true)}
          style={{ position: 'absolute', left: '120px', top: '568px', width: '580px' }}
        >
          Next, take selfie
        </GradientButton>
      </OnboardingLayout>

      {showVerifiedModal && (
        <IdentityVerifiedModal
          onProceed={() => { setShowVerifiedModal(false); navigate('/onboarding/bank') }}
          onClose={() => setShowVerifiedModal(false)}
        />
      )}
    </>
  )
}
