import { useCallback, useMemo } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { useAuth } from '../authentication/useAuth'
import { cartApiSlice, useGetCartQuery, useSaveCartMutation, type CartItem } from './cartApiSlice'
import { clampQuantity, groupItems, withAdded } from '../../lib/cart'
import type { Listing } from '../../lib/catalog'
import { toApiError } from '../../services/earthApi'

const EMPTY: CartItem[] = []

/**
 * The signed-in account's cart on the API. Every change is read-modify-write on the latest
 * version: the lines are read (from the cache, or again after a 409 when another device saved
 * first), changed, and saved under that version; one retry, then the error is the caller's.
 */
export function useCart() {
  const { status } = useAuth()
  const signedIn = status === 'authenticated'
  const query = useGetCartQuery(undefined, { skip: !signedIn })
  const [save] = useSaveCartMutation()
  const dispatch = useAppDispatch()
  const items = query.data?.items ?? EMPTY

  const write = useCallback(
    async (change: (items: CartItem[]) => CartItem[]): Promise<CartItem[]> => {
      for (let attempt = 0; ; attempt++) {
        const current = await dispatch(cartApiSlice.endpoints.getCart.initiate(undefined, { subscribe: false, forceRefetch: attempt > 0 })).unwrap()
        try {
          return (await save({ expectedVersion: current.version, items: change(current.items) }).unwrap()).items
        } catch (e) {
          if (toApiError(e).status !== 409 || attempt > 0) throw e
        }
      }
    },
    [dispatch, save],
  )

  /** Adds a listing, or adds to its line when it is in the cart already; answers the line's quantity now. */
  const add = useCallback(
    async (p: Listing, quantity: number): Promise<number> => {
      let now = 0
      await write((lines) => {
        const r = withAdded(lines, p, quantity)
        now = r.quantity
        return r.items
      })
      return now
    },
    [write],
  )
  /** Sets a line's quantity, within the listing's bounds when they are known. */
  const setQuantity = useCallback(
    (productId: string, quantity: number, bounds?: Pick<Listing, 'moq' | 'available'>) =>
      write((lines) => lines.map((l) => (l.productId === productId ? { ...l, quantity: bounds ? clampQuantity(bounds, quantity) : Math.max(1, Math.round(quantity)) } : l))),
    [write],
  )
  const remove = useCallback((productId: string) => write((lines) => lines.filter((l) => l.productId !== productId)), [write])
  /** After a store's lines became an order, they leave the cart. */
  const clearStore = useCallback((storeId: string) => write((lines) => lines.filter((l) => l.storeId !== storeId)), [write])
  const clear = useCallback(() => write(() => []), [write])
  const lineFor = useCallback((productId: string) => items.find((l) => l.productId === productId), [items])
  const groups = useMemo(() => groupItems(items), [items])

  return { items, groups, count: items.length, version: query.data?.version ?? 0, loading: signedIn && query.isLoading, error: query.error, refetch: query.refetch, add, setQuantity, remove, clearStore, clear, lineFor }
}
