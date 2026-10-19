import { useState, type FormEvent } from 'react'
import { Field, Shell, inputClass } from './SettingsDialogs'
import { useAuth } from '../../feature/authentication/useAuth'
import { useGetShipbubbleCategoriesQuery, useSaveShippingProfileMutation, type DeliveryAddress, type Parcel, type ShippingProfile } from '../../feature/delivery/deliveryApiSlice'
import { describeError, toApiError, type Onboarding } from '../../services/earthApi'
import { jakarta } from '../../utils/styles'

interface DeliveryDialogProps {
  store: Onboarding
  current: ShippingProfile | null
  onClose: () => void
  onSaved: (profile: ShippingProfile) => void
}

const numberField = (v: string) => Math.round(Number(v))

/**
 * A seller's delivery setup: who the carrier meets and where (the store address, unless the
 * goods are collected elsewhere), and the parcel the goods ship in. Without it no carrier can
 * quote the store's orders, so buyers cannot order. Follows the 648px form dialog (639:24245).
 */
export default function DeliveryDialog({ store, current, onClose, onSaved }: DeliveryDialogProps) {
  const { account } = useAuth()
  const [save, { isLoading: busy }] = useSaveShippingProfileMutation()
  // The carrier's own goods categories; a quote is refused under a guessed one, so the seller picks.
  const categories = useGetShipbubbleCategoriesQuery()
  const a = store.businessAddress
  // The carriers quote from the listings' pickup address, which the API matches to this one letter
  // for letter, so the address is the store's as saved and only the contact and postal code are typed.
  const [pickup, setPickup] = useState<DeliveryAddress>({
    country: 'NG',
    region: a.region,
    area: a.area,
    street: a.street,
    landmark: a.landmark,
    postalCode: current?.profile.pickup.postalCode ?? '',
    firstName: current?.profile.pickup.firstName ?? account?.firstName ?? '',
    lastName: current?.profile.pickup.lastName ?? account?.lastName ?? '',
    phone: current?.profile.pickup.phone ?? account?.phoneNumber ?? '',
    email: current?.profile.pickup.email ?? account?.email ?? '',
  })
  const p = current?.profile.parcel
  const [parcel, setParcel] = useState({
    lengthCm: p ? String(p.lengthCm) : '',
    widthCm: p ? String(p.widthCm) : '',
    heightCm: p ? String(p.heightCm) : '',
    emptyWeightGrams: p ? String(p.emptyWeightGrams) : '',
    maxWeightKg: p ? String(p.maxWeightGrams / 1000) : '',
    shipbubbleCategoryId: p ? String(p.shipbubbleCategoryId) : '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const set = (patch: Partial<DeliveryAddress>) => setPickup((s) => ({ ...s, ...patch }))
  const setP = (patch: Partial<typeof parcel>) => setParcel((s) => ({ ...s, ...patch }))
  const fieldError = (k: string) =>
    fieldErrors[k] ? (
      <p role="alert" className="text-[#b13b3b] text-[12px] leading-[20px]" style={jakarta(400)}>
        {fieldErrors[k]}
      </p>
    ) : null

  async function submit(e: FormEvent) {
    e.preventDefault()
    const phone = pickup.phone.replace(/[\s-]/g, '')
    const problems: Record<string, string> = {}
    if (!pickup.firstName.trim()) problems.firstName = 'Who does the carrier ask for?'
    if (!pickup.lastName.trim()) problems.lastName = 'Enter the last name.'
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) problems.phone = 'Enter the number with its country code, like +2348012345678.'
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(pickup.email.trim())) problems.email = 'Enter an email for pickup updates.'
    if (!/^\d{6}$/.test(pickup.postalCode.trim())) problems.postalCode = 'Nigerian postal codes are six digits, like 100001.'
    const dims: (keyof typeof parcel)[] = ['lengthCm', 'widthCm', 'heightCm', 'emptyWeightGrams', 'maxWeightKg']
    for (const k of dims) if (!(Number(parcel[k]) > 0)) problems[k] = 'Enter a number above zero.'
    if (!problems.maxWeightKg && !problems.emptyWeightGrams && numberField(parcel.maxWeightKg) * 1000 <= numberField(parcel.emptyWeightGrams))
      problems.maxWeightKg = 'The full weight must be more than the empty package.'
    if (!(Number(parcel.shipbubbleCategoryId) > 0)) problems.shipbubbleCategoryId = 'Choose what the carriers class your goods as.'
    setFieldErrors(problems)
    if (Object.keys(problems).length) return setError('Check the highlighted details.')
    setError('')
    const parcelBody: Parcel = {
      lengthCm: numberField(parcel.lengthCm),
      widthCm: numberField(parcel.widthCm),
      heightCm: numberField(parcel.heightCm),
      emptyWeightGrams: numberField(parcel.emptyWeightGrams),
      maxWeightGrams: numberField(parcel.maxWeightKg) * 1000,
      shipbubbleCategoryId: Number(parcel.shipbubbleCategoryId),
      ...(p?.terminalPackagingId ? { terminalPackagingId: p.terminalPackagingId } : {}),
    }
    try {
      const saved = await save({
        storeId: store.id,
        expectedVersion: current?.version ?? 0,
        profile: {
          pickup: { ...pickup, area: pickup.area.trim(), street: pickup.street.trim(), landmark: pickup.landmark.trim() || 'Not provided', postalCode: pickup.postalCode.trim(), firstName: pickup.firstName.trim(), lastName: pickup.lastName.trim(), phone, email: pickup.email.trim() },
          parcel: parcelBody,
        },
      }).unwrap()
      onSaved(saved)
    } catch (err) {
      const problem = toApiError(err)
      if (problem.status === 400 && problem.errors.length) {
        const fe: Record<string, string> = {}
        for (const e of problem.errors) fe[(e.path ?? '').replace(/^profile\.(pickup|parcel)\./, '')] = e.code === 'invalid_format' ? 'Not in the form the carriers accept.' : `Check this (${e.code ?? 'invalid'}).`
        setFieldErrors(fe)
        return setError('The API could not accept some of these details. Check the highlighted fields.')
      }
      if (problem.status === 422 && problem.errors.some((e) => e.path === 'pickup' || e.path?.startsWith('pickup'))) {
        setFieldErrors({ postalCode: 'Check the postal code for this address.' })
        return setError('The carrier could not find this pickup address. It needs the street number and road name, the area as the carrier knows it, and the right postal code; the street and area are changed under Edit store details.')
      }
      setError(problem.status === 409 ? 'Someone saved newer delivery details. Reload and try again.' : describeError(err))
    }
  }

  return (
    <Shell title={current ? 'Edit delivery setup' : 'Set up delivery'} onClose={onClose} onSubmit={submit} busy={busy} cancel>
      <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
        Carriers quote a buyer's order from where they collect and what they carry. Buyers cannot order until this is set.
      </p>
      <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(600)}>
        Who the carrier meets
      </p>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="First name" htmlFor="dl-first">
          <input id="dl-first" value={pickup.firstName} maxLength={80} onChange={(e) => set({ firstName: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('firstName')}
        </Field>
        <Field label="Last name" htmlFor="dl-last">
          <input id="dl-last" value={pickup.lastName} maxLength={80} onChange={(e) => set({ lastName: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('lastName')}
        </Field>
      </div>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="Phone" htmlFor="dl-phone">
          <input id="dl-phone" type="tel" value={pickup.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+234…" className={inputClass} style={jakarta(400)} />
          {fieldError('phone')}
        </Field>
        <Field label="Email" htmlFor="dl-email">
          <input id="dl-email" type="email" value={pickup.email} maxLength={254} onChange={(e) => set({ email: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('email')}
        </Field>
      </div>
      <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(600)}>
        Where the carrier collects
      </p>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="Store address" hint="Your store address, as the listings carry it. Change it under Edit store details.">
          <p className="min-h-[48px] rounded-[30px] bg-[#f7f7f7] px-[16px] py-[12px] text-[#101604] text-[14px] leading-[24px]" style={jakarta(400)}>
            {a.street}, {a.area}, {a.region}
            {a.landmark ? ` · ${a.landmark}` : ''}
          </p>
        </Field>
        <Field label="Postal code" htmlFor="dl-postal">
          <input id="dl-postal" value={pickup.postalCode} maxLength={6} inputMode="numeric" onChange={(e) => set({ postalCode: e.target.value.replace(/\D/g, '') })} placeholder="100001" className={inputClass} style={jakarta(400)} />
          {fieldError('postalCode')}
        </Field>
      </div>
      <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(600)}>
        The package you ship in
      </p>
      <div className="flex gap-[16px] max-md:flex-col">
        {(
          [
            ['lengthCm', 'dl-length', 'Length (cm)'],
            ['widthCm', 'dl-width', 'Width (cm)'],
            ['heightCm', 'dl-height', 'Height (cm)'],
          ] as const
        ).map(([key, id, label]) => (
          <Field key={key} label={label} htmlFor={id}>
            <input id={id} inputMode="numeric" value={parcel[key]} onChange={(e) => setP({ [key]: e.target.value.replace(/\D/g, '') })} className={inputClass} style={jakarta(400)} />
            {fieldError(key)}
          </Field>
        ))}
      </div>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="Empty package weight (g)" htmlFor="dl-empty">
          <input id="dl-empty" inputMode="numeric" value={parcel.emptyWeightGrams} onChange={(e) => setP({ emptyWeightGrams: e.target.value.replace(/\D/g, '') })} className={inputClass} style={jakarta(400)} />
          {fieldError('emptyWeightGrams')}
        </Field>
        <Field label="Heaviest full package (kg)" htmlFor="dl-max" hint="Orders heavier than this cannot be quoted">
          <input id="dl-max" inputMode="decimal" value={parcel.maxWeightKg} onChange={(e) => setP({ maxWeightKg: e.target.value.replace(/[^\d.]/g, '') })} className={inputClass} style={jakarta(400)} />
          {fieldError('maxWeightKg')}
        </Field>
      </div>
      <Field label="What the carriers class your goods as" htmlFor="dl-category" hint={categories.error ? 'The carrier’s list could not be loaded; try again in a moment.' : 'The carrier prices and handles the parcel by this.'}>
        <select
          id="dl-category"
          value={parcel.shipbubbleCategoryId}
          onChange={(e) => setP({ shipbubbleCategoryId: e.target.value })}
          disabled={!categories.data}
          className={`${inputClass} disabled:opacity-60`}
          style={jakarta(400)}
        >
          <option value="">{categories.isLoading ? 'Loading…' : 'Choose a category'}</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
        {fieldError('shipbubbleCategoryId')}
      </Field>
      {error && (
        <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
          {error}
        </p>
      )}
    </Shell>
  )
}
