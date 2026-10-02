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

// BUILDER: Section is 1440×696px in Figma. Content pinned at left-[120px] = 120px from section edge,
// spanning 1200px. Vectors extend above the section (negative top) as decorative overlapping lines.

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

export default function TrustSection() {
  return (
    // BUILDER: overflow-visible so vectors bleed upward into the section above; outer page uses overflow-x-hidden
    <div
      className="relative w-full h-[696px] overflow-visible"
      style={{
        background: 'linear-gradient(180deg, #2f893f 0%, #0c2310 100%)',
      }}
    >
      {/* ── Decorative vector curves (bleed above section) ── */}
      {/* Vector 7831 — outermost ring, spans full width */}
      <div className="absolute left-0 top-[-347px] w-full h-[835px] pointer-events-none">
        <div className="absolute inset-[0_0_1.74%_0]">
          <img src={vector1} alt="" className="block w-full h-full max-w-none" />
        </div>
      </div>
      {/* Vector 7830 */}
      <div className="absolute left-[128.98px] top-[-361px] w-[1182px] h-[685px] pointer-events-none">
        <div className="absolute inset-[0_0_2.12%_0]">
          <img src={vector2} alt="" className="block w-full h-full max-w-none" />
        </div>
      </div>
      {/* Vector 7829 */}
      <div
        className="absolute top-[-349px] h-[510px] pointer-events-none"
        style={{ left: 'calc(11.11% + 120px)', width: '880px' }}
      >
        <div className="absolute inset-[0_0_2.85%_0]">
          <img src={vector3} alt="" className="block w-full h-full max-w-none" />
        </div>
      </div>
      {/* Vector 7828 — innermost ring */}
      <div
        className="absolute top-[-346px] h-[342px] pointer-events-none"
        style={{ left: 'calc(22.22% + 105px)', width: '590px' }}
      >
        <div className="absolute inset-[-0.15%_0_4.25%_0]">
          <img src={vector4} alt="" className="block w-full h-full max-w-none" />
        </div>
      </div>

      {/* ── Header text — absolute at top-[64px] left-[120px] w-[588px] ── */}
      <div className="absolute left-[120px] top-[64px] w-[588px] flex flex-col gap-[8px]">
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

      {/* ── Scroll arrows — absolute right side of content area at top-[156px] ── */}
      {/* BUILDER: Figma places arrows at left-[calc(88.89%-56px)] = ~1224px from section left edge */}
      <div className="absolute top-[156px] flex gap-[16px] items-center" style={{ left: 'calc(88.89% - 56px)' }}>
        <div className="size-[40px] rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
          <img src={arrowRight} alt="previous" className="size-[20px] rotate-180" />
        </div>
        <div className="size-[40px] rounded-full bg-[#aee74a] flex items-center justify-center">
          <img src={arrowRight} alt="next" className="size-[20px]" />
        </div>
      </div>

      {/* ── Cards row — absolute at top-[328px] left-[120px] w-[1200px] ── */}
      <div className="absolute left-[120px] top-[328px] w-[1200px] flex gap-[24px] overflow-x-auto pb-[4px]">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-[#e4dede] border-solid rounded-[30px] h-[304px] w-[588px] shrink-0 relative overflow-hidden"
          >
            {/* Icon box — absolute top-left */}
            <div className="absolute left-[23.5px] top-[23.5px] size-[80px] bg-[#f2f9f7] rounded-[20px] overflow-hidden flex items-center justify-center">
              <img src={card.icon} alt="" className="size-[32px]" />
            </div>

            {/* Badge pill — absolute top-right area */}
            <div className="absolute top-[46.5px] right-[23.5px] bg-[#f2f9f7] rounded-[30px] px-[16px] py-[5px]">
              <span
                className="text-[#0c2310] text-[12px] leading-[24px] whitespace-nowrap"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
              >
                {card.badge}
              </span>
            </div>

            {/* Text block — absolute at top-[143.5px] left-[23.5px] */}
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
  )
}
