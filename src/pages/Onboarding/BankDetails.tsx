import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../components/layout/OnboardingLayout'
import OnboardingHeader from '../../components/layout/OnboardingHeader'
import FormDropdown from '../../components/ui/FormDropdown'
import GradientButton from '../../components/ui/GradientButton'
import { describeError } from '../../services/earthApi'
import { COUNTRY_NAMES, countryCode, countryName, saveDraft, useDraft } from '../../onboarding/draft'
import { jakarta } from '../../utils/styles'

const BANKS_BY_COUNTRY: Record<string, string[]> = {
  Nigeria: [
    'Access Bank',
    'Guaranty Trust Bank',
    'Zenith Bank',
    'First Bank',
    'UBA',
    'Fidelity Bank',
    'Sterling Bank',
    'Opay',
    'Moniepoint',
    'Kuda',
  ],
  Ghana: ['GCB Bank', 'Ecobank Ghana', 'Absa Bank Ghana', 'Fidelity Bank Ghana'],
  Kenya: ['KCB Bank', 'Equity Bank', 'Cooperative Bank', 'NCBA Bank'],
  default: ['Central Bank', 'Commercial Bank', 'Standard Bank'],
}

const inputClass =
  'bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] tracking-[-0.28px] leading-[24px] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e]'

/**
 * The design resolves the account name from the bank ("Checking the bank for the name…"). The API
 * has no resolve endpoint yet, so the name is typed; the field goes away once one exists.
 */
export default function BankDetails() {
  const navigate = useNavigate()
  const [draft, update] = useDraft()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const b = draft.bank
  const set = (patch: Partial<typeof b>) => update({ bank: { ...b, ...patch } })

  const banks = b.country
    ? (BANKS_BY_COUNTRY[countryName(b.country)] ?? BANKS_BY_COUNTRY.default)
    : ['Select a country first']

  function handleCountrySelect(name: string) {
    set({ country: countryCode(name), bankName: '' })
  }

  function handleAccountNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    set({ accountNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })
  }

  async function confirm() {
    if (!b.country) return setError('Select the bank’s country.')
    if (!b.bankName || b.bankName === 'Select a country first') return setError('Select your bank.')
    if (b.accountNumber.length !== 10) return setError('Enter the 10-digit account number.')
    if (!b.accountName.trim()) return setError('Enter the name on the account.')
    setBusy(true)
    setError('')
    try {
      await saveDraft()
      navigate('/onboarding/review')
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
          value={countryName(b.country)}
          placeholder="Select country"
          options={COUNTRY_NAMES}
          onSelect={handleCountrySelect}
        />

        <FormDropdown
          label="Bank"
          value={b.bankName}
          placeholder="Select bank"
          options={banks}
          onSelect={(bankName) => set({ bankName })}
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
            value={b.accountNumber}
            onChange={handleAccountNumberChange}
            placeholder="Enter bank account number (10 digits)"
            className={inputClass}
            style={{ ...jakarta(400), color: '#101604' }}
          />
        </div>

        <div className="flex flex-col gap-[8px] items-start w-full">
          <label
            htmlFor="account-name"
            className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] w-full"
            style={jakarta(500)}
          >
            Account name
          </label>
          <input
            id="account-name"
            type="text"
            value={b.accountName}
            maxLength={160}
            onChange={(e) => set({ accountName: e.target.value })}
            placeholder="Name on the account, as your bank has it"
            className={inputClass}
            style={{ ...jakarta(400), color: '#101604' }}
          />
        </div>

        {error && (
          <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
            {error}
          </p>
        )}
      </div>

      <GradientButton
        onClick={confirm}
        style={{ position: 'absolute', left: '120px', top: '768px', width: '580px', opacity: busy ? 0.7 : 1 }}
      >
        {busy ? 'Saving…' : 'Confirm account'}
      </GradientButton>
    </OnboardingLayout>
  )
}
