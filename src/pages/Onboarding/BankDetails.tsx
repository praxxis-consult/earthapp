import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../components/layout/OnboardingLayout'
import OnboardingHeader from '../../components/layout/OnboardingHeader'
import FormDropdown from '../../components/ui/FormDropdown'
import GradientButton from '../../components/ui/GradientButton'
import { AccountCheckRow } from '../../components/ui/AccountCheck'
import { useAccountCheck } from '../../feature/banks/useAccountCheck'
import { useAuth } from '../../feature/authentication/useAuth'
import { bankListHint, useGetBanksQuery } from '../../feature/banks/banksApiSlice'
import { describeError } from '../../services/earthApi'
import { COUNTRY_NAMES, countryCode, countryName, saveDraft, useDraft } from '../../onboarding/draft'
import { jakarta } from '../../utils/styles'

const inputClass =
  'bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] leading-[24px] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e]'

/**
 * Step 4 (bank details 423:4483 → 424:4530 → 428:4608): country, bank and account number, then
 * "Confirm account" asks the bank for the name on the account. While it checks, the spinner row
 * shows under the number; when the name matches the seller's, the row shows the tick and the
 * name and the button becomes "Review details". The name is never typed, except while the API
 */
export default function BankDetails() {
  const navigate = useNavigate()
  const { account } = useAuth()
  const [draft, update] = useDraft()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { check, run, reset } = useAccountCheck()
  const b = draft.bank
  const set = (patch: Partial<typeof b>) => {
    update({ bank: { ...b, ...patch, verified: false } })
    reset()
  }

  // The API's bank list for the country; the dropdown stays empty, with a reason, where there is none.
  const { data: bankList, error: bankError } = useGetBanksQuery({ country: b.country }, { skip: !b.country })
  const banks = b.country ? (bankList?.map((x) => x.name) ?? []) : []
  const holderName = account ? `${account.firstName} ${account.lastName}` : ''
  const matched = check.status === 'matched' && b.verified

  function validate() {
    if (!b.country) return 'Select the bank’s country.'
    if (!b.bankName) return 'Select your bank.'
    if (b.accountNumber.length !== 10) return 'Enter the 10-digit account number.'
    return ''
  }

  /** "Confirm account": look the name up and keep it when it is the seller's. */
  async function confirm() {
    const problem = validate()
    if (problem) return setError(problem)
    setError('')
    const result = await run({
      country: b.country,
      bankName: b.bankName,
      bankCode: bankList?.find((x) => x.name === b.bankName)?.code,
      accountNumber: b.accountNumber,
      holderName,
    })
    if (result.status === 'matched') update({ bank: { ...b, accountName: result.accountName, verified: true } })
  }

  /** "Review details": save and move on. */
  async function proceed() {
    const problem = validate()
    if (problem) return setError(problem)
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

      <div className="mt-[40px] flex flex-col gap-[16px] items-start w-full">
        <FormDropdown
          label="Country"
          value={countryName(b.country)}
          placeholder="Select country"
          options={COUNTRY_NAMES}
          onSelect={(name) => set({ country: countryCode(name), bankName: '' })}
        />

        <FormDropdown
          label="Bank"
          value={b.bankName}
          placeholder="Select bank"
          options={banks}
          emptyHint={bankListHint(b.country, bankError)}
          onSelect={(bankName) => set({ bankName })}
        />

        <div className="flex flex-col gap-[8px] items-start w-full">
          <label htmlFor="account-number" className="text-[#101604] text-[14px] leading-[24px] w-full" style={jakarta(500)}>
            Account number
          </label>
          <input
            id="account-number"
            type="text"
            inputMode="numeric"
            value={b.accountNumber}
            onChange={(e) => set({ accountNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            placeholder="Enter bank account number (10 digits)"
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

      {/* The status row sits 16px under the number (424:4579 at 640); the button 64px under the fields (423:4515) or under the row (429:4715) */}
      <AccountCheckRow check={check} className="mt-[16px]" />

      {check.status !== 'checking' && (
        <GradientButton
          onClick={matched ? proceed : confirm}
          className="w-full mt-[64px]"
          style={{ opacity: busy ? 0.7 : 1 }}
        >
          {busy ? 'Saving…' : matched ? 'Review details' : 'Confirm account'}
        </GradientButton>
      )}
    </OnboardingLayout>
  )
}
