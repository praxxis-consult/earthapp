import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../components/layout/OnboardingLayout'
import OnboardingHeader from '../../components/layout/OnboardingHeader'
import FormDropdown from '../../components/ui/FormDropdown'
import GradientButton from '../../components/ui/GradientButton'
import IdentityVerifiedModal from '../../components/ui/IdentityVerifiedModal'
import SelfieCaptureModal from '../../components/ui/SelfieCaptureModal'
import { describeError } from '../../services/earthApi'
import { ID_TYPES, idTypeLabel, saveDraft, useDraft } from '../../onboarding/draft'
import { jakarta } from '../../utils/styles'

export default function VerifyId() {
  const navigate = useNavigate()
  const [draft, update] = useDraft()
  const [showSelfie, setShowSelfie] = useState(false)
  const [showVerifiedModal, setShowVerifiedModal] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function next() {
    if (!draft.identityType) return setError('Select your means of identity.')
    if (!draft.identityNumber.trim()) return setError('Enter your identification number.')
    setError('')
    // A selfie already on file (a returning seller) goes straight to the saved step.
    if (draft.selfieUrl) return saveAndContinue()
    setShowSelfie(true)
  }

  async function saveAndContinue(selfieUrl?: string) {
    if (selfieUrl) update({ selfieUrl })
    setShowSelfie(false)
    setBusy(true)
    try {
      await saveDraft()
      setShowVerifiedModal(true)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <OnboardingLayout>
        <OnboardingHeader
          onBack={() => navigate(-1)}
          step={3}
          title="Prove who you are"
          subtitle="We check your Identity Number against a selfie."
        />

        <div className="mt-[40px] flex flex-col gap-[16px] items-start w-full">
          <FormDropdown
            label="Means of identity"
            value={idTypeLabel(draft.identityType)}
            placeholder="Select option"
            options={ID_TYPES.map((t) => t.label)}
            onSelect={(label) => update({ identityType: ID_TYPES.find((t) => t.label === label)?.value ?? '' })}
          />

          <div className="flex flex-col gap-[8px] items-start w-full">
            <label
              htmlFor="id-number"
              className="text-[#101604] text-[14px] leading-[24px] w-full"
              style={jakarta(500)}
            >
              Identification number
            </label>
            <input
              id="id-number"
              type="text"
              value={draft.identityNumber}
              maxLength={100}
              onChange={(e) => update({ identityNumber: e.target.value })}
              placeholder="Enter identification number"
              className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] leading-[24px] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e]"
              style={{ ...jakarta(400), color: '#101604' }}
            />
          </div>

          {draft.selfieUrl && (
            <button
              type="button"
              onClick={() => setShowSelfie(true)}
              className="flex items-center gap-[12px] text-left"
            >
              <img
                src={draft.selfieUrl}
                alt="Your selfie"
                className="size-[48px] rounded-full object-cover bg-[#f7f7f7]"
              />
              <span className="text-[#007c53] text-[14px]" style={jakarta(500)}>
                Selfie added · Retake
              </span>
            </button>
          )}

          {error && (
            <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
              {error}
            </p>
          )}
        </div>

        <GradientButton onClick={next} className="mt-[64px] w-full" style={{ opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Saving…' : draft.selfieUrl ? 'Proceed' : 'Next, take selfie'}
        </GradientButton>
      </OnboardingLayout>

      {showSelfie && (
        <SelfieCaptureModal onUploaded={(url) => saveAndContinue(url)} onClose={() => setShowSelfie(false)} />
      )}

      {showVerifiedModal && (
        <IdentityVerifiedModal
          onProceed={() => {
            setShowVerifiedModal(false)
            navigate('/onboarding/bank')
          }}
          onClose={() => setShowVerifiedModal(false)}
        />
      )}
    </>
  )
}
