/**
 * The address and landmark a buyer types at sign-up (create acc 805:7443). The API's account
 * has no address fields, so they are kept in this browser's session and offered back the first
 * time an address is needed: the checkout's typed address and the Add address dialog start from
 * them. They go with the sign-up as soon as the API takes them.
 */
const KEY = 'earth.signup-address'

export interface SignupAddress {
  street: string
  landmark: string
}

export function rememberSignupAddress(a: SignupAddress) {
  try {
    if (a.street.trim() || a.landmark.trim()) sessionStorage.setItem(KEY, JSON.stringify({ street: a.street.trim(), landmark: a.landmark.trim() }))
  } catch {
    /* storage blocked */
  }
}

/** What sign-up kept, if anything; empty strings otherwise. */
export function signupAddress(): SignupAddress {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) {
      const a = JSON.parse(raw) as Partial<SignupAddress>
      return { street: typeof a.street === 'string' ? a.street : '', landmark: typeof a.landmark === 'string' ? a.landmark : '' }
    }
  } catch {
    /* storage blocked or malformed */
  }
  return { street: '', landmark: '' }
}

export function forgetSignupAddress() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* storage blocked */
  }
}
