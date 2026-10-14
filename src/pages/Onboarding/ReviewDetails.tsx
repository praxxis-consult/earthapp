import type { ReactNode } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../components/layout/OnboardingLayout'
import OnboardingHeader from '../../components/layout/OnboardingHeader'
import GradientButton from '../../components/ui/GradientButton'
import SetupDoneModal from '../../components/ui/SetupDoneModal'
import editIcon from '../../assets/icons/onboarding-edit.svg'
import verifyIcon from '../../assets/icons/onboarding-verify.svg'
import { describeError, toApiError } from '../../services/earthApi'
import { useGetCategoriesQuery } from '../../feature/stores/storesApiSlice'
import { countryName, goLive, idTypeLabel, missingForLive, useDraft } from '../../onboarding/draft'
import { jakarta } from '../../utils/styles'

function SectionHeading({ title, onEdit }: { title: string; onEdit: () => void }) {
  return (
    <div className="flex gap-[8px] items-center w-full">
      <p className="text-[#101604] text-[16px] leading-[24px] whitespace-nowrap" style={jakarta(600)}>
        {title}
      </p>
      <button onClick={onEdit} className="flex items-center justify-center" aria-label={`Edit ${title.toLowerCase()}`}>
        <div className="relative shrink-0 size-[16px]">
          <img src={editIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
        </div>
      </button>
    </div>
  )
}

function SummaryField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[4px] items-start flex-1 min-w-0">
      <p className="text-[#807e7e] text-[12px] leading-[15px] w-full" style={jakarta(400)}>
        {label}
      </p>
      <div className="text-[#101604] text-[14px] leading-[18px] w-full" style={jakarta(500)}>
        {children}
      </div>
    </div>
  )
}

function SummaryRow({ children }: { children: ReactNode }) {
  return <div className="flex gap-[16px] items-start w-full">{children}</div>
}

const STEP_FOR: Record<string, string> = {
  storeName: '/onboarding/store',
  categoryIds: '/onboarding/store',
  businessAddress: '/onboarding/location',
  identity: '/onboarding/verify-id',
  selfieUrl: '/onboarding/verify-id',
  bank: '/onboarding/bank',
}

export default function ReviewDetails() {
  const navigate = useNavigate()
  const [draft] = useDraft()
  const [showSetupDone, setShowSetupDone] = useState(false)
  const { data: categories = [] } = useGetCategoriesQuery()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const or = (v: string) => v || 'Not provided'
  const categoryNames = draft.categoryIds.map((id) => categories.find((c) => c.id === id)?.name ?? id).join(', ')
  const missing = missingForLive(draft)

  async function completeSetup() {
    if (missing.length) {
      setError('Some details are still missing. Use the pencil next to a section to fill them in.')
      navigate(STEP_FOR[missing[0]] ?? '/onboarding/store')
      return
    }
    setBusy(true)
    setError('')
    try {
      await goLive()
      setShowSetupDone(true)
    } catch (err) {
      const e = toApiError(err)
      if (e.status === 400 && e.errors.length) {
        const first = e.errors[0]?.path?.split('.')[0] ?? ''
        setError(`The API could not accept ${first || 'these details'}. Check that section and try again.`)
      } else setError(describeError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <OnboardingLayout>
        <OnboardingHeader
          onBack={() => navigate(-1)}
          title="Review Details"
          subtitle="Kindly review all the details below to make sure that the information you submitted is correct and up to date."
        />

        {/* Review sections (623:20847): 40px below the header, 24px apart */}
        <div className="mt-[40px] flex flex-col gap-[24px] items-start w-full">
          {/* Store details */}
          <div className="flex flex-col gap-[16px] items-start w-full">
            <SectionHeading title="Store details" onEdit={() => navigate('/onboarding/store')} />
            <SummaryRow>
              <SummaryField label="Store name">{or(draft.storeName)}</SummaryField>
              <SummaryField label="Selling categories">{or(categoryNames)}</SummaryField>
            </SummaryRow>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-[16px] items-start w-full">
            <SectionHeading title="Location" onEdit={() => navigate('/onboarding/location')} />
            <div className="flex flex-col gap-[16px] items-start w-full">
              <SummaryRow>
                <SummaryField label="Country">{or(countryName(draft.address.country))}</SummaryField>
                <SummaryField label="Region/State">{or(draft.address.region)}</SummaryField>
              </SummaryRow>
              <SummaryRow>
                <SummaryField label="Area">{or(draft.address.area)}</SummaryField>
                <SummaryField label="Street">{or(draft.address.street)}</SummaryField>
              </SummaryRow>
              <SummaryRow>
                <SummaryField label="Landmark">{or(draft.address.landmark)}</SummaryField>
              </SummaryRow>
            </div>
          </div>

          {/* Identity */}
          <div className="flex flex-col gap-[16px] items-start w-full">
            <SectionHeading title="Identity" onEdit={() => navigate('/onboarding/verify-id')} />
            <div className="flex flex-col gap-[16px] items-start w-full">
              <SummaryRow>
                <SummaryField label="Means of identity">{or(idTypeLabel(draft.identityType))}</SummaryField>
                <SummaryField label="ID No.">{or(draft.identityNumber)}</SummaryField>
              </SummaryRow>
              <SummaryRow>
                <div className="flex flex-col gap-[4px] items-start flex-1 min-w-0">
                  <p className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
                    Selfie verification
                  </p>
                  <div className="flex gap-[4px] items-center">
                    {draft.selfieUrl ? (
                      <>
                        <div className="relative shrink-0 size-[20px]">
                          <img src={verifyIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                        </div>
                        <p className="text-[#101604] text-[14px] whitespace-nowrap" style={jakarta(500)}>
                          Selfie added
                        </p>
                      </>
                    ) : (
                      <p className="text-[#b13b3b] text-[14px] whitespace-nowrap" style={jakarta(500)}>
                        Not provided
                      </p>
                    )}
                  </div>
                </div>
              </SummaryRow>
            </div>
          </div>

          {/* Payout bank details */}
          <div className="flex flex-col gap-[16px] items-start w-full">
            <SectionHeading title="Payout bank details" onEdit={() => navigate('/onboarding/bank')} />
            <div className="flex flex-col gap-[16px] items-start w-full">
              <SummaryRow>
                <SummaryField label="Country">{or(countryName(draft.bank.country))}</SummaryField>
                <SummaryField label="Bank">{or(draft.bank.bankName)}</SummaryField>
              </SummaryRow>
              <SummaryRow>
                <SummaryField label="Account no.">{or(draft.bank.accountNumber)}</SummaryField>
                <SummaryField label="Account name.">{or(draft.bank.accountName)}</SummaryField>
              </SummaryRow>
              {/* Verification is UNVERIFIED on the API for now; the match line waits for a name-resolve endpoint. */}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
              {error}
            </p>
          )}
        </div>

        <GradientButton onClick={completeSetup} className="mt-[64px] w-full" style={{ opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Submitting…' : 'Complete Setup'}
        </GradientButton>
      </OnboardingLayout>

      {showSetupDone && (
        <SetupDoneModal
          storeId={draft.storeId}
          onDashboard={() => {
            setShowSetupDone(false)
            navigate('/dashboard')
          }}
          onClose={() => setShowSetupDone(false)}
        />
      )}
    </>
  )
}
