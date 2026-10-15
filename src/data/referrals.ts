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

/**
 * Until the API issues referral codes, the link a seller shares is their store's marketplace
 * link, which works today; the referral endpoint will replace it with a tracked link.
 */
export const referralLink = (storeId: string | undefined) =>
  storeId ? `${window.location.origin}/marketplace?store=${storeId}` : ''
