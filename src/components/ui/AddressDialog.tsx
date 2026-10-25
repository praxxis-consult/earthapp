import { useState, type FormEvent } from 'react'
import { Field, Select, Shell, inputClass } from './SettingsDialogs'
import { useAuth } from '../../feature/authentication/useAuth'
import type { DeliveryAddress } from '../../feature/delivery/deliveryApiSlice'
import { regionsOf } from '../../data/locations'
import { areaProblem, fullNameProblem, nigerianPhone, phoneProblem, postalCodeProblem, streetProblem } from '../../lib/address'
import type { SavedAddress } from '../../lib/addresses'
import { signupAddress } from '../../lib/signupAddress'
import { jakarta } from '../../utils/styles'

interface AddressDialogProps {
  /** The address being edited; none for a new one. */
  initial?: SavedAddress | null
  /** Whether the new address should be the default (the first one always is). */
  firstOne: boolean
  onClose: () => void
  onSaved: (address: DeliveryAddress, makeDefault: boolean) => void
}

/**
 * Add or edit a delivery address (Account settings, "Delivery addresses"). The fields and their
 * checks are the checkout's, so an address saved here passes the carriers' rules at checkout.
 * There is no frame for the form; it follows the 648px form dialog (639:24245).
 */
export default function AddressDialog({ initial, firstOne, onClose, onSaved }: AddressDialogProps) {
  const { account } = useAuth()
  const [address, setAddress] = useState<DeliveryAddress>(
    initial
      ? { country: 'NG', region: initial.region, area: initial.area, street: initial.street, landmark: initial.landmark, postalCode: initial.postalCode, firstName: initial.firstName, lastName: initial.lastName, phone: initial.phone, email: initial.email }
      : // A new address starts from what the buyer typed at sign-up, when anything.
        { country: 'NG', region: '', area: '', ...signupAddress(account?.signupAddressDraft), postalCode: '', firstName: account?.firstName ?? '', lastName: account?.lastName ?? '', phone: account?.phoneNumber ?? '', email: account?.email ?? '' },
  )
  const [makeDefault, setMakeDefault] = useState(initial ? initial.isDefault : firstOne)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const set = (patch: Partial<DeliveryAddress>) => setAddress((a) => ({ ...a, ...patch }))
  const fieldError = (k: string) =>
    fieldErrors[k] ? (
      <p role="alert" className="text-[#b13b3b] text-[12px] leading-[20px]" style={jakarta(400)}>
        {fieldErrors[k]}
      </p>
    ) : null

  function submit(e: FormEvent) {
    e.preventDefault()
    const a = address
    const problems: Record<string, string> = {}
    const nameIssue = fullNameProblem(a.firstName, a.lastName)
    if (nameIssue) problems[/first/.test(nameIssue) ? 'firstName' : 'lastName'] = nameIssue
    const phoneIssue = phoneProblem(a.phone)
    if (phoneIssue) problems.phone = phoneIssue
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(a.email.trim())) problems.email = 'Enter an email for the delivery updates.'
    if (!a.region) problems.region = 'Choose the state the goods go to.'
    const areaIssue = areaProblem(a.area)
    if (areaIssue) problems.area = areaIssue
    const streetIssue = streetProblem(a.street)
    if (streetIssue) problems.street = streetIssue
    const postalIssue = postalCodeProblem(a.postalCode)
    if (postalIssue) problems.postalCode = postalIssue
    setFieldErrors(problems)
    if (Object.keys(problems).length) return setError('Check the highlighted details.')
    setError('')
    onSaved(
      { ...a, area: a.area.trim(), street: a.street.trim(), landmark: a.landmark.trim(), postalCode: a.postalCode.trim(), firstName: a.firstName.trim(), lastName: a.lastName.trim(), email: a.email.trim(), phone: nigerianPhone(a.phone) ?? a.phone },
      makeDefault,
    )
  }

  return (
    <Shell title={initial ? 'Edit address' : 'Add address'} onClose={onClose} onSubmit={submit} busy={false} cta={initial ? 'Save changes' : 'Save address'} cancel>
      <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
        Where orders go. The carriers read the address as written, so give the house or plot number, the road and a landmark they will know.
      </p>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="First name" htmlFor="ad-first">
          <input id="ad-first" value={address.firstName} maxLength={80} onChange={(e) => set({ firstName: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('firstName')}
        </Field>
        <Field label="Last name" htmlFor="ad-last">
          <input id="ad-last" value={address.lastName} maxLength={80} onChange={(e) => set({ lastName: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('lastName')}
        </Field>
      </div>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="Phone" htmlFor="ad-phone">
          <input id="ad-phone" type="tel" value={address.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="0803 123 4567" className={inputClass} style={jakarta(400)} />
          {fieldError('phone')}
        </Field>
        <Field label="Email" htmlFor="ad-email">
          <input id="ad-email" type="email" value={address.email} maxLength={254} onChange={(e) => set({ email: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('email')}
        </Field>
      </div>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="State" htmlFor="ad-region">
          <Select id="ad-region" value={address.region} options={regionsOf('NG')} onChange={(v) => set({ region: v })} placeholder="Select state" />
          {fieldError('region')}
        </Field>
        <Field label="Area" htmlFor="ad-area">
          <input id="ad-area" value={address.area} maxLength={120} onChange={(e) => set({ area: e.target.value })} placeholder="Surulere" className={inputClass} style={jakarta(400)} />
          {fieldError('area')}
        </Field>
      </div>
      <Field label="Street address" htmlFor="ad-street" hint="House or plot number and the road, or a well-known building">
        <input id="ad-street" value={address.street} maxLength={240} onChange={(e) => set({ street: e.target.value })} placeholder="7 Adebola Street" className={inputClass} style={jakarta(400)} />
        {fieldError('street')}
      </Field>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="Landmark" htmlFor="ad-landmark" hint="Optional">
          <input id="ad-landmark" value={address.landmark} maxLength={240} onChange={(e) => set({ landmark: e.target.value })} placeholder="Near the blue church gate" className={inputClass} style={jakarta(400)} />
        </Field>
        <Field label="Postal code" htmlFor="ad-postal">
          <input id="ad-postal" value={address.postalCode} maxLength={6} inputMode="numeric" onChange={(e) => set({ postalCode: e.target.value.replace(/\D/g, '') })} placeholder="101283" className={inputClass} style={jakarta(400)} />
          {fieldError('postalCode')}
        </Field>
      </div>
      <label className="flex items-center gap-[12px] text-[#101604] text-[14px] leading-[20px]" style={jakarta(500)}>
        <input type="checkbox" checked={makeDefault} disabled={firstOne && !initial} onChange={(e) => setMakeDefault(e.target.checked)} className="size-[18px] accent-[#007c53]" />
        Use as my default address at checkout
      </label>
      {error && (
        <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
          {error}
        </p>
      )}
    </Shell>
  )
}
