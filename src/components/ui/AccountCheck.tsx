import verifyIcon from '../../assets/icons/db-verify.svg'
import type { AccountCheck } from '../../feature/banks/useAccountCheck'
import { jakarta } from '../../utils/styles'

/** The frame's spinner (425:4603): three concentric 2px circles, the middle one solid, turning. */
function Spinner() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0 animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" stroke="#007c53" strokeOpacity="0.1" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="7" stroke="#007c53" strokeWidth="2" fill="none" strokeDasharray="30 14" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" stroke="#007c53" strokeOpacity="0.1" strokeWidth="2" fill="none" />
    </svg>
  )
}

/**
 * The 40px status row under the account number (bank details 424:4530, 428:4608): the spinner
 * with "Checking the bank…" while the lookup runs; the verify tick with "Name matched
 * successfully" and the bank's name on the right once it matches; a plain warning otherwise.
 * Renders nothing while idle.
 */
export function AccountCheckRow({ check, className = '' }: { check: AccountCheck; className?: string }) {
  if (check.status === 'idle') return null
  if (check.status === 'checking')
    return (
      <div className={`flex items-center gap-[8px] h-[40px] py-[8px] rounded-[15px] w-full ${className}`} role="status">
        <Spinner />
        <p className="text-[#007c53] text-[12px] leading-[15px]" style={jakarta(500)}>
          Checking the bank for the name on this account...
        </p>
      </div>
    )
  if (check.status === 'matched')
    return (
      <div className={`flex items-center justify-between gap-[8px] h-[40px] py-[8px] rounded-[15px] w-full ${className}`} role="status">
        <span className="flex items-center gap-[8px] min-w-0">
          <img src={verifyIcon} alt="" className="size-[20px] shrink-0" />
          <span className="text-[#007c53] text-[14px] leading-[18px] whitespace-nowrap" style={jakarta(500)}>
            Name matched successfully
          </span>
        </span>
        <span className="text-[#101604] text-[16px] leading-[24px] text-right truncate" style={jakarta(600)}>
          {check.accountName}
        </span>
      </div>
    )
  return (
    <p role="alert" className={`py-[8px] text-[#b13b3b] text-[13px] leading-[20px] ${className}`} style={jakarta(400)}>
      {check.status === 'mismatch'
        ? `This account is in another name (${check.accountName}). Use an account in your own name, as it appears on your ID.`
        : check.status === 'unavailable'
          ? 'Account lookup is not available right now. Try again in a moment.'
          : check.message}
    </p>
  )
}
