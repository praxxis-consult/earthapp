import { useCallback, useSyncExternalStore } from 'react'
import type { DeliveryAddress } from '../feature/delivery/deliveryApiSlice'

/**
 * The buyer's delivery addresses (Account settings, "Delivery addresses"). The API takes the
 * address with every quote and keeps none, so the list lives in this browser under the
 * account's id, like the cart and the saved list; the default one starts the checkout off.
 * It moves to the API the day an addresses endpoint exists.
 */
export interface SavedAddress extends DeliveryAddress {
  id: string
  isDefault: boolean
  savedAt: string
}

const KEY = (accountId: string) => `earth.addresses.${accountId}`
const listeners = new Set<() => void>()
const cache = new Map<string, SavedAddress[]>()

function read(accountId: string): SavedAddress[] {
  const hit = cache.get(accountId)
  if (hit) return hit
  let list: SavedAddress[] = []
  try {
    const raw = localStorage.getItem(KEY(accountId))
    if (raw) list = JSON.parse(raw) as SavedAddress[]
  } catch {
    /* storage blocked or malformed: no addresses */
  }
  cache.set(accountId, list)
  return list
}

function write(accountId: string, list: SavedAddress[]) {
  cache.set(accountId, list)
  try {
    localStorage.setItem(KEY(accountId), JSON.stringify(list))
  } catch {
    /* storage blocked: the list lives for the session */
  }
  listeners.forEach((l) => l())
}

const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)

/** Adds an address; the first one saved is the default, as is any saved with `isDefault`. */
export function addAddress(accountId: string, a: DeliveryAddress, isDefault = false): SavedAddress {
  const list = read(accountId)
  const entry: SavedAddress = { ...a, id: newId(), isDefault: isDefault || list.length === 0, savedAt: new Date().toISOString() }
  write(accountId, [...(entry.isDefault ? list.map((x) => ({ ...x, isDefault: false })) : list), entry])
  return entry
}

export function updateAddress(accountId: string, id: string, a: DeliveryAddress) {
  write(
    accountId,
    read(accountId).map((x) => (x.id === id ? { ...x, ...a } : x)),
  )
}

export function setDefaultAddress(accountId: string, id: string) {
  write(
    accountId,
    read(accountId).map((x) => ({ ...x, isDefault: x.id === id })),
  )
}

/** Removes an address; when it was the default, the first remaining one takes over. */
export function removeAddress(accountId: string, id: string) {
  const rest = read(accountId).filter((x) => x.id !== id)
  if (rest.length && !rest.some((x) => x.isDefault)) rest[0] = { ...rest[0], isDefault: true }
  write(accountId, rest)
}

/** "7 Adebola Street, Surulere" and "Landmark: …" as the list shows them. */
export const addressLine = (a: DeliveryAddress) => [a.street, a.area, a.region].filter(Boolean).join(', ')

/** For tests and sign-out: forget what is cached in memory (the browser's copy stays). */
export function resetAddressCache() {
  cache.clear()
}

const EMPTY: SavedAddress[] = []

export function useAddresses(accountId: string | undefined) {
  const list = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => (accountId ? read(accountId) : EMPTY),
    () => EMPTY,
  )
  const add = useCallback((a: DeliveryAddress, isDefault?: boolean) => (accountId ? addAddress(accountId, a, isDefault) : null), [accountId])
  const update = useCallback((id: string, a: DeliveryAddress) => accountId && updateAddress(accountId, id, a), [accountId])
  const makeDefault = useCallback((id: string) => accountId && setDefaultAddress(accountId, id), [accountId])
  const remove = useCallback((id: string) => accountId && removeAddress(accountId, id), [accountId])
  return { list, defaultAddress: list.find((a) => a.isDefault) ?? null, add, update, makeDefault, remove }
}
