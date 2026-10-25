import type { PublicStore } from './catalog'

/**
 * The two facts the listing frame shows beside a seller ("37 completed trades", "Replies in
 * ~2 hours"), from the store's statistics (25 October). They are projections and arrive late: a
 * pending status or a null value says nothing, so nothing is shown; a zero count is not a fact
 * worth a line either.
 */
export function storeFacts(s: Pick<PublicStore, 'completedOrders' | 'typicalReplyTimeSeconds' | 'replyTimeStatus' | 'statisticsStatus'>): string[] {
  const facts: string[] = []
  if (s.statisticsStatus === 'READY') {
    const n = Number(s.completedOrders ?? NaN)
    if (Number.isFinite(n) && n > 0) facts.push(`${n} completed ${n === 1 ? 'trade' : 'trades'}`)
  }
  if (s.replyTimeStatus === 'AVAILABLE' && typeof s.typicalReplyTimeSeconds === 'number' && s.typicalReplyTimeSeconds >= 0) facts.push(`Replies in ${replyTime(s.typicalReplyTimeSeconds)}`)
  return facts
}

/** "under a minute", "~5 minutes", "~2 hours", "~3 days". */
export function replyTime(seconds: number): string {
  if (seconds < 60) return 'under a minute'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `~${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  const hours = Math.round(seconds / 3600)
  if (hours < 24) return `~${hours} ${hours === 1 ? 'hour' : 'hours'}`
  const days = Math.round(seconds / 86400)
  return `~${days} ${days === 1 ? 'day' : 'days'}`
}

/** The store's own rating when it has one; null while the projection is pending or there are no reviews. */
export function storeRating(s: Pick<PublicStore, 'ratingAverage' | 'ratingCount'>): { average: number; count: number } | null {
  const count = Number(s.ratingCount ?? 0)
  const average = s.ratingAverage === null || s.ratingAverage === undefined ? NaN : Number(s.ratingAverage)
  return count > 0 && Number.isFinite(average) ? { average, count } : null
}
