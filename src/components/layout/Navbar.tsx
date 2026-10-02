import { NavLink } from 'react-router-dom'
import logoMark from '../../assets/icons/logo-mark.svg'
import arrowDown from '../../assets/icons/arrow-down.svg'
import arrowRight from '../../assets/icons/arrow-right.svg'

const jakartaMedium: React.CSSProperties = {
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  fontWeight: 500,
}

const navLinkClass =
  'text-[#807e7e] text-[12px] font-medium tracking-[1.98px] uppercase whitespace-nowrap leading-[16.5px] hover:text-[#0c2310] transition-colors'

export default function Navbar() {
  return (
    <nav className="bg-white w-full">
      <div className="max-w-[1200px] mx-auto flex items-center px-0 py-[24px]">

      {/* ── Logo — pinned left ── */}
      <div className="flex gap-[8px] items-center shrink-0">
        <div className="h-[48px] w-[46.629px] relative shrink-0">
          <img alt="Earth logo mark" className="absolute inset-0 block size-full max-w-none" src={logoMark} />
        </div>
        <p
          className="text-[#0c2310] text-[40.65px] leading-[0] lowercase whitespace-nowrap shrink-0"
          style={{ fontFamily: 'Goldman, serif' }}
        >
          <span className="uppercase" style={{ lineHeight: '0.38' }}>E</span>
          <span style={{ lineHeight: '0.38' }}>arth</span>
        </p>
      </div>

      {/* ── Nav links — truly centered ── */}
      <div className="flex-1 flex items-center justify-center gap-[32px]">
        <NavLink to="/" style={jakartaMedium} className={navLinkClass}>HOME</NavLink>

        <div className="flex gap-[8px] items-center shrink-0">
          <NavLink to="/marketplace" style={jakartaMedium} className={navLinkClass}>MARKETPLACE</NavLink>
          <div className="relative shrink-0 size-[16px]">
            <img alt="" className="absolute inset-0 block size-full max-w-none" src={arrowDown} />
          </div>
        </div>

        <NavLink to="/lending" style={jakartaMedium} className={navLinkClass}>LENDING</NavLink>
        <NavLink to="/how-it-works" style={jakartaMedium} className={navLinkClass}>HOW IT WORKS</NavLink>
      </div>

      {/* ── CTA — pinned right ── */}
      <div className="flex gap-[16px] items-center shrink-0">

        {/* Sign in — ghost */}
        <NavLink
          to="/signin"
          className="flex h-[48px] items-center justify-center px-[24px] rounded-[30px] shrink-0 hover:bg-gray-50 transition-colors text-[#0c2310] text-[14px] font-medium leading-normal tracking-[-0.28px] whitespace-nowrap"
          style={jakartaMedium}
        >
          Sign in
        </NavLink>

        {/* Start Trading — primary */}
        <NavLink
          to="/signup"
          className="flex gap-[4px] h-[48px] items-center justify-center px-[24px] rounded-[30px] shrink-0 hover:opacity-90 transition-opacity"
          style={{ backgroundImage: 'linear-gradient(90deg, rgb(0, 124, 83) 0%, rgb(0, 124, 83) 100%)' }}
        >
          <span
            className="text-[14px] font-medium leading-normal tracking-[-0.28px] whitespace-nowrap bg-clip-text text-transparent shrink-0"
            style={{
              ...jakartaMedium,
              backgroundImage: 'linear-gradient(178.607deg, rgb(255,255,255) 4.9851%, rgba(255,255,255,0.86) 85.731%)',
            }}
          >
            Start Trading
          </span>
          <div className="relative shrink-0 size-[24px]">
            <img alt="" className="absolute inset-0 block size-full max-w-none" src={arrowRight} />
          </div>
        </NavLink>

      </div>
      </div>
    </nav>
  )
}
