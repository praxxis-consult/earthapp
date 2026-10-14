import { useRef } from 'react'
import arrowRight from '../../assets/icons/arrow-right.svg'
import boxIcon from '../../assets/icons/trust-box.svg'
import medalIcon from '../../assets/icons/trust-medal.svg'
import lockIcon from '../../assets/icons/trust-lock.svg'
import shieldIcon from '../../assets/icons/trust-shield.svg'
import globalIcon from '../../assets/icons/trust-global.svg'
import dataIcon from '../../assets/icons/trust-data.svg'
import vector1 from '../../assets/images/trust-vector-1.svg'
import vector2 from '../../assets/images/trust-vector-2.svg'
import vector3 from '../../assets/images/trust-vector-3.svg'
import vector4 from '../../assets/images/trust-vector-4.svg'

interface TrustCard {
  icon: string
  badge: string
  title: string
  body: string
}

const cards: TrustCard[] = [
  {
    icon: boxIcon,
    badge: 'NO SPECULATIVE MIDDLEMEN',
    title: 'Direct from Farms & Mines',
    body: 'We partner directly with family-run farming cooperatives and licensed mining communities across West Africa, South America, and Asia. This direct connection ensures local producers receive higher, living incomes while buyers get dependable, unadulterated shipments.',
  },
  {
    icon: medalIcon,
    badge: 'VERIFIED BY SGS & INTERTEK',
    title: 'Tested by Independent Bodies',
    body: 'Before any cargo is loaded onto an airplane or container ship, world-renowned independent laboratories test its purity, moisture, and grade. Buyers receive official certificates guaranteeing that what arrives matches what was promised.',
  },
  {
    icon: lockIcon,
    badge: 'ESCROW GUARANTEED PROTECTION',
    title: 'Safe, Protected Payments',
    body: 'No party takes unnecessary financial risks. Transactions use standard international bank payment guarantees (Letters of Credit). Funds are held securely and only released when the testing agency confirms the goods are in order.',
  },
  {
    icon: shieldIcon,
    badge: 'PROTECTING PEOPLE & NATURE',
    title: 'Ethical & Deforestation-Free',
    body: 'Every harvest of cocoa or coffee is satellite-mapped down to the tree grove to ensure zero rainforest clearance. Every ounce of gold and industrial metal is audited to ensure safe working conditions and zero child or conflict labor.',
  },
  {
    icon: globalIcon,
    badge: 'WORLDWIDE MARKET REACH',
    title: 'Global Marketplace Access',
    body: 'Seamlessly connecting local agricultural producers and primary mining concessions directly to international industrial buyers, tier-1 processors, and global commodity markets without restrictive regional barriers or distributor monopolies.',
  },
  {
    icon: dataIcon,
    badge: 'COMMUNITY-LED STANDARD',
    title: 'Decentralized Governance Participation',
    body: 'Enabling transparent, distributed governance mechanisms where producers, trade partners, and buyers participate directly in protocol standards, quality consensus, pricing transparency, and verifiable trade policies.',
  },
]

// One scroll step = the first card's width (588 on the frame, 320 on phones) + the 24px gap
const CARD_GAP = 24

// How far the vector container extends above the section
const BLEED = 380

