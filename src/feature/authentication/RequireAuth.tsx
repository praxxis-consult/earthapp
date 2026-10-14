import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectAuthStatus } from './authSlice'

/**
 * Wraps the onboarding and dashboard routes. Anonymous visitors are sent to the home page with
 * the login modal open and the path they wanted, so they land back here after the code.
 */
export default function RequireAuth() {
  const status = useAppSelector(selectAuthStatus)
  const location = useLocation()
  if (status === 'loading') return <div className="min-h-screen bg-[#f7f7f7]" aria-busy="true" />
  if (status === 'anonymous') return <Navigate to="/" replace state={{ login: true, from: location.pathname }} />
  return <Outlet />
}
