import searchIcon from '../../assets/icons/db-search.svg'
import notificationIcon from '../../assets/icons/db-notification.svg'
import verifyIcon from '../../assets/icons/db-verify.svg'
import chevronDownIcon from '../../assets/icons/db-chevron-down.svg'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jakarta } from '../../utils/styles'
import { useAuth } from '../../feature/authentication/useAuth'
import { initials } from '../../data/orders'

interface DashboardTopbarProps {
  /** Opens the navigation drawer; the button only shows below `lg`, where the sidebar is hidden. */
  onMenu?: () => void
}

export default function DashboardTopbar({ onMenu }: DashboardTopbarProps) {
  const { account } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const name = account ? `${account.firstName} ${account.lastName}` : ''
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
          navigate(q ? `/dashboard/products?q=${encodeURIComponent(q)}` : '/dashboard/products')
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
          placeholder="Search orders and products ..."
          aria-label="Search orders and products"
          className="flex-1 min-w-0 bg-transparent text-[#101604] text-[13px] outline-none placeholder:text-[#807e7e]"
          style={jakarta(400)}
        />
      </form>

      {/* Right: notification + user */}
      <div className="flex gap-[24px] items-center shrink-0 max-lg:gap-[12px]">
        <div className="relative shrink-0 size-[24px]">
          <img src={notificationIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
        </div>

        <div className="flex gap-[8px] items-center">
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
              Store owner
            </p>
          </div>

          {/* Chevron */}
          <div className="relative shrink-0 size-[16px] max-md:hidden">
            <img src={chevronDownIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
          </div>
        </div>
      </div>
    </header>
  )
}
