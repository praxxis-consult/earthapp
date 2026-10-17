import { useState } from 'react'
import { createPortal } from 'react-dom'
import Toast from '../ui/Toast'
import { NavLink, useNavigate } from 'react-router-dom'
import unionLogo from '../../assets/icons/db-union.svg'
import overviewIcon from '../../assets/icons/db-overview.svg'
import productsIcon from '../../assets/icons/db-products.svg'
import ordersIcon from '../../assets/icons/db-orders.svg'
import messagesIcon from '../../assets/icons/db-messages.svg'
import payoutIcon from '../../assets/icons/db-payout.svg'
import referralsIcon from '../../assets/icons/db-referrals.svg'
import settingsIcon from '../../assets/icons/db-settings.svg'
import shareIcon from '../../assets/icons/db-share.svg'
import logoutIcon from '../../assets/icons/db-logout.svg'
import avatarImg from '../../assets/images/db-avatar.png'
import sidebarBgImg from '../../assets/images/db-sidebar-bg.png'
import { jakarta } from '../../utils/styles'
import { useAuth } from '../../feature/authentication/useAuth'
import { useStore } from '../../feature/stores/useStore'
import { useUnreadChats } from '../../feature/chats/useUnreadChats'

const NAV_ITEMS = [
  { label: 'Overview',         icon: overviewIcon,  href: '/dashboard' },
  { label: 'Products',         icon: productsIcon,  href: '/dashboard/products' },
  { label: 'Orders',           icon: ordersIcon,    href: '/dashboard/orders' },
  { label: 'Messages',         icon: messagesIcon,  href: '/dashboard/messages', badge: 'unreadChats' as const },
  { label: 'Payout',           icon: payoutIcon,    href: '/dashboard/payout' },
  { label: 'Referrals',        icon: referralsIcon, href: '/dashboard/referrals' },
  { label: 'Account settings', icon: settingsIcon,  href: '/dashboard/settings' },
]

interface DashboardSidebarProps {
  /** Rendered inside the phone/tablet drawer: fills the panel and shows a close button. */
  inDrawer?: boolean
  onClose?: () => void
}

