import { useLayoutEffect, useRef, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useMediaQuery } from '../../lib/useMediaQuery'
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

// Below lg there is no hover and the rows are narrower, so the same choreography plays when
// the section scrolls into view (and unwinds when it leaves), with the slide distances taken
// from the rendered rows: the icon crosses its own text plus the gap and the text takes the
// icon's place, which is exactly what the desktop numbers encode (446 = 422 + 24, 88 = 64 + 24,
// 711 = 687 + 24). The background zoom keeps its 1.1994x and pans in proportion to the box.
const BELOW_LG = '(max-width: 1023px)'

interface Fit {
  bg: { x: number; y: number }
  row1Icon: number
  row1Text: number
  row2Text: number
  row2Icon: number
}

const slide = (x: number): Variants => ({ initial: { x: 0 }, hover: { x } })

export default function EarthMarkets() {
  const touchLayout = useMediaQuery(BELOW_LG)
  const sectionRef = useRef<HTMLElement>(null)
  const row1Ref = useRef<HTMLDivElement>(null)
  const icon1Ref = useRef<HTMLImageElement>(null)
  const text1Ref = useRef<HTMLSpanElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState<Fit | null>(null)

  useLayoutEffect(() => {
    if (!touchLayout || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      const section = sectionRef.current
      const row1 = row1Ref.current, icon1 = icon1Ref.current, text1 = text1Ref.current
      const row2 = row2Ref.current, text2 = text2Ref.current, badge = badgeRef.current
      if (!section || !row1 || !icon1 || !text1 || !row2 || !text2 || !badge) return
      const gap = (row: HTMLElement) => parseFloat(getComputedStyle(row).columnGap) || 0
      // A row that wrapped onto two lines has nothing to swap; it stays put.
      const oneLine = (row: HTMLElement, text: HTMLElement) => row.offsetHeight <= text.offsetHeight + 4
      const g1 = gap(row1), g2 = gap(row2)
      setFit({
        bg: { x: (-232.2 * section.offsetWidth) / 1440, y: (-98 * section.offsetHeight) / 758 },
        row1Icon: oneLine(row1, text1) ? text1.offsetWidth + g1 : 0,
        row1Text: oneLine(row1, text1) ? -(icon1.offsetWidth + g1) : 0,
        row2Text: oneLine(row2, text2) ? badge.offsetWidth + g2 : 0,
        row2Icon: oneLine(row2, text2) ? -(text2.offsetWidth + g2) : 0,
      })
    }
    // The observer fires once on observe and again whenever the rows re-flow.
    const ro = new ResizeObserver(measure)
    for (const el of [sectionRef.current, row1Ref.current, row2Ref.current]) if (el) ro.observe(el)
    return () => ro.disconnect()
  }, [touchLayout])

  const fitted = touchLayout ? fit : null
  const bg: Variants = fitted ? { initial: { x: 0, y: 0, scale: 1 }, hover: { ...fitted.bg, scale: 1.1994 } } : bgVariants

  return (
    <motion.section
      ref={sectionRef}
      className="w-full h-189.5 relative overflow-hidden max-lg:h-140 max-md:h-120"
      initial="initial"
      whileHover={touchLayout ? undefined : 'hover'}
      whileInView={touchLayout ? 'hover' : undefined}
      viewport={{ amount: 0.5 }}
    >

      {/* Layer 1 — Background image */}
      <motion.img
        src={earthMarketsBg}
        alt=""
        className="absolute inset-0 size-full object-cover"
        style={{ transformOrigin: '0 0' }}
        variants={bg}
        transition={spring}
      />

      {/* Layer 2 — Gradient overlay */}
      <div className="absolute inset-0" style={gradientOverlay} />

      {/* Layer 3 — Text content pinned to bottom, aligned to 1200px grid */}
      {/* BUILDER: absolute bottom-[80px] + left-1/2 -translate-x-1/2 centres the
          1200px wrapper inside a 1440px-wide viewport, matching the Figma frame. */}
      <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-[1200px] max-xl:px-[24px] max-lg:bottom-[48px] max-md:px-[16px]">

        {/* Row 1 — globe icon + "Where Earth's" */}
        <div ref={row1Ref} className={`flex items-center gap-[24px] pl-[93px] mb-4 max-lg:pl-0 max-md:gap-3 max-md:mb-2 ${headingClass}`}>
          <motion.img
            ref={icon1Ref}
            src={globeFrame}
            alt=""
            className="size-16 shrink-0 max-lg:size-11 max-md:size-8"
            variants={fitted ? slide(fitted.row1Icon) : row1IconVariants}
            transition={spring}
          />
          <motion.span ref={text1Ref} className="text-white" variants={fitted ? slide(fitted.row1Text) : row1TextVariants} transition={spring}>
            Where Earth&#39;s
          </motion.span>
        </div>

        {/* Row 2 — "natural resources meet" + handshake badge */}
        <div ref={row2Ref} className={`flex items-center gap-[24px] pl-0 mb-4 max-md:gap-3 max-md:mb-2 ${headingClass}`}>
          <motion.span ref={text2Ref} className="text-white" variants={fitted ? slide(fitted.row2Text) : row2TextVariants} transition={spring}>
            natural resources meet
          </motion.span>
          {/* Handshake badge */}
          <motion.div
            ref={badgeRef}
            className="bg-accent-lime rounded-[50px] p-4 flex items-center shrink-0 max-lg:p-2.5 max-md:p-1.5"
            variants={fitted ? slide(fitted.row2Icon) : row2IconVariants}
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
