import { motion } from 'framer-motion'
import globeFrame from '../../assets/icons/globe-frame.svg'
import handshake from '../../assets/icons/handshake.svg'
import earthMarketsBg from '../../assets/images/earth-markets-bg.png'

// Figma's own code export (Property 1=1 -> Property 1=2, on hover) for every animated
// layer, verbatim: duration 1.25s, type spring, bounce 0. The background track animates
// width 1440->1727.1 / height 757.895->909 / x 0->-232.2 / y 0->-98 — a uniform ~1.1994x
// zoom (1727.1/1440 = 909/757.895) panned up-left, expressed below as scale+translate from
// the top-left corner so it holds at any viewport instead of only the fixed 1440px frame.
const spring = { duration: 1.25, type: 'spring' as const, bounce: 0 }

const bgVariants = {
  initial: { x: 0, y: 0, scale: 1 },
  hover: { x: -232.2, y: -98, scale: 1.1994 },
}
// Row 1 — globe icon pushes past the 422px-wide text (+446 = text width 422 + gap 24);
// text pulls back to the row start.
const row1IconVariants = { initial: { x: 0 }, hover: { x: 446 } }
const row1TextVariants = { initial: { x: 0 }, hover: { x: -88 } }
// Row 2 — mirrors row 1: text pushes forward 88px, handshake badge pulls back past the
// 687px-wide text (-711 = text width 687 + gap 24).
const row2TextVariants = { initial: { x: 0 }, hover: { x: 88 } }
const row2IconVariants = { initial: { x: 0 }, hover: { x: -711 } }

const gradientOverlay: React.CSSProperties = {
  background: 'linear-gradient(to top, #141414 1%, rgba(20,20,20,0) 100%)',
}

// 64/64 on the frame; 40 on tablets and 28 on phones, where the lines may wrap.
const headingClass =
  'text-[64px] font-bold tracking-[-1.28px] leading-[64px] whitespace-nowrap font-jakarta max-lg:text-[40px] max-lg:leading-[44px] max-lg:whitespace-normal max-lg:flex-wrap max-md:text-[28px] max-md:leading-[32px] max-md:tracking-[-0.6px]'

// Below the breakpoint where rows wrap, force every animated track back to rest — mobile
// has no real hover, and the pixel offsets only mean anything at the desktop row widths.
// !important (via the Tailwind `!` prefix) is required because Framer sets these inline.
const noMobileMotion = 'max-lg:!transform-none'

export default function EarthMarkets() {
  return (
    <motion.section
      className="w-full h-189.5 relative overflow-hidden max-lg:h-140 max-md:h-120"
      initial="initial"
      whileHover="hover"
    >

      {/* Layer 1 — Background image */}
      <motion.img
        src={earthMarketsBg}
        alt=""
        className={`absolute inset-0 size-full object-cover ${noMobileMotion}`}
        style={{ transformOrigin: '0 0' }}
        variants={bgVariants}
        transition={spring}
      />

      {/* Layer 2 — Gradient overlay */}
      <div className="absolute inset-0" style={gradientOverlay} />

      {/* Layer 3 — Text content pinned to bottom, aligned to 1200px grid */}
      {/* BUILDER: absolute bottom-[80px] + left-1/2 -translate-x-1/2 centres the
          1200px wrapper inside a 1440px-wide viewport, matching the Figma frame. */}
      <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-[1200px] max-xl:px-[24px] max-lg:bottom-[48px] max-md:px-[16px]">

        {/* Row 1 — globe icon + "Where Earth's" */}
        <div className={`flex items-center gap-[24px] pl-[93px] mb-4 max-lg:pl-0 max-md:gap-3 max-md:mb-2 ${headingClass}`}>
          <motion.img
            src={globeFrame}
            alt=""
            className={`size-16 shrink-0 max-lg:size-11 max-md:size-8 ${noMobileMotion}`}
            variants={row1IconVariants}
            transition={spring}
          />
          <motion.span className={`text-white ${noMobileMotion}`} variants={row1TextVariants} transition={spring}>
            Where Earth&#39;s
          </motion.span>
        </div>

        {/* Row 2 — "natural resources meet" + handshake badge */}
        <div className={`flex items-center gap-[24px] pl-0 mb-4 max-md:gap-3 max-md:mb-2 ${headingClass}`}>
          <motion.span className={`text-white ${noMobileMotion}`} variants={row2TextVariants} transition={spring}>
            natural resources meet
          </motion.span>
          {/* Handshake badge */}
          <motion.div
            className={`bg-accent-lime rounded-[50px] p-4 flex items-center shrink-0 max-lg:p-2.5 max-md:p-1.5 ${noMobileMotion}`}
            variants={row2IconVariants}
            transition={spring}
          >
            <img
              src={handshake}
              alt="handshake"
              className="size-8 max-lg:size-6 max-md:size-5"
            />
          </motion.div>
        </div>

        {/* Row 3 — "the " (green) + "world's" (lime) + " markets." (green) — indented 173px.
            Identical position in both Figma states, so it never animates. */}
        <div className={`flex items-center pl-[173px] max-lg:pl-0 ${headingClass}`}>
          <span className="text-[#007c53]">the&nbsp;</span>
          <span className="text-[#aee74a]">world&#39;s</span>
          <span className="text-[#007c53]">&nbsp;markets.</span>
        </div>

      </div>
    </motion.section>
  )
}
