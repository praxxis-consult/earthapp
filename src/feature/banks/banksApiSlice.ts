import { apiSlice } from '../../app/api/apiSlice'
import { countryName } from '../../data/locations'

/** What an empty bank list means: no country yet, still loading, no lookup for that country (501), or a failure. */
export function bankListHint(country: string, error: { status: number } | undefined): string {
  if (!country) return 'Select a country first'
  if (!error) return 'Loading banks…'
  if (error.status === 501) return `Bank lookup is not available in ${countryName(country)} yet.`
  return 'The bank list could not be loaded. Try again in a moment.'
}

export interface BankOption {
  /** The bank's code at the payment provider (Paystack's `code`, e.g. "058" for GTBank). */
  code: string
  name: string
}

export interface ResolvedAccount {
  accountName: string
  accountNumber: string
  bankCode: string
  /** The API's own comparison of the account name with the signed-in holder's name. */
  matchesIdentity: boolean
}

/**
 * Bank lookups on the API (Paystack behind it; the provider's key never reaches the browser):
 * the bank list for a country (`501` where the API has no lookup for that country), and the
 * name on an account from its bank and number, which needs a signed-in account ("Checking the
 * bank for the name on this account…", bank details 424:4530).
 */
export const banksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBanks: builder.query<BankOption[], { country: string }>({
      query: ({ country }) => ({ url: '/banks', params: { country } }),
      keepUnusedDataFor: 3600,
    }),
    resolveAccount: builder.query<ResolvedAccount, { country: string; bankCode?: string; bankName: string; accountNumber: string }>({
      query: (params) => ({ url: '/banks/resolve', params }),
    }),
  }),
})

export const { useGetBanksQuery, useLazyResolveAccountQuery } = banksApiSlice
