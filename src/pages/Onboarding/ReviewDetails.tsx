import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../components/layout/OnboardingLayout'
import OnboardingHeader from '../../components/layout/OnboardingHeader'
import GradientButton from '../../components/ui/GradientButton'
import editIcon from '../../assets/icons/onboarding-edit.svg'
import verifyIcon from '../../assets/icons/onboarding-verify.svg'
import { jakarta } from '../../utils/styles'

function SectionHeading({ title, onEdit }: { title: string; onEdit: () => void }) {
  return (
    <div className="flex gap-[8px] items-center w-full">
      <p className="text-[#101604] text-[16px] leading-[24px] whitespace-nowrap" style={jakarta(600)}>
        {title}
      </p>
      <button onClick={onEdit} className="flex items-center justify-center">
        <div className="relative shrink-0 size-[16px]">
          <img src={editIcon} alt="Edit" className="absolute block inset-0 max-w-none size-full" />
        </div>
      </button>
    </div>
  )
}

function SummaryField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[4px] items-start flex-1 min-w-0">
      <p className="text-[#807e7e] text-[12px] w-full" style={jakarta(400)}>{label}</p>
      <div className="text-[#101604] text-[14px] w-full" style={jakarta(500)}>{children}</div>
    </div>
  )
}

function SummaryRow({ children }: { children: ReactNode }) {
  return <div className="flex gap-[16px] items-start w-full">{children}</div>
}

export default function ReviewDetails() {
  const navigate = useNavigate()

  return (
    <OnboardingLayout scrollable>
      <OnboardingHeader
        onBack={() => navigate(-1)}
        title="Review Details"
        subtitle="Kindly review all the details below to make sure that the information you submitted is correct and up to date."
      />

      {/* Review sections */}
      <div
        className="absolute flex flex-col gap-[24px] items-start"
        style={{ left: '120px', top: '296px', width: '580px' }}
      >
        {/* Store details */}
        <div className="flex flex-col gap-[16px] items-start w-full">
          <SectionHeading title="Store details" onEdit={() => navigate('/onboarding/store')} />
          <SummaryRow>
            <SummaryField label="Store name">Akpolo Agro &amp; Mines</SummaryField>
            <SummaryField label="Selling categories">Agriculture, Forestry</SummaryField>
          </SummaryRow>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-[16px] items-start w-full">
          <SectionHeading title="Location" onEdit={() => navigate('/onboarding/location')} />
          <div className="flex flex-col gap-[16px] items-start w-full">
            <SummaryRow>
              <SummaryField label="Country">Nigeria</SummaryField>
              <SummaryField label="Region/State">Ondo</SummaryField>
            </SummaryRow>
            <SummaryRow>
              <SummaryField label="Area">Okitipupa</SummaryField>
              <SummaryField label="Street">12C Ifeoma Akinade Street</SummaryField>
            </SummaryRow>
            <SummaryRow>
              <SummaryField label="Landmark">Not provided</SummaryField>
            </SummaryRow>
          </div>
        </div>

        {/* Identity */}
        <div className="flex flex-col gap-[16px] items-start w-full">
          <SectionHeading title="Identity" onEdit={() => navigate('/onboarding/verify-id')} />
          <div className="flex flex-col gap-[16px] items-start w-full">
            <SummaryRow>
              <SummaryField label="Means of identity">International Passport</SummaryField>
              <SummaryField label="ID No.">BN9203493732JV</SummaryField>
            </SummaryRow>
            <SummaryRow>
              <div className="flex flex-col gap-[4px] items-start flex-1 min-w-0">
                <p className="text-[#807e7e] text-[12px]" style={jakarta(400)}>Selfie verification</p>
                <div className="flex gap-[4px] items-center">
                  <div className="relative shrink-0 size-[20px]">
                    <img src={verifyIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                  </div>
                  <p className="text-[#101604] text-[14px] whitespace-nowrap" style={jakarta(500)}>Verified</p>
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
              <SummaryField label="Country">Nigeria</SummaryField>
              <SummaryField label="Bank">Guaranty Trust Bank</SummaryField>
            </SummaryRow>
            <SummaryRow>
              <SummaryField label="Account no.">2018393390</SummaryField>
              <SummaryField label="Account name.">Cynthia Okorie</SummaryField>
            </SummaryRow>
            <div className="flex gap-[4px] items-center">
              <div className="relative shrink-0 size-[20px]">
                <img src={verifyIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
              </div>
              <p className="text-[#007c53] text-[14px] whitespace-nowrap" style={jakarta(500)}>
                The name matches your verified ID
              </p>
            </div>
          </div>
        </div>
      </div>

      <GradientButton
        onClick={() => navigate('/')}
        style={{ position: 'absolute', left: '120px', top: '990px', width: '580px' }}
      >
        Complete Setup
      </GradientButton>
    </OnboardingLayout>
  )
}
