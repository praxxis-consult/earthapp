import { apiSlice } from '../../app/api/apiSlice'
import { logOut, setAccount, setCredentials, type Credentials } from './authSlice'
import type { Account, AccountPatch, AccountType, NotificationPreferences, NotificationPreferencesPatch, OtpIntent } from '../../services/earthApi'

export interface CreateAccountBody {
  accountType: AccountType
  firstName: string
  lastName: string
  email: string
  /** Optional on the API and in the design; null when the field is left empty. */
  phoneNumber: string | null
  termsConsent: true
  /** The store handle the visitor arrived with (`/r/<handle>`), counted on that store's referrals. */
  referralHandle?: string
}

/** Accounts and one-time codes. A first confirmation signs in, as LOGIN does; both set the refresh cookie. */
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
    /** The first successful confirmation signs the account in (25 October: credentials and the refresh cookie); a replay answers `{ status: 'confirmed' }` only. */
    confirmAccount: builder.mutation<Partial<Credentials> & { status?: 'confirmed'; tokenType?: 'Bearer' }, { email: string; code: string }>({
      query: ({ email, code }) => ({ url: '/auth/otp/verify', method: 'POST', body: { email, intent: 'ACCOUNT_CONFIRMATION', code } }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data.accessToken && data.expiresAt) dispatch(setCredentials({ accessToken: data.accessToken, expiresAt: data.expiresAt }))
        } catch {
          /* the caller reports the failure */
        }
      },
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
    /** Edits the name or phone; the answer is the whole account, which replaces the cached one. */
    updateMe: builder.mutation<Account, AccountPatch>({
      query: (body) => ({ url: '/accounts/me', method: 'PATCH', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setAccount(data))
          dispatch(authApiSlice.util.upsertQueryData('getMe', undefined, data))
        } catch {
          /* the caller reports the failure */
        }
      },
    }),
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => '/accounts/me/notification-preferences',
      providesTags: ['Preferences'],
    }),
    /** One topic's channel at a time; the switch flips at once and flips back if the API refuses. */
    updateNotificationPreferences: builder.mutation<NotificationPreferences, NotificationPreferencesPatch>({
      query: (body) => ({ url: '/accounts/me/notification-preferences', method: 'PATCH', body }),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const undo = dispatch(
          authApiSlice.util.updateQueryData('getNotificationPreferences', undefined, (draft) => {
            for (const topic of ['orderUpdates', 'chatMessages', 'marketing'] as const) Object.assign(draft[topic], patch[topic])
          }),
        )
        try {
          const { data } = await queryFulfilled
          dispatch(authApiSlice.util.upsertQueryData('getNotificationPreferences', undefined, data))
        } catch {
          undo.undo()
        }
      },
    }),
    /** Disables the account at once and asks for deletion; the session is cleared the same way as a logout. */
    deleteMe: builder.mutation<null, void>({
      query: () => ({ url: '/accounts/me', method: 'DELETE', body: {} }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(logOut())
          dispatch(apiSlice.util.resetApiState())
        } catch {
          /* the dialog reports the failure */
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
  useUpdateMeMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useDeleteMeMutation,
  useLogoutMutation,
} = authApiSlice
