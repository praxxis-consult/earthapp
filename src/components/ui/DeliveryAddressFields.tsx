import { lazy, Suspense, useState } from 'react'
import { Field, Select, inputClass } from './SettingsDialogs'
import gpsIcon from '../../assets/icons/su-gps.svg'
import type { GeoAddress } from '../../lib/geocode'

const MapPickerDialog = lazy(() => import('./MapPickerDialog'))
import type { DeliveryAddress } from '../../feature/delivery/deliveryApiSlice'
import { regionsOf } from '../../data/locations'
import { earliestPickupDay, latestPickupDay } from '../../lib/address'
import { jakarta } from '../../utils/styles'

interface DeliveryAddressFieldsProps {
  address: DeliveryAddress
  onChange: (patch: Partial<DeliveryAddress>) => void
  /** One line under a field, keyed by its name (`postalCode`, `pickupDate`, …). */
  fieldErrors: Record<string, string>
  /** Distinguishes the ids when two forms share a page. */
  idPrefix?: string
  /** When given, the "Earliest pickup day" field is shown and bound. */
  pickupDate?: string
  onPickupDate?: (day: string) => void
}

/**
 * The delivery address as the checkout and the saved-addresses dialog ask for it: name, phone and
 * email, then state, area, street, landmark and postal code, and (at checkout) the earliest day the
 * carrier may collect. The checks for it are `addressProblems` in lib/address.
 */
export default function DeliveryAddressFields({ address, onChange, fieldErrors, idPrefix = 'co', pickupDate, onPickupDate }: DeliveryAddressFieldsProps) {
  const id = (k: string) => `${idPrefix}-${k}`
  const [mapOpen, setMapOpen] = useState(false)
  // A pin on the map fills the fields it knows; a typed landmark is kept over the map's.
  function fromMap(a: GeoAddress) {
    setMapOpen(false)
    onChange({ street: a.street || address.street, area: a.area || address.area, region: a.region || address.region, postalCode: a.postalCode || address.postalCode, landmark: address.landmark || a.landmark })
  }
  const fieldError = (k: string) =>
    fieldErrors[k] ? (
      <p role="alert" className="text-[#b13b3b] text-[12px] leading-[20px]" style={jakarta(400)}>
        {fieldErrors[k]}
      </p>
    ) : null
  return (
    <>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="First name" htmlFor={id('first')}>
          <input id={id('first')} value={address.firstName} maxLength={80} onChange={(e) => onChange({ firstName: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('firstName')}
        </Field>
        <Field label="Last name" htmlFor={id('last')}>
          <input id={id('last')} value={address.lastName} maxLength={80} onChange={(e) => onChange({ lastName: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('lastName')}
        </Field>
      </div>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="Phone" htmlFor={id('phone')}>
          <input id={id('phone')} type="tel" value={address.phone} onChange={(e) => onChange({ phone: e.target.value })} placeholder="0803 123 4567" className={inputClass} style={jakarta(400)} />
          {fieldError('phone')}
        </Field>
        <Field label="Email" htmlFor={id('email')}>
          <input id={id('email')} type="email" value={address.email} maxLength={254} onChange={(e) => onChange({ email: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('email')}
        </Field>
      </div>
      {/* The API delivers within Nigeria only today, so the country is not a choice. */}
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="State" htmlFor={id('region')}>
          <Select id={id('region')} value={address.region} options={regionsOf('NG')} onChange={(v) => onChange({ region: v })} placeholder="Select state" />
          {fieldError('region')}
        </Field>
        <Field label="Area" htmlFor={id('area')}>
          <input id={id('area')} value={address.area} maxLength={120} onChange={(e) => onChange({ area: e.target.value })} placeholder="Lekki Phase 1" className={inputClass} style={jakarta(400)} />
          {fieldError('area')}
        </Field>
      </div>
      <Field label="Street address" htmlFor={id('street')} hint="House or plot number and the road, or a well-known building">
        {/* "Select from map" as on the sign-up form (828:27009): the pin fills street, area, state and postal code. */}
        <div className="flex h-[48px] items-center gap-[8px] rounded-[30px] bg-[#f7f7f7] px-[16px]">
          <input id={id('street')} value={address.street} maxLength={240} onChange={(e) => onChange({ street: e.target.value })} placeholder="12 Admiralty Way" className="h-full min-w-0 flex-1 bg-transparent text-[14px] leading-[24px] text-[#101604] outline-none placeholder:text-[#807e7e]" style={jakarta(400)} />
          <button type="button" onClick={() => setMapOpen(true)} className="flex shrink-0 items-center gap-[8px]" aria-label="Select from map">
            <img src={gpsIcon} alt="" className="size-[20px]" />
            <span className="text-[#007c53] text-[12px] leading-[24px] whitespace-nowrap max-sm:hidden" style={jakarta(500)}>
              Select from map
            </span>
          </button>
        </div>
        {fieldError('street')}
      </Field>
      {mapOpen && (
        <Suspense fallback={null}>
          <MapPickerDialog onPick={fromMap} onClose={() => setMapOpen(false)} />
        </Suspense>
      )}
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="Landmark" htmlFor={id('landmark')} hint="Optional">
          <input id={id('landmark')} value={address.landmark} maxLength={240} onChange={(e) => onChange({ landmark: e.target.value })} className={inputClass} style={jakarta(400)} />
        </Field>
        <Field label="Postal code" htmlFor={id('postal')}>
          <input id={id('postal')} value={address.postalCode} maxLength={6} inputMode="numeric" onChange={(e) => onChange({ postalCode: e.target.value.replace(/\D/g, '') })} placeholder="106104" className={inputClass} style={jakarta(400)} />
          {fieldError('postalCode')}
        </Field>
      </div>
      {pickupDate !== undefined && onPickupDate && (
        <Field label="Earliest pickup day" htmlFor={id('pickup')} hint="When the carrier may collect from the seller: up to a week ahead, from today before 6 PM Lagos time, else from tomorrow">
          <input id={id('pickup')} type="date" value={pickupDate} min={earliestPickupDay()} max={latestPickupDay()} onChange={(e) => onPickupDate(e.target.value)} className={inputClass} style={jakarta(400)} />
          {fieldError('pickupDate')}
        </Field>
      )}
    </>
  )
}
