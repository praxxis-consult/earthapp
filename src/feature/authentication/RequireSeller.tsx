import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectAccount } from './authSlice'
import { canSell } from './role'

/**
 * Wraps the store onboarding and the seller-only dashboard pages. A buying account has no
 * store, so it is sent to its own dashboard (`to`) instead of a page the API would refuse.
 */
export default function RequireSeller({ to = '/dashboard' }: { to?: string }) {
  const account = useAppSelector(selectAccount)
  if (account && !canSell(account)) return <Navigate to={to} replace />
  return <Outlet />
}
