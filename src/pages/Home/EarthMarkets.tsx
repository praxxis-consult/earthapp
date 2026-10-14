import globeFrame from '../../assets/icons/globe-frame.svg'
import handshake from '../../assets/icons/handshake.svg'
import earthMarketsBg from '../../assets/images/earth-markets-bg.png'

// BUILDER: gradient cannot be expressed as a static Tailwind class — inline style required
const gradientOverlay: React.CSSProperties = {
  background: 'linear-gradient(to top, #141414 1%, rgba(20,20,20,0) 100%)',
}

// BUILDER: Plus Jakarta Sans Bold with tight tracking matches the Figma spec exactly;
//          font-jakarta token covers the family, weight/tracking set per spec.
// 64/64 on the frame; 40 on tablets and 28 on phones, where the lines may wrap.
const headingClass =
  'text-[64px] font-bold tracking-[-1.28px] leading-[64px] whitespace-nowrap font-jakarta max-lg:text-[40px] max-lg:leading-[44px] max-lg:whitespace-normal max-lg:flex-wrap max-md:text-[28px] max-md:leading-[32px] max-md:tracking-[-0.6px]'

export default function EarthMarkets() {
  return (
    <section className="w-full h-[758px] relative overflow-hidden max-lg:h-[560px] max-md:h-[480px]">

      {/* Layer 1 — Background image */}
      <img
        src={earthMarketsBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Layer 2 — Gradient overlay */}
      <div className="absolute inset-0" style={gradientOverlay} />

      {/* Layer 3 — Text content pinned to bottom, aligned to 1200px grid */}
      {/* BUILDER: absolute bottom-[80px] + left-1/2 -translate-x-1/2 centres the
          1200px wrapper inside a 1440px-wide viewport, matching the Figma frame. */}
      <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-[1200px] max-xl:px-[24px] max-lg:bottom-[48px] max-md:px-[16px]">

        {/* Row 1 — globe icon + "Where Earth's" — indented 93px, mb=16px gap to row 2 */}
        <div className={`flex items-center gap-[24px] pl-[93px] mb-[16px] max-lg:pl-0 max-md:gap-[12px] max-md:mb-[8px] ${headingClass}`}>
          <img
            src={globeFrame}
            alt=""
            className="size-[64px] shrink-0 max-lg:size-[44px] max-md:size-[32px]"
          />
          <span className="text-white">Where Earth&#39;s</span>
        </div>

        {/* Row 2 — "natural resources meet" + handshake badge — flush left, mb=48px gap to row 3 */}
        {/* BUILDER: row2→row3 pixel gap = 112px, row height = 64px → margin-bottom = 48px */}
        <div className={`flex items-center gap-[24px] pl-0 mb-[48px] max-lg:mb-[24px] max-md:gap-[12px] max-md:mb-[8px] ${headingClass}`}>
          <span className="text-white">natural resources meet</span>
          {/* Handshake badge */}
          <div className="bg-[#aee74a] rounded-[50px] p-[16px] flex items-center shrink-0 max-lg:p-[10px] max-md:p-[6px]">
            <img
              src={handshake}
              alt="handshake"
              className="size-[32px] max-lg:size-[24px] max-md:size-[20px]"
            />
          </div>
        </div>

        {/* Row 3 — "the " (green) + "world's" (lime) + " markets." (green) — indented 173px */}
        <div className={`flex items-center pl-[173px] max-lg:pl-0 ${headingClass}`}>
          <span className="text-[#007c53]">the&nbsp;</span>
          <span className="text-[#aee74a]">world&#39;s</span>
          <span className="text-[#007c53]">&nbsp;markets.</span>
        </div>

      </div>
    </section>
  )
}
