import { useAppSelector } from '../../app/hooks'
import { selectAuthStatus } from '../authentication/authSlice'
import { useListChatsQuery } from './chatsApiSlice'

/** How many threads hold unread messages (the sidebar badge); the list is polled while the dashboard is open. */
export function useUnreadChats(): number {
  const status = useAppSelector(selectAuthStatus)
  const { data } = useListChatsQuery(undefined, { skip: status !== 'authenticated', pollingInterval: 15_000 })
  return data?.filter((t) => Number(t.unreadCount) > 0).length ?? 0
}
