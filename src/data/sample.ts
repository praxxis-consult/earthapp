/**
 * Development-only switch for the sample rows (orders, chats) while the API has no endpoints
 * for them: open any dashboard URL with `?sample=1` to see them, `?sample=0` to go back. The
 * choice lasts for the browser tab. Production builds always return false.
 */
export function sampleMode(): boolean {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false
  const wanted = new URLSearchParams(window.location.search).get('sample')
  if (wanted !== null) sessionStorage.setItem('earth.sample', wanted === '1' ? '1' : '0')
  return sessionStorage.getItem('earth.sample') === '1'
}
