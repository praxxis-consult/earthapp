import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import closeIcon from '../../assets/icons/od-close-circle.svg'
import chevronDown from '../../assets/icons/signup-chevron-down-24.svg'
import gpsIcon from '../../assets/icons/onboarding-gps.svg'
import { describeError, toApiError, type Category, type Onboarding } from '../../services/earthApi'
import { useSaveOnboardingMutation, type SaveOnboardingBody } from '../../feature/stores/storesApiSlice'
import { COUNTRY_NAMES, countryCode, countryName } from '../../onboarding/draft'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

const labelClass = 'text-[#101604] text-[14px] leading-[24px]'
const inputClass =
  'bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] text-[14px] leading-[24px] text-[#101604] outline-none border border-transparent focus:border-[#007c53] placeholder:text-[#807e7e]'

/** Figma "store details" (639:24245): 648 wide, radius 20, padding 20, gap 16, title row with close-circle. */
function Shell({ title, onClose, onSubmit, children, busy, cta = 'Save changes', cancel }: {
  title: string
  onClose: () => void
  onSubmit: (e: FormEvent) => void
  children: ReactNode
  busy: boolean
  cta?: string
  cancel?: boolean
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-[24px]" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={onSubmit}
        noValidate
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[648px] max-w-[calc(100%-48px)] rounded-[20px] p-[20px] flex flex-col gap-[16px]"
      >
        <div className="flex items-center justify-between h-[24px]">
          <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
            {title}
          </p>
          <button type="button" onClick={onClose} aria-label="Close" className="size-[24px]">
            <img src={closeIcon} alt="" className="size-[24px]" />
          </button>
        </div>
        {children}
        <button
          type="submit"
          disabled={busy}
          className="flex h-[48px] w-full items-center justify-center rounded-[30px] disabled:opacity-70"
          style={{ backgroundImage: CTA_BG }}
        >
          <span className="text-[14px] leading-[18px] bg-clip-text text-transparent" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
            {busy ? 'Saving…' : cta}
          </span>
        </button>
        {cancel && (
          <button type="button" onClick={onClose} className="h-[48px] w-full rounded-[30px] bg-[#f7f7f7] text-[#101604] text-[14px]" style={jakarta(500)}>
            Cancel
          </button>
        )}
      </form>
    </div>
  )
}

function Field({ label, htmlFor, children, hint }: { label: string; htmlFor?: string; children: ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor={htmlFor} className={labelClass} style={jakarta(500)}>
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
          {hint}
        </p>
      )}
    </div>
  )
}

