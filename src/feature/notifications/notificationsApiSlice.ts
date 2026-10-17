import { apiSlice } from '../../app/api/apiSlice'
import type { Page } from '../stores/storesApiSlice'

export type NotificationCategory = 'chatMessages' | 'orderUpdates' | 'security' | 'marketing'

export interface Notification {
  id: string
  category: NotificationCategory | string
  /** A dotted event name, e.g. `chat.message.created`. */
  kind: string
  /** The thread, order or account the event is about. */
  resourceId: string
  createdAt: string
  readAt: string | null
}

/**
 * The account's inbox (`GET /notifications`, newest first) and its unread counter. The API has no
 * live channel, so the topbar polls the counter and reads the first page when the bell opens.
 */
export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUnreadCount: builder.query<number, void>({
      query: () => '/notifications/unread-count',
      transformResponse: (res: { unreadCount: string }) => Number(res.unreadCount) || 0,
      providesTags: ['Notifications'],
    }),
    /** The newest page of the inbox. */
    listNotifications: builder.query<Notification[], void>({
      query: () => '/notifications?limit=20&page=1',
      transformResponse: (res: Page<Notification>) => res.items,
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation<{ id: string; read: true }, string>({
      query: (id) => ({ url: `/notifications/${encodeURIComponent(id)}/read`, method: 'POST', body: {} }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // Read at once; the counter and the row flip back if the API refuses.
        const row = dispatch(
          notificationsApiSlice.util.updateQueryData('listNotifications', undefined, (draft) => {
            const n = draft.find((x) => x.id === id)
            if (n && !n.readAt) n.readAt = new Date().toISOString()
          }),
        )
        const count = dispatch(notificationsApiSlice.util.updateQueryData('getUnreadCount', undefined, (draft) => Math.max(0, draft - 1)))
        try {
          await queryFulfilled
        } catch {
          row.undo()
          count.undo()
        }
      },
    }),
  }),
})

export const { useGetUnreadCountQuery, useListNotificationsQuery, useMarkNotificationReadMutation } = notificationsApiSlice
