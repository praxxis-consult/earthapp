import type { SignupAddressDraft } from '../services/earthApi'

/**
 * The address and landmark a buyer types at sign-up (create acc 805:7443). They go with the
 * account as `signupAddressDraft` (25 October), which follows the buyer to any device until a
 * complete delivery address is saved. This browser's session also keeps them, with the area,
 * state and postal code a map pin gave, so the first address form on this device starts from
 * the structured pieces rather than one line.
 */
const KEY = 'earth.signup-address'

export interface SignupAddress {
  street: string
  landmark: string
  /** Filled when the address came from the map pin; '' when typed. */
  area?: string
  region?: string
  postalCode?: string
}

export function rememberSignupAddress(a: SignupAddress) {
  try {
    if (a.street.trim() || a.landmark.trim()) sessionStorage.setItem(KEY, JSON.stringify({ street: a.street.trim(), landmark: a.landmark.trim(), area: a.area?.trim() ?? '', region: a.region ?? '', postalCode: a.postalCode?.trim() ?? '' }))
  } catch {
    /* storage blocked */
  }
}

/** What sign-up kept on this device, else the account's draft (one address line and a landmark); empty strings otherwise. */
export function signupAddress(draft?: SignupAddressDraft | null): SignupAddress {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) {
      const a = JSON.parse(raw) as Partial<SignupAddress>
      const str = (v: unknown) => (typeof v === 'string' ? v : '')
      return { street: str(a.street), landmark: str(a.landmark), area: str(a.area), region: str(a.region), postalCode: str(a.postalCode) }
    }
  } catch {
    /* storage blocked or malformed */
  }
  return { street: draft?.address ?? '', landmark: draft?.landmark ?? '', area: '', region: '', postalCode: '' }
}

export function forgetSignupAddress() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* storage blocked */
  }
}
