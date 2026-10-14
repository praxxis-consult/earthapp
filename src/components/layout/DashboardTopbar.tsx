import searchIcon from '../../assets/icons/db-search.svg'
import notificationIcon from '../../assets/icons/db-notification.svg'
import verifyIcon from '../../assets/icons/db-verify.svg'
import chevronDownIcon from '../../assets/icons/db-chevron-down.svg'
import { jakarta } from '../../utils/styles'
import { useAuth } from '../../auth/useAuth'
import { initials } from '../../data/orders'

export default function DashboardTopbar() {
  const { account } = useAuth()
  const name = account ? `${account.firstName} ${account.lastName}` : ''
  return (
    <header className="bg-white flex items-center justify-between h-[96px] px-[24px] shrink-0">
      {/* Search bar */}
      <div className="bg-[#f7f7f7] flex gap-[8px] items-center h-[48px] px-[16px] rounded-[30px] w-[400px]">
        <div className="relative shrink-0 size-[20px]">
          <img src={searchIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
        </div>
        <p className="text-[#807e7e] text-[13px]" style={jakarta(400)}>
          Search orders and products ...
        </p>
      </div>

      {/* Right: notification + user */}
      <div className="flex gap-[24px] items-center">
        <div className="relative shrink-0 size-[24px]">
          <img src={notificationIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
        </div>

        <div className="flex gap-[8px] items-center">
          {/* Avatar initials */}
          <div className="bg-[#f2f8f6] flex items-center justify-center rounded-full size-[40px] shrink-0">
            <p className="text-[#007c53] text-[14px]" style={jakarta(700)}>{name ? initials(name) : ''}</p>
          </div>

          {/* Name + role */}
          <div className="flex flex-col gap-[2px] items-start justify-center">
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
          <div className="relative shrink-0 size-[16px]">
            <img src={chevronDownIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
          </div>
        </div>
      </div>
    </header>
  )
}
