import { useCallback, useSyncExternalStore } from 'react'

/**
 * Buyer reviews per listing. The API has no reviews endpoint yet, so what a buyer writes on this
 * device stays on this device; the summary, bars and list all compute from these.
 */
export interface Review {
  id: string
  productId: string
  author: string
  rating: 1 | 2 | 3 | 4 | 5
  text: string
  at: string
}

const KEY = 'earth.reviews'
const listeners = new Set<() => void>()
let all: Review[] = read()

function read(): Review[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Review[]
  } catch {
    return []
  }
}

function write(next: Review[]) {
  all = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage blocked: the reviews still live for this page */
  }
  listeners.forEach((l) => l())
}

export function addReview(r: Omit<Review, 'id' | 'at'>) {
  write([{ ...r, id: `r${Date.now()}`, at: new Date().toISOString() }, ...all])
}

const EMPTY: Review[] = []
const cache = new Map<string, Review[]>()
function forProduct(productId: string): Review[] {
  const hit = cache.get(productId)
  if (hit && hit.every((r) => all.includes(r)) && hit.length === all.filter((r) => r.productId === productId).length) return hit
  const next = all.filter((r) => r.productId === productId)
  cache.set(productId, next.length ? next : EMPTY)
  return cache.get(productId)!
}

export function useReviews(productId: string) {
  const subscribe = useCallback((l: () => void) => {
    listeners.add(l)
    return () => listeners.delete(l)
  }, [])
  return useSyncExternalStore(subscribe, () => forProduct(productId), () => EMPTY)
}

/** "2 days ago", "5 hours ago", "1 week ago" (Figma 668:30185). */
export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000)
  const unit = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'} ago`
  if (s < 60) return 'just now'
  if (s < 3600) return unit(Math.floor(s / 60), 'minute')
  if (s < 86400) return unit(Math.floor(s / 3600), 'hour')
  if (s < 7 * 86400) return unit(Math.floor(s / 86400), 'day')
  if (s < 30 * 86400) return unit(Math.floor(s / (7 * 86400)), 'week')
  return unit(Math.floor(s / (30 * 86400)), 'month')
}

export function summarise(reviews: Review[]) {
  const count = reviews.length
  const average = count ? reviews.reduce((a, r) => a + r.rating, 0) / count : 0
  const share = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    pct: count ? Math.round((reviews.filter((r) => r.rating === stars).length / count) * 100) : 0,
  }))
  return { count, average, share }
}
