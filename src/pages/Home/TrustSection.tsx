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

// BUILDER: Figma places the vectors at negative Y so only their arch-curve
// portions are visible within the 696px section frame — the flat rectangle
// tops are intentionally above the frame. We replicate this by:
//  1. A gradient-only div (overflow-hidden) — keeps green inside the section.
//  2. A vectors div that extends 380px ABOVE section top, with a CSS mask
//     that hard-clips at the section boundary, so arches are visible inside
//     the green area but transparent/invisible in the white section above.
//  3. V4 is nudged down 60px from its Figma position so its arch tip enters
//     the visible frame (in Figma dev mode it shows because the canvas is
//     infinite; in a clipped frame it would be cut off).

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

// How far the vector container extends above the section top (must be ≥ max vector bleed).
const VECTOR_BLEED = 380

export default function TrustSection() {
  return (
    <section className="relative w-full h-[696px]">

      {/* ── 1. Gradient fill — strictly within section ── */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #0c2310 1.293%, #2f893f 152.66%)' }}
        />
      </div>

      {/*
        ── 2. Decorative vector arches ──
        Container starts VECTOR_BLEED px above the section so the SVGs can sit
        at their Figma positions (negative-top relative to section).
        A CSS mask makes the above-section portion fully transparent → no bleed
        into the white MarketplaceCatalog area above.
        The mask hard-clips at exactly the section top edge (VECTOR_BLEED px into the div).
      */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: `-${VECTOR_BLEED}px`,
          height: `${696 + VECTOR_BLEED}px`,
          zIndex: 1,
          maskImage: `linear-gradient(to bottom, transparent ${VECTOR_BLEED - 1}px, black ${VECTOR_BLEED + 1}px)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent ${VECTOR_BLEED - 1}px, black ${VECTOR_BLEED + 1}px)`,
        }}
      >
        {/*
          Each vector's `top` inside this container = VECTOR_BLEED + figma_top_offset.
          e.g. V1 Figma top = -346.56  →  380 - 346.56 = 33.44px inside this div.
          This recreates the exact same visual as in the Figma frame.
        */}

        {/* V1 — outermost arch, full section width, 835px tall */}
        <img
          src={vector1}
          alt=""
          className="absolute left-0"
          style={{ top: `${VECTOR_BLEED - 346.56}px`, width: '1440px', height: '835px' }}
        />

        {/* V2 — second ring */}
        <img
          src={vector2}
          alt=""
          className="absolute"
          style={{ top: `${VECTOR_BLEED - 361}px`, left: '128.98px', width: '1182px', height: '685px' }}
        />

        {/* V3 — third ring */}
        <img
          src={vector3}
          alt=""
          className="absolute"
          style={{ top: `${VECTOR_BLEED - 349.45}px`, left: '280.11px', width: '880px', height: '510px' }}
        />

        {/*
          V4 — innermost ring.
          Figma top = -345.6px → bottom = -3.4px (3.4px above section top, invisible in frame).
          Nudged down 60px so its arch tip appears within the section, matching what
          designers see in Figma dev mode (infinite canvas view).
        */}
        <img
          src={vector4}
          alt=""
          className="absolute"
          style={{ top: `${VECTOR_BLEED - 345.6 + 60}px`, left: '424.97px', width: '590px', height: '342px' }}
        />
      </div>

      {/* ── 3. Content — max-w-[1200px] centered ── */}
      <div className="relative max-w-[1200px] mx-auto h-full" style={{ zIndex: 2 }}>

        {/* Header text */}
        <div className="absolute top-[64px] left-0 w-[588px] flex flex-col gap-[8px]">
          <h2
            className="text-white text-[48px] tracking-[-0.96px] leading-[64px]"
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

        {/* Scroll arrows */}
        <div className="absolute top-[156px] right-0 flex gap-[16px] items-center">
          <div className="size-[40px] rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
            <img src={arrowRight} alt="previous" className="size-[20px] rotate-180" />
          </div>
          <div className="size-[40px] rounded-full bg-[#aee74a] flex items-center justify-center">
            <img src={arrowRight} alt="next" className="size-[20px]" />
          </div>
        </div>

        {/* Cards row — 2 visible at a time (2×588 + 24 = 1200px), horizontal scroll */}
        <div className="absolute top-[328px] left-0 right-0 flex gap-[24px] overflow-x-auto pb-[4px]">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-[#e4dede] border-solid rounded-[30px] h-[304px] w-[588px] shrink-0 relative overflow-hidden"
            >
              {/* Icon box */}
              <div className="absolute left-[23.5px] top-[23.5px] size-[80px] bg-[#f2f9f7] rounded-[20px] overflow-hidden flex items-center justify-center">
                <img src={card.icon} alt="" className="size-[32px]" />
              </div>

              {/* Badge pill */}
              <div className="absolute top-[46.5px] right-[23.5px] bg-[#f2f9f7] rounded-[30px] px-[16px] py-[5px]">
                <span
                  className="text-[#0c2310] text-[12px] leading-[24px] whitespace-nowrap"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
                >
                  {card.badge}
                </span>
              </div>

              {/* Text block */}
              <div className="absolute left-[23.5px] top-[143.5px] w-[540px] flex flex-col gap-[8px]">
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
