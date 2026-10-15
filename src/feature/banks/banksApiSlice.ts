import { apiSlice } from '../../app/api/apiSlice'

export interface BankOption {
  /** The bank's code at the payment provider (Paystack's `code`, e.g. "058" for GTBank). */
  code: string
  name: string
}

export interface ResolvedAccount {
  accountName: string
  accountNumber: string
  bankCode?: string
}

/**
 * Bank lookups, backed by Paystack on the API side (the provider's secret key never reaches the
 * browser): the bank list for a country, and the name on an account from its bank and number
 * ("Checking the bank for the name on this account…", bank details 424:4530). Neither endpoint
 * exists on the API yet; until it does the callers fall back to a typed account name.
 */
export const banksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBanks: builder.query<BankOption[], { country: string }>({
      query: ({ country }) => ({ url: '/banks', params: { country } }),
      transformResponse: (res: BankOption[] | { items: BankOption[] }) => (Array.isArray(res) ? res : res.items),
    }),
    resolveAccount: builder.query<ResolvedAccount, { country: string; bankCode?: string; bankName: string; accountNumber: string }>({
      query: (params) => ({ url: '/banks/resolve', params }),
    }),
  }),
})

export const { useGetBanksQuery, useLazyResolveAccountQuery } = banksApiSlice
