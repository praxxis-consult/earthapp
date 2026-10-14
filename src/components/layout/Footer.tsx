import { Link } from 'react-router-dom'
import logoMarkFooter from '../../assets/icons/logo-mark-footer.svg'
import xTwitter from '../../assets/icons/x-twitter.svg'
import facebook from '../../assets/icons/facebook.svg'
import instagram from '../../assets/icons/instagram.svg'
import linkedin from '../../assets/icons/linkedin.svg'

// BUILDER: gradient is nearly vertical (–0.000003 deg ≈ bottom-to-top),
// dark green at 1.29% stop, medium green at 152.66% — must use inline style.
const footerBg: React.CSSProperties = {
  background:
    'linear-gradient(-0.000003deg, rgb(12, 35, 16) 1.2931%, rgb(47, 137, 63) 152.66%)',
}

// BUILDER: font-family overrides needed because Tailwind v4 exposes font tokens
// as CSS vars but does not generate utility classes for them automatically.
const jakartaRegular: React.CSSProperties = {
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  fontWeight: 400,
}

const jakartaMedium: React.CSSProperties = {
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  fontWeight: 500,
}

// BUILDER: legal bar right text uses Inter, not Plus Jakarta Sans per spec.
const interRegular: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
}

const navColumns = [
  {
    heading: 'PLATFORM',
    links: [
      { label: 'Marketplace', to: '/marketplace' },
      { label: 'Commodity Tracking', to: '/commodity-tracking' },
      { label: 'Bounty System', to: '/bounty-system' },
    ],
  },
  {
    heading: 'COMPANY',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Events', to: '/events' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'RESOURCES',
    links: [
      { label: 'Documentations', to: '/docs' },
      { label: 'Blog', to: '/blog' },
      { label: 'Release Note', to: '/release-note' },
      { label: 'Security', to: '/security' },
    ],
  },
  {
    heading: 'LEGAL',
    links: [
      { label: 'Terms', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'DPA', to: '/dpa' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="w-full" style={footerBg}>
      <div className="max-w-[1200px] mx-auto flex flex-col justify-between pt-[80px] pb-[80px] max-xl:px-[24px] max-lg:pt-[56px] max-lg:pb-[32px] max-md:px-[16px]">
      {/* ── Top row ── */}
      <div className="flex items-start gap-[24px] max-lg:flex-col max-lg:gap-[40px]">

        {/* Brand column */}
        <div className="w-[384px] shrink-0 flex flex-col gap-[40px] max-lg:w-full max-lg:max-w-[480px] max-lg:gap-[24px]">

          {/* Brand copy section: logo row + tagline grouped with gap-[16px] */}
          <div className="flex flex-col gap-[16px]">

            {/* Logo mark + wordmark */}
            <div className="flex items-center gap-[5px]">
              <div className="relative shrink-0 h-[32px] w-[31.086px]">
                <img
                  alt="Earth logo mark"
                  className="absolute inset-0 block size-full max-w-none"
                  src={logoMarkFooter}
                />
              </div>
              <p
                className="text-[27.1px] text-white leading-[0] lowercase whitespace-nowrap shrink-0"
                style={{ fontFamily: 'Goldman, serif' }}
              >
                <span className="uppercase" style={{ lineHeight: '0.38' }}>E</span>
                <span style={{ lineHeight: '0.38' }}>arth</span>
              </p>
            </div>

            {/* Tagline */}
            <p
              className="w-full text-[14px] leading-[24px]"
              style={{ ...jakartaRegular, color: 'rgba(255,255,255,0.75)' }}
            >
              Earth is a premier international natural resource &amp; trade infrastructure group. Connecting primary agricultural cooperatives, energy reservoirs, and mineral concessions directly to global industrial markets.
            </p>

          </div>

          {/* Social icons */}
          <div className="flex items-center gap-[16px]">

            {/* X / Twitter */}
            <div className="relative shrink-0 size-[20px]">
              <img alt="X (Twitter)" className="absolute inset-0 block size-full max-w-none" src={xTwitter} />
            </div>

            {/* Facebook */}
            <div className="relative shrink-0 size-[24px]">
              <img alt="Facebook" className="absolute inset-0 block size-full max-w-none" src={facebook} />
            </div>

            {/* Instagram */}
            <div className="relative shrink-0 size-[24px]">
              <img alt="Instagram" className="absolute inset-0 block size-full max-w-none" src={instagram} />
            </div>

            {/* LinkedIn — spec requires double-inset wrapper for masked icon container */}
            {/* BUILDER: nested inset percentages replicate Figma's mask/clip structure exactly */}
            <div className="relative shrink-0 size-[26px]">
              <div className="absolute inset-[12.5%]">
                <div className="absolute inset-[-3.85%]">
                  <img alt="LinkedIn" className="block max-w-none size-full" src={linkedin} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Nav columns */}
        <div className="flex flex-[1_0_0] gap-[24px] max-lg:grid max-lg:w-full max-lg:grid-cols-4 max-lg:gap-y-[32px] max-md:grid-cols-2">
          {navColumns.map((col) => (
            <div key={col.heading} className="flex-[1_0_0] flex flex-col gap-[24px] items-start">

              {/* Column heading */}
              <span
                className="text-[14px] leading-[24px]"
                style={{ ...jakartaMedium, color: 'rgba(255,255,255,0.75)' }}
              >
                {col.heading}
              </span>

              {/* Links */}
              <div className="flex flex-col gap-[16px] items-start">
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-[14px] text-white leading-[24px] hover:opacity-80 transition-opacity"
                    style={jakartaRegular}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* ── Legal bar ── */}
      {/* BUILDER: mt-[80px] added to push the bar down from the top row,
          matching the overall 80px top/bottom padding rhythm of the footer */}
      <div className="flex items-center justify-between py-[24px] border-t border-[rgba(156,156,156,0.5)] mt-[142px] max-lg:mt-[56px] max-md:flex-col max-md:items-start max-md:gap-[8px]">
        <span
          className="text-[14px] text-white font-normal leading-[20px] whitespace-nowrap max-md:whitespace-normal"
          style={jakartaRegular}
        >
          © Copyright 2026 Earth Trading Group, All Rights Reserved.
        </span>
        {/* BUILDER: right side uses Inter per spec — different font family from rest of footer */}
        <span
          className="text-[14px] text-white font-normal leading-[20px] whitespace-nowrap max-md:whitespace-normal"
          style={interRegular}
        >
          Earth is the marketplace, never the escrow.
        </span>
      </div>

      </div>
    </footer>
  )
}
