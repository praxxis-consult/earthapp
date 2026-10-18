import type { Account } from '../../services/earthApi'

/**
 * What an account may do, from its type. A BUYING account has no store and never sees the
 * seller's onboarding or dashboard; a SELLING account runs a store; BOTH does both.
 */
export const canSell = (account: Account | null | undefined): boolean =>
  account?.accountType === 'SELLING' || account?.accountType === 'BOTH'

export const canBuy = (account: Account | null | undefined): boolean =>
  account?.accountType === 'BUYING' || account?.accountType === 'BOTH'

/** The account runs no store: the dashboard is the buyer's. */
export const buyerOnly = (account: Account | null | undefined): boolean => Boolean(account) && !canSell(account)

/**
 * Where a sign-in lands: the page asked for; otherwise a buyer's dashboard, a seller's
 * dashboard, or the store setup when the seller's store is not live yet. `storeStatus` is
 * read only for sellers, so a buyer never calls the store endpoint it is refused on.
 */
export async function landingFor(
  account: Account,
  storeStatus: () => Promise<string | null>,
  redirectTo?: string,
): Promise<string> {
  if (redirectTo) return redirectTo
  if (!canSell(account)) return '/dashboard'
  const status = await storeStatus().catch(() => null)
  return !status || status === 'DRAFT' ? '/onboarding/store' : '/dashboard'
}
