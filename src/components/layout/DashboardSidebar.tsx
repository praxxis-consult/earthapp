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
import shopIcon from '../../assets/icons/db-nav-shop.svg'
import savedIcon from '../../assets/icons/db-nav-archive.svg'
import cartIcon from '../../assets/icons/nav-cart.svg'
import shareIcon from '../../assets/icons/db-share.svg'
import logoutIcon from '../../assets/icons/db-logout.svg'
import avatarImg from '../../assets/images/db-avatar.png'
import sidebarBgImg from '../../assets/images/db-sidebar-bg.png'
import { jakarta } from '../../utils/styles'
import { useAuth } from '../../feature/authentication/useAuth'
import { useStore } from '../../feature/stores/useStore'
import { useUnreadChats } from '../../feature/chats/useUnreadChats'
import { useCart } from '../../lib/cart'
import { referralLink } from '../../data/referrals'
import { canSell } from '../../feature/authentication/role'
import { initials } from '../../data/orders'

interface NavItem {
  label: string
  icon: string
  href: string
  badge?: 'unreadChats' | 'cart'
}

/** The seller's menu, as the dashboard frame lists it. */
const SELLER_NAV: NavItem[] = [
  { label: 'Overview',         icon: overviewIcon,  href: '/dashboard' },
  { label: 'Products',         icon: productsIcon,  href: '/dashboard/products' },
  { label: 'Orders',           icon: ordersIcon,    href: '/dashboard/orders' },
  { label: 'Messages',         icon: messagesIcon,  href: '/dashboard/messages', badge: 'unreadChats' },
  { label: 'Payout',           icon: payoutIcon,    href: '/dashboard/payout' },
  { label: 'Referrals',        icon: referralsIcon, href: '/dashboard/referrals' },
  { label: 'Account settings', icon: settingsIcon,  href: '/dashboard/settings' },
]

/** The buyer's menu, as the buyer marketplace frame (816:9128) lists it: the marketplace and the cart live in the dashboard. */
const BUYER_NAV: NavItem[] = [
  { label: 'Overview',         icon: overviewIcon,  href: '/dashboard' },
  { label: 'Marketplace',      icon: shopIcon,      href: '/dashboard/marketplace' },
  { label: 'Cart',             icon: cartIcon,      href: '/dashboard/cart', badge: 'cart' },
  { label: 'Orders',           icon: ordersIcon,    href: '/dashboard/purchases' },
  { label: 'Messages',         icon: messagesIcon,  href: '/dashboard/messages', badge: 'unreadChats' },
  { label: 'Saved products',   icon: savedIcon,     href: '/dashboard/saved' },
  { label: 'Referrals',        icon: referralsIcon, href: '/dashboard/referrals' },
  { label: 'Account settings', icon: settingsIcon,  href: '/dashboard/settings' },
]

/** An account that buys and sells gets the seller's menu plus its purchases and saved listings, after the sales. */
const BOTH_NAV: NavItem[] = [
  ...SELLER_NAV.slice(0, 3),
  { label: 'Purchases', icon: ordersIcon, href: '/dashboard/purchases' },
  { label: 'Saved products', icon: savedIcon, href: '/dashboard/saved' },
  ...SELLER_NAV.slice(3),
]

function navFor(accountType: string | undefined): NavItem[] {
  if (accountType === 'BUYING') return BUYER_NAV
  if (accountType === 'BOTH') return BOTH_NAV
  return SELLER_NAV
}

interface DashboardSidebarProps {
  /** Rendered inside the phone/tablet drawer: fills the panel and shows a close button. */
  inDrawer?: boolean
  onClose?: () => void
}

