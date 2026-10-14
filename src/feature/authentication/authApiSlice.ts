import { apiSlice } from '../../app/api/apiSlice'
import { logOut, setAccount, setCredentials, type Credentials } from './authSlice'
import type { Account, AccountType, OtpIntent } from '../../services/earthApi'

export interface CreateAccountBody {
  accountType: AccountType
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  termsConsent: true
}

/** Accounts and one-time codes. Confirmation does not sign in; LOGIN does and sets the refresh cookie. */
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAccount: builder.mutation<{ status: 'accepted' }, CreateAccountBody>({
      query: (body) => ({ url: '/accounts', method: 'POST', body }),
    }),
    requestOtp: builder.mutation<{ status: 'accepted' }, { email: string; intent: OtpIntent }>({
      query: (body) => ({ url: '/auth/otp/request', method: 'POST', body }),
    }),
    resendOtp: builder.mutation<{ status: 'accepted' }, { email: string; intent: OtpIntent }>({
      query: (body) => ({ url: '/auth/otp/resend', method: 'POST', body }),
    }),
    confirmAccount: builder.mutation<{ status: 'confirmed' }, { email: string; code: string }>({
      query: ({ email, code }) => ({ url: '/auth/otp/verify', method: 'POST', body: { email, intent: 'ACCOUNT_CONFIRMATION', code } }),
    }),
    login: builder.mutation<Credentials & { tokenType: 'Bearer' }, { email: string; code: string }>({
      query: ({ email, code }) => ({ url: '/auth/otp/verify', method: 'POST', body: { email, intent: 'LOGIN', code } }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials({ accessToken: data.accessToken, expiresAt: data.expiresAt }))
        } catch {
          /* the caller reports the failure */
        }
      },
    }),
    getMe: builder.query<Account, void>({
      query: () => '/accounts/me',
      providesTags: ['Account'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setAccount(data))
        } catch {
          /* the caller reports the failure */
        }
      },
    }),
    logout: builder.mutation<null, void>({
      query: () => ({ url: '/auth/logout', method: 'POST', body: {} }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } finally {
          dispatch(logOut())
          dispatch(apiSlice.util.resetApiState())
        }
      },
    }),
  }),
})

export const {
  useCreateAccountMutation,
  useRequestOtpMutation,
  useResendOtpMutation,
  useConfirmAccountMutation,
  useLoginMutation,
  useLazyGetMeQuery,
  useLogoutMutation,
} = authApiSlice
