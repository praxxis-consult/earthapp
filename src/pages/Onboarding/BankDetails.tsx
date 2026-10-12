import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../components/layout/OnboardingLayout'
import OnboardingHeader from '../../components/layout/OnboardingHeader'
import FormDropdown from '../../components/ui/FormDropdown'
import GradientButton from '../../components/ui/GradientButton'
import { jakarta } from '../../utils/styles'

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia',
  'Tanzania', 'Cameroon', "Côte d'Ivoire", 'Senegal', 'Uganda',
]

const BANKS_BY_COUNTRY: Record<string, string[]> = {
  Nigeria: ['Access Bank', 'Guaranty Trust Bank', 'Zenith Bank', 'First Bank', 'UBA', 'Fidelity Bank', 'Sterling Bank'],
  Ghana: ['GCB Bank', 'Ecobank Ghana', 'Absa Bank Ghana', 'Fidelity Bank Ghana'],
  Kenya: ['KCB Bank', 'Equity Bank', 'Cooperative Bank', 'NCBA Bank'],
  default: ['Central Bank', 'Commercial Bank', 'Standard Bank'],
}

export default function BankDetails() {
  const navigate = useNavigate()
  const [country, setCountry] = useState('')
  const [bank, setBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  const banks = country ? (BANKS_BY_COUNTRY[country] ?? BANKS_BY_COUNTRY.default) : ['Select a country first']

  function handleCountrySelect(value: string) {
    setCountry(value)
    setBank('')
  }

  function handleAccountNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
  }

  return (
    <OnboardingLayout>
      <OnboardingHeader
        onBack={() => navigate(-1)}
        step={4}
        title="Payout Bank Details"
        subtitle="Your share goes straight to your bank. The account must be in the same name as your ID."
      />

      {/* Form starts at 352px for BankDetails (extra subtitle line) */}
      <div
        className="absolute flex flex-col gap-[16px] items-start"
        style={{ left: '120px', top: '352px', width: '580px' }}
      >
        <FormDropdown
          label="Country"
          value={country}
          placeholder="Select country"
          options={COUNTRIES}
          onSelect={handleCountrySelect}
        />

        <FormDropdown
          label="Bank"
          value={bank}
          placeholder="Select bank"
          options={banks}
          onSelect={setBank}
        />

        <div className="flex flex-col gap-[8px] items-start w-full">
          <label
            htmlFor="account-number"
            className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] w-full"
            style={jakarta(500)}
          >
            Account number
          </label>
          <input
            id="account-number"
            type="text"
            inputMode="numeric"
            value={accountNumber}
            onChange={handleAccountNumberChange}
            placeholder="Enter bank account number (10 digits)"
            className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] tracking-[-0.28px] leading-[24px] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e]"
            style={{ ...jakarta(400), color: '#101604' }}
          />
        </div>
      </div>

      <GradientButton
        onClick={() => navigate('/onboarding/review')}
        style={{ position: 'absolute', left: '120px', top: '688px', width: '580px' }}
      >
        Confirm account
      </GradientButton>
    </OnboardingLayout>
  )
}