export default function DashboardSidebar({ inDrawer = false, onClose }: DashboardSidebarProps) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  // The Messages badge: threads with unread messages, kept fresh while the dashboard is open.
  const unreadChats = useUnreadChats()
  const { store } = useStore()
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null)
  const place = store ? `${store.businessAddress.area}, ${store.businessAddress.region}` : ''

  /**
   * "Share my store": the store's marketplace link goes to the clipboard and the button and a
   * toast say so; on a touch device the system share sheet opens as well. Only when the
   * clipboard is blocked does the sheet (or the link itself) stand in, so a click always answers.
   */
  async function share() {
    if (!store) return
    const link = `${window.location.origin}/marketplace?store=${store.id}`
    const text = `Shop at ${store.storeName} on Earth`
    const touch = window.matchMedia('(pointer: coarse)').matches
    let copiedNow = false
    try {
      await navigator.clipboard.writeText(link)
      copiedNow = true
    } catch {
      /* clipboard blocked: fall through to the share sheet or the link */
    }
    if (copiedNow) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      setToast({ title: 'Store link copied', body: 'Paste it anywhere your customers are: WhatsApp, Instagram, SMS.' })
    }
    if (navigator.share && (touch || !copiedNow)) {
      try {
        await navigator.share({ text, url: link })
        return
      } catch {
        /* closed the sheet */
      }
    }
    if (!copiedNow) setToast({ title: 'Your store link', body: link })
  }

  async function logout() {
    try {
      await signOut()
    } finally {
      navigate('/', { replace: true })
    }
  }

  return (
    <aside
      className={`w-[299px] shrink-0 bg-white flex flex-col ${
        inDrawer ? 'min-h-full' : 'h-screen sticky top-0 overflow-hidden'
      }`}
    >
      {/* Logo */}
      <div className="flex gap-[8px] items-center px-[24px] pt-[24px] pb-[40px]">
        <div className="h-[48px] relative shrink-0 w-[46.629px]">
          <img src={unionLogo} alt="" className="absolute block inset-0 max-w-none size-full" />
        </div>
        <p className="text-[#0c2310] text-[40.65px] leading-none lowercase" style={{ fontFamily: "'Goldman', serif", fontWeight: 400 }}>
          <span className="uppercase">E</span>arth
        </p>
        {inDrawer && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto flex size-[44px] items-center justify-center rounded-full text-[#101604] hover:bg-[#f7f7f7]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Store card: until the store is LIVE it opens onboarding, which picks the draft up where it stopped. */}
      <button
        type="button"
        onClick={() => {
          if (store?.status !== 'LIVE') navigate('/onboarding/store')
          else navigate('/dashboard/settings')
          if (inDrawer) onClose?.()
        }}
        className="mx-[24px] mb-[40px] bg-[#f7f7f7] flex gap-[8px] items-center px-[16px] py-[12px] rounded-[15px] text-left hover:bg-[#f2f2f2]"
        aria-label={store?.status === 'LIVE' ? 'Store settings' : 'Finish your store setup'}
      >
        <div className="bg-[#f2f8f6] overflow-clip relative rounded-full shrink-0 size-[40px]">
          <img src={avatarImg} alt="" className="absolute inset-0 max-w-none object-cover size-full" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-[#101604] text-[14px] leading-[20px] truncate" style={jakarta(700)}>
            {store?.storeName ?? 'Your store'}
          </p>
          <p className="text-[#807e7e] text-[12px] leading-[20px] truncate" style={jakarta(500)}>
            {store?.status === 'LIVE' ? place : 'Finish your store setup'}
          </p>
        </div>
      </button>

      {/* Nav items */}
      <nav className="flex flex-col gap-[12px] px-[16px] flex-1">
        {NAV_ITEMS.map(({ label, icon, href, badge: badgeKey }) => {
          const badge = badgeKey === 'unreadChats' && unreadChats > 0 ? unreadChats : undefined
          return (
          <NavLink
            key={href}
            to={href}
            end={href === '/dashboard'}
            onClick={inDrawer ? onClose : undefined}
            className={({ isActive }) =>
              `flex gap-[4px] h-[48px] items-center overflow-clip px-[16px] py-[12px] rounded-[15px] w-full transition-colors ${
                isActive ? 'bg-[rgba(0,124,83,0.05)]' : 'hover:bg-[#f7f7f7]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex flex-1 gap-[12px] items-center min-w-0">
                  <div className="relative shrink-0 size-[24px]">
                    <img src={icon} alt="" className="absolute block inset-0 max-w-none size-full" />
                  </div>
                  <p
                    className="text-[13px] leading-[16px] flex-1 min-w-0 text-left"
                    style={{ ...jakarta(500), color: isActive ? '#007c53' : '#807e7e' }}
                  >
                    {label}
                  </p>
                </div>
                {badge && (
                  <div className="bg-[#007c53] flex items-center justify-center px-[8px] rounded-[10px] size-[24px]">
                    <p className="text-white text-[13px] leading-none" style={jakarta(500)}>{badge}</p>
                  </div>
                )}
              </>
            )}
          </NavLink>
          )
        })}
      </nav>

      {/* Share my store banner */}
      <div className="mx-[16px] mb-[40px] relative h-[144px] rounded-[20px] overflow-hidden bg-[#e3e3e3]">
        <img src={sidebarBgImg} alt="" className="absolute inset-0 max-w-none object-cover size-full pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] from-[1%] to-transparent" />
        <div className="absolute top-[16px] left-[16px] w-[235px] flex flex-col gap-[4px]">
          <p className="text-white text-[16px] leading-[24px]" style={jakarta(700)}>Sell where you are already</p>
          <p className="text-[rgba(255,255,255,0.75)] text-[12px] leading-[15px]" style={jakarta(500)}>
            Share your store link where your customers already are.
          </p>
        </div>
        <button type="button" onClick={share} disabled={!store} className="absolute top-[92px] left-[16px] bg-[#aee74a] flex gap-[10px] items-center justify-center h-[36px] rounded-[30px] w-[235px] disabled:opacity-60">
          <div className="relative shrink-0 size-[20px]">
            <img src={shareIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
          </div>
          <p className="text-[#0c2310] text-[14px] leading-[24px] text-center whitespace-nowrap" style={jakarta(600)}>
            {copied ? 'Link copied' : 'Share my store'}
          </p>
        </button>
      </div>

      {toast && createPortal(<Toast title={toast.title} body={toast.body} onDone={() => setToast(null)} />, document.body)}

      {/* Logout */}
      <button type="button" onClick={logout} className="bg-[#f2f8f6] flex items-center justify-between px-[24px] py-[12px] h-[64px] shrink-0 w-full text-left">
        <p className="text-[#007c53] text-[16px] leading-[24px]" style={jakarta(600)}>Log out</p>
        <div className="relative shrink-0 size-[24px]">
          <img src={logoutIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
        </div>
      </button>
    </aside>
  )
}
