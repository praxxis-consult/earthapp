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

