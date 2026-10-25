import DeliveryAddressFields from './DeliveryAddressFields'
import OptionRow from './OptionRow'
import { Field, inputClass } from './SettingsDialogs'
import type { DeliveryAddress } from '../../feature/delivery/deliveryApiSlice'
import { addressLine, NEW_ADDRESS, type SavedAddress } from '../../lib/addresses'
import { earliestPickupDay, latestPickupDay } from '../../lib/address'
import locationIcon from '../../assets/icons/as-location-24.svg'
// The settings page's plus, in the tile's green (the exported glyph is white, for the lime button).
import addIcon from '../../assets/icons/co-add.svg'
import { jakarta } from '../../utils/styles'


interface AddressStepProps {
  saved: SavedAddress[]
  picked: string
  onPick: (id: string) => void
  /** The typed address, used when `picked` is NEW_ADDRESS. */
  address: DeliveryAddress
  onChange: (patch: Partial<DeliveryAddress>) => void
  fieldErrors: Record<string, string>
  pickupDate: string
  onPickupDate: (day: string) => void
  idPrefix?: string
}

/**
 * The checkout's address step. The buyer's saved addresses (Account settings, on the API) are
 * offered as rows to pick, the default first; "Use a different address" opens the form. With
 * nothing saved, the form is the step. The earliest pickup day sits under either.
 */
export default function AddressStep({ saved, picked, onPick, address, onChange, fieldErrors, pickupDate, onPickupDate, idPrefix = 'co' }: AddressStepProps) {
  const typing = saved.length === 0 || picked === NEW_ADDRESS
  const ordered = [...saved].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
  return (
    <>
      {saved.length > 0 && (
        <div role="radiogroup" aria-label="Delivery address" className="flex flex-col gap-[8px]">
          {ordered.map((a) => (
            <OptionRow key={a.id} name={`${idPrefix}-saved`} value={a.id} checked={picked === a.id} onChange={() => onPick(a.id)} icon={locationIcon} title={addressLine(a)} subtitle={`${a.firstName} ${a.lastName} · ${a.phone}`} badge={a.isDefault ? 'Default' : undefined} />
          ))}
          <OptionRow name={`${idPrefix}-saved`} value={NEW_ADDRESS} checked={picked === NEW_ADDRESS} onChange={() => onPick(NEW_ADDRESS)} icon={addIcon} title="Use a different address" subtitle="Typed for this order only" />
        </div>
      )}
      {typing && <DeliveryAddressFields address={address} onChange={onChange} fieldErrors={fieldErrors} idPrefix={idPrefix} />}
      <Field label="Earliest pickup day" htmlFor={`${idPrefix}-pickup`} hint="When the carrier may collect from the seller: up to a week ahead, from today before 6 PM Lagos time, else from tomorrow">
        <input id={`${idPrefix}-pickup`} type="date" value={pickupDate} min={earliestPickupDay()} max={latestPickupDay()} onChange={(e) => onPickupDate(e.target.value)} className={inputClass} style={jakarta(400)} />
        {fieldErrors.pickupDate && (
          <p role="alert" className="text-[#b13b3b] text-[12px] leading-[20px]" style={jakarta(400)}>
            {fieldErrors.pickupDate}
          </p>
        )}
      </Field>
    </>
  )
}
