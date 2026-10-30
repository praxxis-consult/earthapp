/**
 * Types for the Earth API (v1), and imperative wrappers over the RTK Query endpoints for the
 * few modules that run outside React (the onboarding draft, dialogs' save handlers). Components
 * use the generated hooks from src/feature/* directly; the wrappers go through the same store,
 * so the cache, tags and refresh logic are shared.
 */
import { store } from '../app/store'
import { toApiError } from '../app/api/problem'
import { authApiSlice, type CreateAccountBody } from '../feature/authentication/authApiSlice'
import { storesApiSlice } from '../feature/stores/storesApiSlice'
import { productsApiSlice } from '../feature/products/productsApiSlice'
import { uploadsApiSlice, type UploadPurpose } from '../feature/uploads/uploadsApiSlice'

export { ApiError, describeError, toApiError, type ApiProblem, type Problem } from '../app/api/problem'

/* ---------- accounts & auth ---------- */

export type AccountType = 'BUYING' | 'SELLING' | 'BOTH'
export type OtpIntent = 'ACCOUNT_CONFIRMATION' | 'LOGIN'

export interface Account {
  id: string
  accountType: AccountType
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  status: 'CONFIRMED'
  confirmedAt: string
  /** What the buyer typed for an address at sign-up (25 October): kept until a complete delivery address is saved, then cleared with a PATCH. */
  signupAddressDraft: SignupAddressDraft | null
}
export interface SignupAddressDraft {
  address: string | null
  landmark: string | null
}
/** `PATCH /accounts/me`: the name and the optional phone; the email is the sign-in and stays. `signupAddressDraft` can only be cleared. */
export interface AccountPatch {
  firstName?: string
  lastName?: string
  phoneNumber?: string | null
  signupAddressDraft?: null
}

/* ---------- notification preferences ---------- */

export interface NotificationChannels {
  inApp: boolean
  email: boolean
}
export type NotificationTopic = 'orderUpdates' | 'chatMessages' | 'marketing'
/** The seller's choices per topic; security notices are always on and the API says so. */
export interface NotificationPreferences extends Record<NotificationTopic, NotificationChannels> {
  mandatory: { security: NotificationChannels }
}
export type NotificationPreferencesPatch = Partial<Record<NotificationTopic, Partial<NotificationChannels>>>

/* ---------- stores & onboarding ---------- */

export interface Address {
  country: string
  region: string
  area: string
  street: string
  landmark: string
}
export type IdentityType = 'NIN' | 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'VOTER_ID' | 'OTHER'
export interface Identity {
  type: IdentityType
  number: string
}
/** Who the API asks for the name on an account: Moniepoint for Nigeria, Paystack for Ghana (its own rule; the app never picks). */
export type BankProvider = 'MONIEPOINT' | 'PAYSTACK'
export interface Bank {
  country: string
  bankName: string
  /** The bank's code at the payment provider; required to go LIVE, it comes from the bank list and the name lookup. */
  bankCode?: string
  accountNumber: string
  accountName: string
  /** Which provider checked the account, set by the API when it saves the bank; sent back as read. */
  provider?: BankProvider
}
/** When the store is open: ISO weekday 1 (Monday) to 7, up to two intervals a day, "HH:MM" (closes may be "24:00"). */
export interface OpeningHours {
  timezone: string
  days: { day: number; intervals: { opens: string; closes: string }[] }[]
}
export interface Onboarding {
  id: string
  storeName: string
  categoryIds: string[]
  businessAddress: Address
  status: 'DRAFT' | 'LIVE' | 'SUSPENDED'
  version: number
  liveAt: string | null
  verificationStatus: 'UNVERIFIED' | 'VERIFIED'
  /** Whether the saved bank account passed the provider's name check (it only does when the store goes LIVE). */
  bankVerificationStatus?: 'UNVERIFIED' | 'VERIFIED'
  verifiedAt?: string | null
  identity?: Identity
  bank?: Bank
  selfieUrl?: string
  description?: string | null
  openingHours?: OpeningHours | null
  missingFields: string[]
}
export interface OnboardingDraft {
  storeName?: string
  categoryIds?: string[]
  businessAddress?: Address
  identity?: Identity
  bank?: Bank
  selfieUrl?: string
  description?: string | null
  openingHours?: OpeningHours | null
}
export interface Category {
  id: string
  name: string
}