export default function TrustSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollCards(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    const card = scrollRef.current.firstElementChild?.firstElementChild as HTMLElement | null
    const step = (card?.offsetWidth ?? 588) + CARD_GAP
    scrollRef.current.scrollBy({ left: dir === 'right' ? step : -step, behavior: 'smooth' })
  }

  return (
    <section className="relative w-full h-[696px] max-lg:h-auto max-lg:pb-[48px]">

      {/* ── Gradient fill — clipped within section ── */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #0c2310 1.293%, #2f893f 152.66%)' }}
        />
      </div>

      {/*
        ── Decorative vector arches ──
        All 4 vectors are centered horizontally on the full viewport width
        (matching Figma where each SVG is centered around x=720 of 1440px).
        Container extends BLEED px above the section; CSS mask clips the arches
        exactly at the section top — no bleed into the white area above.
      */}
      <div
        className="absolute left-0 right-0 top-[-380px] h-[1076px] pointer-events-none overflow-hidden max-lg:h-auto max-lg:bottom-0"
        style={{
          zIndex: 1,
          maskImage: `linear-gradient(to bottom, transparent ${BLEED - 1}px, black ${BLEED + 1}px)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent ${BLEED - 1}px, black ${BLEED + 1}px)`,
        }}
      >
        {/* V1 — 1440px wide, centered */}
        <img
          src={vector1}
          alt=""
          className="absolute"
          style={{
            top: `${BLEED - 346.56}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '1440px',
            height: '835px',
          }}
        />
        {/* V2 — 1182px wide, centered */}
        <img
          src={vector2}
          alt=""
          className="absolute"
          style={{
            top: `${BLEED - 361}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '1182px',
            height: '685px',
          }}
        />
        {/* V3 — 880px wide, centered */}
        <img
          src={vector3}
          alt=""
          className="absolute"
          style={{
            top: `${BLEED - 349.45}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '880px',
            height: '510px',
          }}
        />
        {/* V4 — 590px wide, centered. Nudged 60px down so arch tip enters the frame */}
        <img
          src={vector4}
          alt=""
          className="absolute"
          style={{
            top: `${BLEED - 345.6 + 60}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '590px',
            height: '342px',
          }}
        />
      </div>

      {/* ── Text + arrows — max-w-[1200px] centered ── */}
      <div className="relative max-w-[1200px] mx-auto h-full max-xl:px-[24px] max-lg:h-auto max-lg:pt-[48px] max-lg:flex max-lg:flex-col max-lg:gap-[24px] max-md:px-[16px]" style={{ zIndex: 2 }}>

        {/* Header text */}
        <div className="absolute top-[64px] left-0 w-[588px] flex flex-col gap-[8px] max-xl:left-[24px] max-lg:static max-lg:w-full max-lg:max-w-[588px]">
          <h2
            className="text-white text-[48px] tracking-[-0.96px] leading-[64px] max-md:text-[32px] max-md:leading-[40px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
          >
            Trade Built on Honesty and Physical Proof
          </h2>
          <p
            className="text-[rgba(255,255,255,0.75)] text-[16px] leading-[29.25px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
          >
            In global commerce, trust isn't just a promise, it is proven in independent laboratories, verified by satellite mapping, and confirmed by fair wages paid directly to producers.
          </p>
        </div>

        {/* Scroll arrows — functional */}
        <div className="absolute top-[156px] right-0 flex gap-[16px] items-center max-xl:right-[24px] max-lg:static">
          <button
            onClick={() => scrollCards('left')}
            className="size-[40px] rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center cursor-pointer hover:bg-[rgba(255,255,255,0.3)] transition-colors"
            aria-label="Scroll left"
          >
            <img src={arrowRight} alt="" className="size-[20px] rotate-180" />
          </button>
          <button
            onClick={() => scrollCards('right')}
            className="size-[40px] rounded-full bg-[#aee74a] flex items-center justify-center cursor-pointer hover:bg-[#c5f060] transition-colors"
            aria-label="Scroll right"
          >
            <img src={arrowRight} alt="" className="size-[20px]" />
          </button>
        </div>

      </div>

      {/*
        ── Cards strip — lives outside max-w so it can overflow the right edge freely.
        paddingLeft aligns the first card with the content left margin.
        On screens narrower than 1200px falls back to 24px gutter.
      ── */}
      <div
        ref={scrollRef}
        className="absolute left-0 right-0 top-[328px] overflow-x-auto max-lg:static max-lg:mt-[32px]"
        style={{
          zIndex: 2,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex gap-[24px] pb-[4px] pl-[max(calc((100vw-1200px)/2),24px)] max-lg:pr-[24px] max-md:pl-[16px] max-md:pr-[16px]">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-[#e4dede] border-solid rounded-[30px] h-[304px] w-[588px] shrink-0 relative overflow-hidden max-md:h-auto max-md:w-[320px] max-md:flex max-md:flex-col max-md:gap-[16px] max-md:p-[24px]"
            >
              {/* Icon box */}
              <div className="absolute left-[23.5px] top-[23.5px] size-[80px] bg-[#f2f9f7] rounded-[20px] overflow-hidden flex items-center justify-center max-md:static max-md:size-[64px]">
                <img src={card.icon} alt="" className="size-[32px]" />
              </div>

              {/* Badge pill */}
              <div className="absolute top-[46.5px] right-[23.5px] bg-[#f2f9f7] rounded-[30px] px-[16px] py-[5px] max-md:static max-md:self-start">
                <span
                  className="text-[#0c2310] text-[12px] leading-[24px] whitespace-nowrap max-md:whitespace-normal"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
                >
                  {card.badge}
                </span>
              </div>

              {/* Text block */}
              <div className="absolute left-[23.5px] top-[143.5px] w-[540px] flex flex-col gap-[8px] max-md:static max-md:w-full">
                <p
                  className="text-[#101604] text-[24px] tracking-[-1px] leading-[32px]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
                >
                  {card.title}
                </p>
                <p
                  className="text-[#807e7e] text-[15px] leading-[24px]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
                >
                  {card.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
