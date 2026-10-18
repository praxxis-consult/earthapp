import searchIcon from '../../assets/icons/db-search.svg'
import notificationIcon from '../../assets/icons/db-notification.svg'
import verifyIcon from '../../assets/icons/db-verify.svg'
import chevronDownIcon from '../../assets/icons/db-chevron-down.svg'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jakarta } from '../../utils/styles'
import { useAuth } from '../../feature/authentication/useAuth'
import { canSell } from '../../feature/authentication/role'
import { useGetUnreadCountQuery, useListNotificationsQuery, useMarkNotificationReadMutation, type Notification } from '../../feature/notifications/notificationsApiSlice'
import { initials } from '../../data/orders'
import { useMenu } from '../ui/useMenu'

interface DashboardTopbarProps {
  /** Opens the navigation drawer; the button only shows below `lg`, where the sidebar is hidden. */
  onMenu?: () => void
}

/** How often the bell asks for its unread count while the dashboard is open. */
const COUNT_POLL_MS = 30_000

/**
 * What a notification reads as, and where it leads, from its category and the thing it is
 * about. A buyer's order opens on their purchases page; a seller's on the orders page.
 */
function describe(n: Notification, seller: boolean): { title: string; body: string; to: string | null } {
  switch (n.category) {
    case 'chatMessages':
      return { title: 'New message', body: `${seller ? 'A buyer' : 'A seller'} wrote to you. Open the chat to reply.`, to: `/dashboard/messages?chat=${n.resourceId}` }
    case 'orderUpdates':
      return { title: 'Order update', body: 'One of your orders moved on.', to: `${seller ? '/dashboard/orders' : '/dashboard/purchases'}/${n.resourceId}` }
    case 'security':
      return { title: 'Security notice', body: 'Something changed on your account.', to: '/dashboard/settings' }
    default:
      return { title: 'From Earth', body: n.kind.replace(/[._]/g, ' '), to: null }
  }
}