export default function DashboardSidebar({ inDrawer = false, onClose }: DashboardSidebarProps) {
  const navigate = useNavigate()
  const { account, signOut } = useAuth()
  const seller = canSell(account)
  const navItems = navFor(account?.accountType)
  const name = account ? `${account.firstName} ${account.lastName}` : ''
  // The Messages badge: threads with unread messages, kept fresh while the dashboard is open.
  const unreadChats = useUnreadChats()
  // The Cart badge: lines waiting in this browser's cart.
  const cartCount = useCart(account?.id).count
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
    if (seller && !store) return
    // A seller shares the store's marketplace link; a buyer the referral link (859:41044 "Invite family & friends").
    const link = seller && store ? `${window.location.origin}/marketplace?store=${store.id}` : referralLink(account ? `${account.firstName} ${account.lastName}` : undefined)
    const text = seller && store ? `Shop at ${store.storeName} on Earth` : 'Join me on Earth, the marketplace for farm produce and natural resources'
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
      setToast(seller ? { title: 'Store link copied', body: 'Paste it anywhere your customers are: WhatsApp, Instagram, SMS.' } : { title: 'Referral link copied', body: 'Send it to anyone who would like to buy or sell on Earth.' })
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

      {/* Store card: until the store is LIVE it opens onboarding, which picks the draft up where it stopped. A buyer has no store, so the card is the person and opens their settings. */}
      <button
        type="button"
        onClick={() => {
          if (seller && store?.status !== 'LIVE') navigate('/onboarding/store')
          else navigate('/dashboard/settings')
          if (inDrawer) onClose?.()
        }}
        className="mx-[24px] mb-[40px] bg-[#f7f7f7] flex gap-[8px] items-center px-[16px] py-[12px] rounded-[15px] text-left hover:bg-[#f2f2f2]"
        aria-label={!seller ? 'Account settings' : store?.status === 'LIVE' ? 'Store settings' : 'Finish your store setup'}
      >
        <div className="bg-[#f2f8f6] overflow-clip relative rounded-full shrink-0 size-[40px] flex items-center justify-center">
          {seller ? (
            <img src={avatarImg} alt="" className="absolute inset-0 max-w-none object-cover size-full" />
          ) : (
            <p className="text-[#007c53] text-[14px]" style={jakarta(700)}>{name ? initials(name) : ''}</p>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-[#101604] text-[14px] leading-[20px] truncate" style={jakarta(700)}>
            {seller ? (store?.storeName ?? 'Your store') : name}
          </p>
          <p className="text-[#807e7e] text-[12px] leading-[20px] truncate" style={jakarta(500)}>
            {!seller ? 'Buyer account' : store?.status === 'LIVE' ? place : 'Finish your store setup'}
          </p>
        </div>
      </button>

      {/* Only the menu scrolls when the column is short (nine entries on a buying-and-selling account); the banner and Log out stay pinned below it */}
      <nav className="flex flex-col gap-[12px] px-[16px] flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin]">
        {navItems.map(({ label, icon, href, badge: badgeKey }) => {
          const count = badgeKey === 'unreadChats' ? unreadChats : badgeKey === 'cart' ? cartCount : 0
          const badge = count > 0 ? count : undefined
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

      {/* Share my store banner; for a buyer the same banner opens the marketplace instead */}
      <div className="mx-[16px] mt-[16px] mb-[24px] relative h-[144px] shrink-0 rounded-[20px] overflow-hidden bg-[#e3e3e3]">
        <img src={sidebarBgImg} alt="" className="absolute inset-0 max-w-none object-cover size-full pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] from-[1%] to-transparent" />
        <div className="absolute top-[16px] left-[16px] w-[235px] flex flex-col gap-[4px]">
          <p className="text-white text-[16px] leading-[24px]" style={jakarta(700)}>{seller ? 'Sell where you are already' : 'Invite family & friends'}</p>
          <p className="text-[rgba(255,255,255,0.75)] text-[12px] leading-[15px]" style={jakarta(500)}>
            {seller ? 'Share your store link where your customers already are.' : 'Refer anyone who would like to buy or sell on Earth.'}
          </p>
        </div>
        {seller ? (
          <button type="button" onClick={share} disabled={!store} className="absolute top-[92px] left-[16px] bg-[#aee74a] flex gap-[10px] items-center justify-center h-[36px] rounded-[30px] w-[235px] disabled:opacity-60">
            <div className="relative shrink-0 size-[20px]">
              <img src={shareIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
            </div>
            <p className="text-[#0c2310] text-[14px] leading-[24px] text-center whitespace-nowrap" style={jakarta(600)}>
              {copied ? 'Link copied' : 'Share my store'}
            </p>
          </button>
        ) : (
          <button type="button" onClick={share} className="absolute top-[92px] left-[16px] bg-[#aee74a] flex gap-[10px] items-center justify-center h-[36px] rounded-[30px] w-[235px]">
            <div className="relative shrink-0 size-[20px]">
              <img src={shareIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
            </div>
            <p className="text-[#0c2310] text-[14px] leading-[24px] text-center whitespace-nowrap" style={jakarta(600)}>
              {copied ? 'Link copied' : 'Share referral link'}
            </p>
          </button>
        )}
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
