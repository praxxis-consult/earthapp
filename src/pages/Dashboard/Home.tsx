import DashboardOverview from './index'
import BuyerOverview from '../Buyer/Overview'
import { useAuth } from '../../feature/authentication/useAuth'
import { canSell } from '../../feature/authentication/role'

/** `/dashboard`: the seller's overview for an account with a store, the buyer's for one without. */
export default function DashboardHome() {
  const { account } = useAuth()
  return canSell(account) ? <DashboardOverview /> : <BuyerOverview />
}