function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DashboardTopbar({ onMenu }: DashboardTopbarProps) {
  const { account } = useAuth()
  const seller = canSell(account)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const name = account ? `${account.firstName} ${account.lastName}` : ''
  const { open, setOpen, ref } = useMenu()
  const { data: unread = 0 } = useGetUnreadCountQuery(undefined, { pollingInterval: COUNT_POLL_MS })
  const inbox = useListNotificationsQuery(undefined, { skip: !open })
  const [markRead] = useMarkNotificationReadMutation()

  function openNotification(n: Notification) {
    if (!n.readAt) markRead(n.id)
    setOpen(false)
    const { to } = describe(n, seller)
    if (to) navigate(to)
  }

  return (
    <header className="bg-white flex items-center justify-between h-[96px] px-[24px] shrink-0 max-lg:h-[64px] max-lg:px-[16px] max-lg:gap-[12px]">
      {/* Menu — phone and tablet only */}
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="lg:hidden flex size-[44px] -ml-[8px] shrink-0 items-center justify-center rounded-full text-[#101604] hover:bg-[#f7f7f7]"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </button>

      {/* Search bar */}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          const q = query.trim()
          // A seller searches their own products; a buyer searches the marketplace.
          const base = seller ? '/dashboard/products' : '/marketplace'
          navigate(q ? `${base}?q=${encodeURIComponent(q)}` : base)
        }}
        className="bg-[#f7f7f7] flex gap-[8px] items-center h-[48px] px-[16px] rounded-[30px] w-[400px] max-lg:w-auto max-lg:flex-1 max-lg:min-w-0 max-lg:h-[44px]"
      >
        <div className="relative shrink-0 size-[20px]">
          <img src={searchIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={seller ? 'Search orders and products ...' : 'Search the marketplace ...'}
          aria-label={seller ? 'Search orders and products' : 'Search the marketplace'}
          className="flex-1 min-w-0 bg-transparent text-[#101604] text-[13px] outline-none placeholder:text-[#807e7e]"
          style={jakarta(400)}
        />
      </form>

      {/* Right: notification + user */}
      <div className="flex gap-[24px] items-center shrink-0 max-lg:gap-[12px]">
        {/* The bell (431:4736's 24px glyph) with the unread count; it opens the newest page of the inbox. */}
        <div ref={ref} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
            aria-haspopup="menu"
            aria-expanded={open}
            className="relative flex size-[24px] items-center justify-center"
          >
            <img src={notificationIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
            {unread > 0 && (
              <span className="absolute -right-[6px] -top-[6px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#007c53] px-[4px] text-white text-[10px] leading-none" style={jakarta(600)}>
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>
          {open && (
            <div
              role="menu"
              aria-label="Notifications"
              className="absolute right-0 top-[40px] z-30 w-[360px] max-w-[calc(100vw-32px)] rounded-[20px] bg-white p-[8px] shadow-[0_12px_32px_rgba(16,22,4,0.12)]"
              aria-busy={inbox.isLoading}
            >
              <p className="px-[12px] py-[8px] text-[#101604] text-[14px] leading-[24px]" style={jakarta(600)}>
                Notifications
              </p>
              {inbox.error ? (
                <p role="alert" className="px-[12px] py-[12px] text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
                  Notifications could not be loaded.
                </p>
              ) : inbox.data && inbox.data.length === 0 ? (
                <p className="px-[12px] py-[12px] text-[#807e7e] text-[13px] leading-[20px]" style={jakarta(400)}>
                  Nothing yet. Orders and messages will show up here.
                </p>
              ) : (
                <ul className="max-h-[360px] overflow-y-auto">
                  {(inbox.data ?? []).map((n) => {
                    const d = describe(n, seller)
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => openNotification(n)}
                          className="flex w-full items-start gap-[12px] rounded-[12px] px-[12px] py-[10px] text-left hover:bg-[#f7f7f7]"
                        >
                          <span className="mt-[7px] size-[8px] shrink-0 rounded-full" style={{ background: n.readAt ? '#e4dede' : '#007c53' }} aria-hidden="true" />
                          <span className="flex flex-col gap-[2px] min-w-0 flex-1">
                            <span className="text-[#101604] text-[13px] leading-[20px]" style={jakarta(n.readAt ? 500 : 600)}>
                              {d.title}
                            </span>
                            <span className="text-[#807e7e] text-[12px] leading-[16px]" style={jakarta(400)}>
                              {d.body}
                            </span>
                          </span>
                          <span className="shrink-0 text-[#807e7e] text-[11px] leading-[20px]" style={jakarta(400)}>
                            {ago(n.createdAt)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* The seller block (467:12487) opens account settings */}
        <button
          type="button"
          onClick={() => navigate('/dashboard/settings')}
          aria-label="Account settings"
          className="flex gap-[8px] items-center text-left rounded-[30px] focus-visible:outline-2 focus-visible:outline-[#007c53]"
        >
          {/* Avatar initials */}
          <div className="bg-[#f2f8f6] flex items-center justify-center rounded-full size-[40px] shrink-0">
            <p className="text-[#007c53] text-[14px]" style={jakarta(700)}>{name ? initials(name) : ''}</p>
          </div>

          {/* Name + role — the initials stand in for them on a phone */}
          <div className="flex flex-col gap-[2px] items-start justify-center max-md:hidden">
            <div className="flex gap-[2px] items-center">
              <p className="text-[#101604] text-[16px] whitespace-nowrap" style={jakarta(600)}>
                {name}
              </p>
              <div className="relative shrink-0 size-[16px]">
                <img src={verifyIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
              </div>
            </div>
            <p className="text-[#807e7e] text-[11px] whitespace-nowrap" style={jakarta(500)}>
              {seller ? 'Store owner' : 'Buyer'}
            </p>
          </div>

          {/* Chevron */}
          <div className="relative shrink-0 size-[16px] max-md:hidden">
            <img src={chevronDownIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
          </div>
        </button>
      </div>
    </header>
  )
}
