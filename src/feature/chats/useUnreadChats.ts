import { useAppSelector } from '../../app/hooks'
import { selectLive } from '../realtime/realtimeSlice'
import { selectAuthStatus } from '../authentication/authSlice'
import { useListChatsQuery } from './chatsApiSlice'

/** How many threads hold unread messages (the sidebar badge); the list is polled while the dashboard is open and no live channel is up. */
export function useUnreadChats(): number {
  const status = useAppSelector(selectAuthStatus)
  const live = useAppSelector(selectLive)
  const { data } = useListChatsQuery(undefined, { skip: status !== 'authenticated', pollingInterval: live ? 0 : 30_000 })
  return data?.filter((t) => Number(t.unreadCount) > 0).length ?? 0
}
