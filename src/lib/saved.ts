import { useCallback, useSyncExternalStore } from 'react'
import type { Listing } from './catalog'

/** What the saved list keeps of a listing, so the page draws without a round trip; the link opens the live listing. */
export interface SavedListing {
  id: string
  title: string
  price: string
  unit: string
  image: string | null
  storeName: string
  location: string
  savedAt: string
}

const KEY = (accountId: string) => `earth.saved.${accountId}`
const listeners = new Set<() => void>()
const cache = new Map<string, SavedListing[]>()

function read(accountId: string): SavedListing[] {
  const hit = cache.get(accountId)
  if (hit) return hit
  let list: SavedListing[] = []
  try {
    const raw = localStorage.getItem(KEY(accountId))
    if (raw) list = JSON.parse(raw) as SavedListing[]
  } catch {
    /* storage blocked or malformed: an empty list */
  }
  cache.set(accountId, list)
  return list
}

function write(accountId: string, list: SavedListing[]) {
  cache.set(accountId, list)
  try {
    localStorage.setItem(KEY(accountId), JSON.stringify(list))
  } catch {
    /* storage blocked: the list lives for the session */
  }
  listeners.forEach((l) => l())
}

export const snapshot = (p: Listing, savedAt = new Date().toISOString()): SavedListing => ({
  id: p.id,
  title: p.title,
  price: p.price,
  unit: p.unit,
  image: p.image,
  storeName: p.store.storeName,
  location: p.location,
  savedAt,
})

/** Adds the listing (newest first) or, when it is already there, removes it; answers whether it is saved now. */
export function toggleSaved(accountId: string, p: Listing): boolean {
  const list = read(accountId)
  if (list.some((s) => s.id === p.id)) {
    write(accountId, list.filter((s) => s.id !== p.id))
    return false
  }
  write(accountId, [snapshot(p), ...list])
  return true
}

export function removeSaved(accountId: string, id: string) {
  write(accountId, read(accountId).filter((s) => s.id !== id))
}

/** For tests and sign-out: forget what is cached in memory (the browser's copy stays). */
export function resetSavedCache() {
  cache.clear()
}

const EMPTY: SavedListing[] = []

/**
 * The listings a buyer saved for later. The API has no saved-products endpoint, so the list
 * lives in this browser under the account's id (the saved page says so); it moves to the API
 * the day one exists.
 */
export function useSaved(accountId: string | undefined) {
  const list = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => (accountId ? read(accountId) : EMPTY),
    () => EMPTY,
  )
  const toggle = useCallback((p: Listing) => (accountId ? toggleSaved(accountId, p) : false), [accountId])
  const remove = useCallback((id: string) => accountId && removeSaved(accountId, id), [accountId])
  const isSaved = useCallback((id: string) => list.some((s) => s.id === id), [list])
  return { list, toggle, remove, isSaved }
}
