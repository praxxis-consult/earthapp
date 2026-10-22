import { useCallback, useSyncExternalStore } from 'react'
import type { Listing } from './catalog'

/**
 * The buyer's cart. The API has no cart endpoint (an order is made from one quote, and a quote
 * holds the lines of one store), so the cart lives in this browser under the account's id, the
 * way the saved list does, and checks out one store at a time. It moves to the API the day one
 * exists; the cart page says where it is kept.
 */
export interface CartLine {
  listing: Listing
  quantity: number
  addedAt: string
}

/** One store's lines: what a single quote, and so a single order, can hold. */
export interface CartGroup {
  storeId: string
  storeName: string
  lines: CartLine[]
  /** Goods only, in naira; delivery is quoted at checkout. */
  goodsTotal: number
}

const KEY = (accountId: string) => `earth.cart.${accountId}`
const listeners = new Set<() => void>()
const cache = new Map<string, CartLine[]>()

function read(accountId: string): CartLine[] {
  const hit = cache.get(accountId)
  if (hit) return hit
  let list: CartLine[] = []
  try {
    const raw = localStorage.getItem(KEY(accountId))
    if (raw) list = JSON.parse(raw) as CartLine[]
  } catch {
    /* storage blocked or malformed: an empty cart */
  }
  cache.set(accountId, list)
  return list
}

function write(accountId: string, list: CartLine[]) {
  cache.set(accountId, list)
  try {
    localStorage.setItem(KEY(accountId), JSON.stringify(list))
  } catch {
    /* storage blocked: the cart lives for the session */
  }
  listeners.forEach((l) => l())
}

/** A listing's quantity, kept between its minimum order and what is available (at least the minimum when nothing is left). */
export const clampQuantity = (p: Pick<Listing, 'moq' | 'available'>, n: number) => Math.min(Math.max(p.moq, Math.round(n) || p.moq), Math.max(p.available, p.moq))

/** Adds a listing, or adds to its line when it is in the cart already; answers the line's quantity now. */
export function addToCart(accountId: string, p: Listing, quantity: number): number {
  const list = read(accountId)
  const at = list.findIndex((l) => l.listing.id === p.id)
  const next = clampQuantity(p, at >= 0 ? list[at].quantity + quantity : quantity)
  if (at >= 0) write(accountId, list.map((l, i) => (i === at ? { ...l, listing: p, quantity: next } : l)))
  else write(accountId, [...list, { listing: p, quantity: next, addedAt: new Date().toISOString() }])
  return next
}

export function setCartQuantity(accountId: string, id: string, quantity: number) {
  write(
    accountId,
    read(accountId).map((l) => (l.listing.id === id ? { ...l, quantity: clampQuantity(l.listing, quantity) } : l)),
  )
}

export function removeFromCart(accountId: string, id: string) {
  write(accountId, read(accountId).filter((l) => l.listing.id !== id))
}

/** After a store's lines became an order, they leave the cart. */
export function clearStoreLines(accountId: string, storeId: string) {
  write(accountId, read(accountId).filter((l) => l.listing.store.id !== storeId))
}

/** The cart grouped by store, in the order stores were first added to it. */
export function groupByStore(lines: CartLine[]): CartGroup[] {
  const groups: CartGroup[] = []
  for (const line of lines) {
    const id = line.listing.store.id
    let g = groups.find((x) => x.storeId === id)
    if (!g) groups.push((g = { storeId: id, storeName: line.listing.store.storeName, lines: [], goodsTotal: 0 }))
    g.lines.push(line)
    g.goodsTotal += line.quantity * line.listing.priceNum
  }
  return groups
}

/** For tests and sign-out: forget what is cached in memory (the browser's copy stays). */
export function resetCartCache() {
  cache.clear()
}

const EMPTY: CartLine[] = []

export function useCart(accountId: string | undefined) {
  const lines = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => (accountId ? read(accountId) : EMPTY),
    () => EMPTY,
  )
  const add = useCallback((p: Listing, quantity: number) => (accountId ? addToCart(accountId, p, quantity) : 0), [accountId])
  const setQuantity = useCallback((id: string, quantity: number) => accountId && setCartQuantity(accountId, id, quantity), [accountId])
  const remove = useCallback((id: string) => accountId && removeFromCart(accountId, id), [accountId])
  const clearStore = useCallback((storeId: string) => accountId && clearStoreLines(accountId, storeId), [accountId])
  const lineFor = useCallback((id: string) => lines.find((l) => l.listing.id === id), [lines])
  return { lines, groups: groupByStore(lines), count: lines.length, add, setQuantity, remove, clearStore, lineFor }
}