function Select({ id, value, options, onChange, placeholder }: { id: string; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-[48px]`}
        style={{ ...jakarta(400), color: value ? '#101604' : '#807e7e' }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <img src={chevronDown} alt="" className="pointer-events-none absolute right-[16px] top-1/2 size-[24px] -translate-y-1/2" />
    </div>
  )
}

/** What the API can hold for a LIVE store; description and opening hours have no field yet. */
function liveBody(o: Onboarding) {
  return {
    storeName: o.storeName,
    categoryIds: o.categoryIds,
    businessAddress: o.businessAddress,
    identity: o.identity!,
    bank: o.bank!,
    selfieUrl: o.selfieUrl!,
  }
}

const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h % 12 || 12).padStart(2, '0')}:00 ${h < 12 ? 'AM' : 'PM'}`)

export function EditStoreDialog({
  store,
  categories,
  extras,
  onClose,
  onSaved,
}: {
  store: Onboarding
  categories: Category[]
  extras: { description: string; opens: string; closes: string }
  onClose: () => void
  onSaved: (store: Onboarding, extras: { description: string; opens: string; closes: string }) => void
}) {
  const [name, setName] = useState(store.storeName)
  const [ids, setIds] = useState<string[]>(store.categoryIds)
  const [description, setDescription] = useState(extras.description)
  const [country, setCountry] = useState(store.businessAddress.country)
  const [street, setStreet] = useState(store.businessAddress.street)
  const [landmark, setLandmark] = useState(store.businessAddress.landmark)
  const [opens, setOpens] = useState(extras.opens)
  const [closes, setCloses] = useState(extras.closes)
  const [catOpen, setCatOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saveOnboarding] = useSaveOnboardingMutation()

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Enter your store name.')
    if (!ids.length) return setError('Pick at least one thing you sell.')
    setBusy(true)
    setError('')
    try {
      const body = {
        ...liveBody(store),
        storeName: name.trim(),
        categoryIds: ids,
        businessAddress: { ...store.businessAddress, country, street: street.trim(), landmark: landmark.trim() || 'Not provided' },
      }
      const saved = await saveOnboarding({ ...body, status: store.status === 'LIVE' ? 'LIVE' : 'DRAFT', expectedVersion: store.version } as SaveOnboardingBody).unwrap()
      onSaved(saved, { description: description.trim(), opens, closes })
    } catch (err) {
      setError(toApiError(err).status === 409 ? 'Someone saved newer details. Reload and try again.' : describeError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell title="Edit store details" onClose={onClose} onSubmit={submit} busy={busy}>
      <Field label="Store name" htmlFor="st-name">
        <input id="st-name" value={name} maxLength={160} onChange={(e) => setName(e.target.value)} className={inputClass} style={jakarta(400)} />
      </Field>
      <Field label="What do you sell?">
        <div className="relative">
          <button
            type="button"
            onClick={() => setCatOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={catOpen}
            className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] flex items-center justify-between gap-[8px]"
          >
            <span className="flex items-center gap-[8px] overflow-hidden">
              {ids.length ? (
                ids.map((id) => (
                  <span key={id} className="rounded-[30px] px-[10px] py-[5px] text-[#007c53] text-[11px] leading-[14px] whitespace-nowrap" style={{ ...jakarta(500), background: 'rgba(0,124,83,0.05)' }}>
                    {categories.find((c) => c.id === id)?.name ?? id}
                  </span>
                ))
              ) : (
                <span className="text-[#807e7e] text-[14px]" style={jakarta(400)}>
                  Select what you sell
                </span>
              )}
            </span>
            <img src={chevronDown} alt="" className="size-[24px] shrink-0" />
          </button>
          {catOpen && (
            <ul role="listbox" aria-multiselectable className="absolute left-0 right-0 top-[52px] z-20 bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] max-h-[240px] overflow-y-auto py-[4px]">
              {categories.map((c) => {
                const on = ids.includes(c.id)
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={on}
                      onClick={() => setIds((s) => (on ? s.filter((x) => x !== c.id) : [...s, c.id]))}
                      className="w-full text-left px-[16px] py-[12px] text-[14px] leading-[24px] hover:bg-[#f7f7f7]"
                      style={{ ...jakarta(on ? 600 : 400), color: on ? '#007c53' : '#101604' }}
                    >
                      {c.name}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </Field>
      <Field label="Description" htmlFor="st-desc" hint={`${500 - description.length} characters left`}>
        <textarea
          id="st-desc"
          value={description}
          maxLength={500}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-[#f7f7f7] h-[80px] w-full rounded-[15px] px-[16px] py-[8px] text-[14px] leading-[24px] text-[#101604] outline-none resize-none placeholder:text-[#807e7e]"
          style={jakarta(400)}
          placeholder="What you sell, in a sentence or two"
        />
      </Field>
      <Field label="Country" htmlFor="st-country">
        <Select id="st-country" value={countryName(country)} options={COUNTRY_NAMES} onChange={(n) => setCountry(countryCode(n))} />
      </Field>
      <Field label="Address" htmlFor="st-address">
        <div className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] flex items-center justify-between gap-[8px]">
          <input id="st-address" value={street} maxLength={240} onChange={(e) => setStreet(e.target.value)} className="flex-1 min-w-0 bg-transparent text-[14px] leading-[24px] text-[#101604] outline-none" style={jakarta(400)} />
          <span className="flex items-center gap-[8px] shrink-0" title="Map picking is coming soon">
            <img src={gpsIcon} alt="" className="size-[20px]" />
            <span className="text-[#007c53] text-[12px] leading-[24px]" style={jakarta(500)}>
              Select from map
            </span>
          </span>
        </div>
      </Field>
      <Field label="Landmark" htmlFor="st-landmark">
        <input id="st-landmark" value={landmark} maxLength={240} onChange={(e) => setLandmark(e.target.value)} className={inputClass} style={jakarta(400)} />
      </Field>
      <Field label="Opening hours">
        <div className="flex gap-[16px]">
          <Select id="st-opens" value={opens} options={HOURS} onChange={setOpens} />
          <Select id="st-closes" value={closes} options={HOURS} onChange={setCloses} />
        </div>
      </Field>
      {error && (
        <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
          {error}
        </p>
      )}
    </Shell>
  )
}

export function EditPersonalDialog({
  initial,
  onClose,
  onSaved,
}: {
  initial: { firstName: string; lastName: string; email: string; phoneNumber: string }
  onClose: () => void
  onSaved: (v: { firstName: string; lastName: string; email: string; phoneNumber: string }) => void
}) {
  const [v, setV] = useState(initial)
  const set = (patch: Partial<typeof v>) => setV((s) => ({ ...s, ...patch }))
  function submit(e: FormEvent) {
    e.preventDefault()
    // The API has no account-update endpoint yet; the change is kept on this device.
    onSaved({ ...v, firstName: v.firstName.trim(), lastName: v.lastName.trim(), email: v.email.trim(), phoneNumber: v.phoneNumber.trim() })
  }
  return (
    <Shell title="Edit personal details" onClose={onClose} onSubmit={submit} busy={false}>
      <Field label="First name" htmlFor="p-first">
        <input id="p-first" value={v.firstName} onChange={(e) => set({ firstName: e.target.value })} className={inputClass} style={jakarta(400)} />
      </Field>
      <Field label="Last name" htmlFor="p-last">
        <input id="p-last" value={v.lastName} onChange={(e) => set({ lastName: e.target.value })} className={inputClass} style={jakarta(400)} />
      </Field>
      <Field label="Email address" htmlFor="p-email">
        <input id="p-email" type="email" value={v.email} onChange={(e) => set({ email: e.target.value })} className={inputClass} style={jakarta(400)} />
      </Field>
      <Field label="Phone number" htmlFor="p-phone" hint="Account changes are not saved to Earth yet; they stay on this device.">
        <input id="p-phone" type="tel" value={v.phoneNumber} onChange={(e) => set({ phoneNumber: e.target.value })} className={inputClass} style={jakarta(400)} />
      </Field>
    </Shell>
  )
}

const BANKS: Record<string, string[]> = {
  Nigeria: ['Access Bank', 'Guaranty Trust Bank', 'Zenith Bank', 'First Bank Nigeria', 'UBA', 'Fidelity Bank', 'Sterling Bank', 'Opay', 'Moniepoint', 'Kuda'],
  Ghana: ['GCB Bank', 'Ecobank Ghana', 'Absa Bank Ghana', 'Fidelity Bank Ghana'],
  Kenya: ['KCB Bank', 'Equity Bank', 'Cooperative Bank', 'NCBA Bank'],
}

export function ChangeBankDialog({ store, onClose, onSaved }: { store: Onboarding; onClose: () => void; onSaved: (store: Onboarding) => void }) {
  const [country, setCountry] = useState(store.bank?.country ?? 'NG')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saveOnboarding] = useSaveOnboardingMutation()
  const banks = BANKS[countryName(country)] ?? ['Central Bank', 'Commercial Bank', 'Standard Bank']

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!bankName) return setError('Select your bank.')
    if (accountNumber.length !== 10) return setError('Enter the 10-digit account number.')
    if (!accountName.trim()) return setError('Enter the name on the account.')
    setBusy(true)
    setError('')
    try {
      const body = { ...liveBody(store), bank: { country, bankName, accountNumber, accountName: accountName.trim() } }
      const saved = await saveOnboarding({ ...body, status: store.status === 'LIVE' ? 'LIVE' : 'DRAFT', expectedVersion: store.version } as SaveOnboardingBody).unwrap()
      onSaved(saved)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell title="Change Payout account" onClose={onClose} onSubmit={submit} busy={busy} cancel>
      <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
        To avoid someone redirecting your money, your current account keeps getting paid until the new one is verified.
      </p>
      <Field label="Country" htmlFor="b-country">
        <Select id="b-country" value={countryName(country)} options={COUNTRY_NAMES} onChange={(n) => { setCountry(countryCode(n)); setBankName('') }} />
      </Field>
      <Field label="Bank" htmlFor="b-bank">
        <Select id="b-bank" value={bankName} options={banks} onChange={setBankName} placeholder="Select bank" />
      </Field>
      <Field label="Account number" htmlFor="b-number">
        <input
          id="b-number"
          inputMode="numeric"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="Enter bank account number (10 digits)"
          className={inputClass}
          style={jakarta(400)}
        />
      </Field>
      {/* The design resolves the name from the bank; the API has no resolve endpoint yet, so it is typed. */}
      <Field label="Account name" htmlFor="b-name">
        <input id="b-name" value={accountName} maxLength={160} onChange={(e) => setAccountName(e.target.value)} placeholder="Name on the account, as your bank has it" className={inputClass} style={jakarta(400)} />
      </Field>
      {error && (
        <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
          {error}
        </p>
      )}
    </Shell>
  )
}
