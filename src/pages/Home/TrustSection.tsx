import arrowRight from '../../assets/icons/arrow-right.svg'
import boxIcon from '../../assets/icons/trust-box.svg'
import medalIcon from '../../assets/icons/trust-medal.svg'
import lockIcon from '../../assets/icons/trust-lock.svg'
import shieldIcon from '../../assets/icons/trust-shield.svg'
import globalIcon from '../../assets/icons/trust-global.svg'
import dataIcon from '../../assets/icons/trust-data.svg'

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
    <section
      className="w-full py-[64px] overflow-hidden"
      style={{
        background: 'linear-gradient(-0.000003deg, rgb(12, 35, 16) 1.2931%, rgb(47, 137, 63) 152.66%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header row */}
        <div className="flex items-start justify-between mb-[64px]">
          <div className="w-[588px] flex flex-col gap-[8px]">
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
          <div className="flex gap-[16px] items-center shrink-0">
            <div className="size-[40px] rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
              <img src={arrowRight} alt="previous" className="size-[20px] rotate-180" />
            </div>
            <div className="size-[40px] rounded-full bg-[#aee74a] flex items-center justify-center">
              <img src={arrowRight} alt="next" className="size-[20px]" />
            </div>
          </div>
        </div>

        {/* Cards — horizontal scroll, show 2 at a time */}
        <div className="flex gap-[24px] overflow-x-auto pb-[8px] scrollbar-hide">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-[#e4dede] rounded-[30px] h-[304px] w-[588px] shrink-0 relative overflow-hidden"
            >
              {/* Icon */}
              <div className="absolute left-[24px] top-[24px] size-[80px] bg-[#f2f9f7] rounded-[20px] flex items-center justify-center">
                <img src={card.icon} alt="" className="size-[32px]" />
              </div>

              {/* Badge */}
              <div className="absolute top-[47px] right-[24px] bg-[#f2f9f7] rounded-[30px] px-[16px] py-[5px]">
                <span
                  className="text-[#0c2310] text-[12px] leading-[24px] whitespace-nowrap"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
                >
                  {card.badge}
                </span>
              </div>

              {/* Text */}
              <div className="absolute left-[24px] top-[144px] w-[540px] flex flex-col gap-[8px]">
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