/* ---------- products ---------- */

export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
export interface PickupHours {
  timezone: string
  days: { day: Weekday; intervals: { opens: string; closes: string }[] }[]
}
export interface ProductInput {
  id?: string
  productName?: string
  categoryId?: string
  description?: string
  price?: string
  currency?: 'NGN'
  soldAs?: string
  approximateWeightGrams?: number
  moq?: number
  images?: { url: string; isPrimary: boolean }[]
  availableQuantity?: number
  pickupLocation?: { type: 'BUSINESS' } | { type: 'CUSTOM'; address: Address }
  pickupHours?: PickupHours
  note?: string
  status: 'DRAFT' | 'PUBLISHED'
  expectedVersion: number
}
export interface Product extends Omit<ProductInput, 'expectedVersion' | 'id'> {
  id: string
  storeId: string
  sku: string
  version: number
  createdAt: string
  updatedAt: string
}

/* ---------- imperative wrappers (modules outside React) ---------- */

/** Runs a mutation thunk and rethrows its problem as an ApiError. */
async function mutate<T>(thunk: { unwrap(): Promise<T> }): Promise<T> {
  try {
    return await thunk.unwrap()
  } catch (e) {
    throw toApiError(e)
  }
}

/** Runs a query thunk fresh, releases its subscription, and rethrows as an ApiError. */
async function fetchFresh<T>(thunk: { unwrap(): Promise<T>; unsubscribe(): void }): Promise<T> {
  try {
    return await thunk.unwrap()
  } catch (e) {
    throw toApiError(e)
  } finally {
    thunk.unsubscribe()
  }
}

export const accounts = {
  create: (data: CreateAccountBody) => mutate(store.dispatch(authApiSlice.endpoints.createAccount.initiate(data))),
  requestOtp: (email: string, intent: OtpIntent) => mutate(store.dispatch(authApiSlice.endpoints.requestOtp.initiate({ email, intent }))),
  resendOtp: (email: string, intent: OtpIntent) => mutate(store.dispatch(authApiSlice.endpoints.resendOtp.initiate({ email, intent }))),
  confirm: (email: string, code: string) => mutate(store.dispatch(authApiSlice.endpoints.confirmAccount.initiate({ email, code }))),
  login: (email: string, code: string) => mutate(store.dispatch(authApiSlice.endpoints.login.initiate({ email, code }))),
  me: () => fetchFresh(store.dispatch(authApiSlice.endpoints.getMe.initiate(undefined, { forceRefetch: true }))),
  logout: () => mutate(store.dispatch(authApiSlice.endpoints.logout.initiate())),
}

export const stores = {
  /** null when the account has no store yet (the API answers 404). */
  onboarding: () => fetchFresh(store.dispatch(storesApiSlice.endpoints.getOnboarding.initiate(undefined, { forceRefetch: true }))),
  saveDraft: (draft: OnboardingDraft, expectedVersion: number) =>
    mutate(store.dispatch(storesApiSlice.endpoints.saveOnboarding.initiate({ ...draft, status: 'DRAFT', expectedVersion }))),
  goLive: (full: Required<OnboardingDraft>, expectedVersion: number) =>
    mutate(store.dispatch(storesApiSlice.endpoints.saveOnboarding.initiate({ ...full, status: 'LIVE', expectedVersion }))),
  categories: () => fetchFresh(store.dispatch(storesApiSlice.endpoints.getCategories.initiate())),
}

export const uploads = {
  image: (file: File, purpose: UploadPurpose) => mutate(store.dispatch(uploadsApiSlice.endpoints.uploadImage.initiate({ file, purpose }))),
}

export const products = {
  save: (input: ProductInput) => mutate(store.dispatch(productsApiSlice.endpoints.saveProduct.initiate(input))),
  mine: (status?: 'DRAFT' | 'PUBLISHED') =>
    fetchFresh(store.dispatch(productsApiSlice.endpoints.getMyProducts.initiate(status, { forceRefetch: true }))),
  one: (id: string) => fetchFresh(store.dispatch(productsApiSlice.endpoints.getProduct.initiate(id, { forceRefetch: true }))),
}
