import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

/** The storage key for the referral handle a visitor arrived with. */
export const REFERRAL_KEY = 'earth.ref'

/**
 * `/r/:handle` (the link on the referrals page): remembers who referred this visitor and opens
 * sign-up. The handle is sent with the account once the API accepts one.
 */
export default function ReferralLanding() {
  const { handle } = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    if (handle) sessionStorage.setItem(REFERRAL_KEY, handle)
    navigate(handle ? `/signup?ref=${encodeURIComponent(handle)}` : '/signup', { replace: true })
  }, [handle, navigate])
  return null
}
