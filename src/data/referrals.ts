import { sampleReferrals } from './referrals.sample'
import { sampleMode } from './sample'

/**
 * Referrals (referral 599:19337). The API has no referrals endpoint yet, so there is no referral
 * code and no sign-ups; the endpoint replaces both. In development the sample rows in
 * ./referrals.sample.ts can be switched on (see ./sample.ts).
 */
export interface Referral {
  name: string
  email: string
  as: 'Buyer' | 'Seller'
  date: string
}

export const referrals: Referral[] = sampleMode() ? sampleReferrals : []

/** The store's handle as the frame writes it ("Akpolo Agro & Mine" → "akpolo-agro-mine"). */
export const referralHandle = (storeName: string) =>
  storeName
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * The link the seller shares (referral 599:19337: `…/r/akpolo-agro-mine`). The `/r/:handle`
 * route keeps the handle and opens sign-up; attribution waits for the API to accept a referral
 * handle on account creation and to report sign-ups.
 */
export const referralLink = (storeName: string | undefined) =>
  storeName ? `${window.location.origin}/r/${referralHandle(storeName)}` : ''
