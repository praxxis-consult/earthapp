import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import logoMark from '../../assets/icons/logo-mark.svg'
import arrowDown from '../../assets/icons/arrow-down.svg'
import arrowRight from '../../assets/icons/arrow-right.svg'
import closeIcon from '../../assets/icons/auth-cancel.svg'
import Drawer from '../ui/Drawer'
import SignInDialogs from '../ui/SignInDialogs'
import { useAuth } from '../../feature/authentication/useAuth'

const jakartaMedium: React.CSSProperties = {
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  fontWeight: 500,
}

const navLinkClass =
  'text-[#807e7e] text-[12px] font-medium tracking-[1.98px] uppercase whitespace-nowrap leading-[16.5px] hover:text-[#0c2310] transition-colors'

export default function Navbar() {
  const { status } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const redirect = (location.state as { login?: boolean; from?: string } | null) ?? null
  // A guarded page sent an anonymous visitor here: open sign-in and remember where they were going.
  const [loginOpen, setLoginOpen] = useState(() => Boolean(redirect?.login))
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (redirect?.login) navigate(location.pathname, { replace: true, state: { from: redirect.from } })
  }, [redirect?.login]) // eslint-disable-line react-hooks/exhaustive-deps

  const signedIn = status === 'authenticated'

  return (
    <>
      <nav className="bg-white w-full">
        <div className="max-w-[1200px] mx-auto flex items-center px-0 py-[24px] gap-[141px] max-xl:px-[24px] max-xl:justify-between max-xl:gap-[24px] max-lg:gap-0 max-md:px-[16px]">
          {/* ── Logo — pinned left ── */}
          <div className="flex gap-[8px] items-center shrink-0">
            <div className="h-[48px] w-[46.629px] relative shrink-0 max-md:h-[40px] max-md:w-[38.86px]">
              <img alt="Earth logo mark" className="absolute inset-0 block size-full max-w-none" src={logoMark} />
            </div>
            <p
              className="text-[#0c2310] text-[40.65px] leading-[0] lowercase whitespace-nowrap shrink-0 max-md:text-[33.9px]"
              style={{ fontFamily: 'Goldman, serif' }}
            >
              <span className="uppercase" style={{ lineHeight: '0.38' }}>
                E
              </span>
              <span style={{ lineHeight: '0.38' }}>arth</span>
            </p>
          </div>

          {/* ── Nav links — truly centered (inside the drawer below lg) ── */}
          <div className="flex items-center gap-[32px] max-lg:hidden">
            <NavLink to="/" style={jakartaMedium} className={navLinkClass}>
              HOME
            </NavLink>

            <div className="flex gap-[8px] items-center shrink-0">
              <NavLink to="/marketplace" style={jakartaMedium} className={navLinkClass}>
                MARKETPLACE
              </NavLink>
              <div className="relative shrink-0 size-[16px]">
                <img alt="" className="absolute inset-0 block size-full max-w-none" src={arrowDown} />
              </div>
            </div>
            <NavLink to="/how-it-works" style={jakartaMedium} className={navLinkClass}>
              HOW IT WORKS
            </NavLink>
            <NavLink to="/about" style={jakartaMedium} className={navLinkClass}>
              ABOUT
            </NavLink>
          </div>

          {/* ── CTA — pinned right (inside the drawer below lg) ── */}
          <div className="flex gap-[16px] items-center shrink-0 max-lg:hidden">
            {/* Sign in — ghost (a signed-in person gets their dashboard instead) */}
            {signedIn ? (
              <NavLink
                to="/dashboard"
                className="flex h-[48px] items-center justify-center px-[24px] rounded-[30px] shrink-0 hover:bg-gray-50 transition-colors text-[#0c2310] text-[14px] font-medium leading-normal tracking-[-0.28px] whitespace-nowrap"
                style={jakartaMedium}
              >
                Dashboard
              </NavLink>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="flex h-[48px] items-center justify-center px-[24px] rounded-[30px] shrink-0 hover:bg-gray-50 transition-colors text-[#0c2310] text-[14px] font-medium leading-normal tracking-[-0.28px] whitespace-nowrap"
                style={jakartaMedium}
              >
                Sign in
              </button>
            )}

            {/* Start Trading — primary */}
            <NavLink
              to={signedIn ? '/marketplace' : '/signup'}
              className="flex gap-[4px] h-[48px] items-center justify-center px-[24px] rounded-[30px] shrink-0 hover:opacity-90 transition-opacity"
              style={{ backgroundImage: 'linear-gradient(90deg, rgb(0, 124, 83) 0%, rgb(0, 124, 83) 100%)' }}
            >
              <span
                className="text-[14px] font-medium leading-normal tracking-[-0.28px] whitespace-nowrap bg-clip-text text-transparent shrink-0"
                style={{
                  ...jakartaMedium,
                  backgroundImage:
                    'linear-gradient(178.607deg, rgb(255,255,255) 4.9851%, rgba(255,255,255,0.86) 85.731%)',
                }}
              >
                Start Trading
              </span>
              <div className="relative shrink-0 size-[24px]">
                <img alt="" className="absolute inset-0 block size-full max-w-none" src={arrowRight} />
              </div>
            </NavLink>
          </div>

          {/* ── Menu button — phones and tablets only ── */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="hidden max-lg:flex size-[48px] items-center justify-center rounded-full hover:bg-gray-50 transition-colors -mr-[12px]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 5h18M3 12h18M3 19h18" stroke="#0c2310" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      <Drawer open={menuOpen} onClose={closeMenu} side="right" label="Menu">
        <div className="flex items-center justify-between px-[16px] py-[24px]">
          <div className="flex gap-[8px] items-center">
            <img alt="" className="h-[32px] w-[31px]" src={logoMark} />
            <p className="text-[#0c2310] text-[27px] leading-[0] lowercase" style={{ fontFamily: 'Goldman, serif' }}>
              <span className="uppercase" style={{ lineHeight: '0.38' }}>
                E
              </span>
              <span style={{ lineHeight: '0.38' }}>arth</span>
            </p>
          </div>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="size-[44px] flex items-center justify-center rounded-full hover:bg-gray-50 -mr-[10px]"
          >
            <img src={closeIcon} alt="" className="size-[24px]" />
          </button>
        </div>
        <div className="flex flex-col px-[16px]">
          {[
            { to: '/', label: 'HOME' },
            { to: '/marketplace', label: 'MARKETPLACE' },
            { to: '/how-it-works', label: 'HOW IT WORKS' },
            { to: '/about', label: 'ABOUT' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={closeMenu}
              style={jakartaMedium}
              className={({ isActive }) =>
                `${navLinkClass} flex h-[52px] items-center border-b border-[#f7f7f7] ${isActive ? 'text-[#0c2310]' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-[12px] p-[16px]">
          {signedIn ? (
            <NavLink
              to="/dashboard"
              onClick={closeMenu}
              className="flex h-[48px] items-center justify-center rounded-[30px] border border-[#e4dede] text-[#0c2310] text-[14px] tracking-[-0.28px]"
              style={jakartaMedium}
            >
              Dashboard
            </NavLink>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                setLoginOpen(true)
              }}
              className="flex h-[48px] items-center justify-center rounded-[30px] border border-[#e4dede] text-[#0c2310] text-[14px] tracking-[-0.28px]"
              style={jakartaMedium}
            >
              Sign in
            </button>
          )}
          <NavLink
            to={signedIn ? '/marketplace' : '/signup'}
            onClick={closeMenu}
            className="flex gap-[4px] h-[48px] items-center justify-center rounded-[30px]"
            style={{ backgroundImage: 'linear-gradient(90deg, rgb(0, 124, 83) 0%, rgb(0, 124, 83) 100%)' }}
          >
            <span className="text-white text-[14px] tracking-[-0.28px]" style={jakartaMedium}>
              Start Trading
            </span>
            <img alt="" className="size-[24px]" src={arrowRight} />
          </NavLink>
        </div>
      </Drawer>

      <SignInDialogs open={loginOpen} onClose={() => setLoginOpen(false)} redirectTo={(location.state as { from?: string } | null)?.from} />
    </>
  )
}
