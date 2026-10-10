import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import scrollIcon from '../../assets/icons/hero-scroll.svg'
import arrowRight from '../../assets/icons/hero-arrow-right.svg'
import slide1 from '../../assets/images/hero-slide-1.png'
import slide2 from '../../assets/images/hero-slide-6.png'
import slide3 from '../../assets/images/hero-slide-7.png'
import slide4 from '../../assets/images/hero-slide-8.png'
import slide5 from '../../assets/images/hero-slide-9.png'

const SLIDES = [slide1, slide2, slide3, slide4, slide5]
const INTERVAL_MS = 5000

const jakarta = (weight: number): React.CSSProperties => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

export default function Hero() {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative overflow-hidden w-full" style={{ height: '1024px' }}>

      {/* ── Cycling backgrounds ── */}
      {SLIDES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }}
        />
      ))}

      {/* ── Gradient overlay ── */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, #101604 0%, rgba(16,22,4,0) 50%)' }}
      />

      {/* ── Content ── */}
      <div
        className="absolute flex flex-col items-start"
        style={{ bottom: '80px', left: '120px', width: '1200px', gap: '64px' }}
      >
        {/* Eyebrow + headline */}
        <div className="flex flex-col items-start w-full" style={{ gap: '16px' }}>
          <p
            className="text-[#f8f8f8] text-[12px] uppercase w-full"
            style={{ ...jakarta(500), letterSpacing: '1.98px' }}
          >
            Global sourcing · Import &amp; export
          </p>
          <div className="flex flex-col items-start w-full">
            <p
              className="text-[#f8f6f1] text-[120px] w-full"
              style={{ ...jakarta(700), letterSpacing: '-2px', lineHeight: '120px' }}
            >
              From Earth
            </p>
            <p
              className="text-[#f8f6f1] text-[120px] w-full"
              style={{ ...jakarta(700), letterSpacing: '-2px', lineHeight: '120px' }}
            >
              to market.
            </p>
          </div>
        </div>

        {/* Divider + bottom row */}
        <div
          className="flex flex-col items-start w-full"
          style={{
            gap: '40px',
            borderTop: '1px solid rgba(156,156,156,0.5)',
            paddingTop: '32px',
          }}
        >
          {/* Body + CTAs */}
          <div className="flex items-end justify-between w-full">
            <p
              className="text-[#f8f8f8] text-[16px]"
              style={{ ...jakarta(400), lineHeight: '29.25px', width: '588px' }}
            >
              Earth sources, buys and moves products and natural resources — agriculture, energy,
              minerals, metals and raw materials from where they are produced to the markets that
              need them.
            </p>

            <div className="flex items-center" style={{ gap: '16px' }}>
              {/* Start Trading */}
              <button
                onClick={() => navigate('/marketplace')}
                className="flex items-center justify-center"
                style={{ background: '#aee74a', height: '48px', padding: '16px 24px', borderRadius: '30px', gap: '8px' }}
              >
                <span className="text-[#0c2310] text-[14px] whitespace-nowrap" style={{ ...jakarta(500), letterSpacing: '-0.28px' }}>
                  Start Trading
                </span>
                <img src={arrowRight} alt="" className="size-[24px] shrink-0" />
              </button>

              {/* Explore all Resources */}
              <button
                className="flex items-center justify-center"
                style={{ background: '#404438', height: '48px', padding: '16px 28px', borderRadius: '30px' }}
              >
                <span
                  className="text-[14px] whitespace-nowrap"
                  style={{
                    ...jakarta(500),
                    letterSpacing: '-0.28px',
                    background: 'linear-gradient(179.16deg, #ffffff 4.99%, rgba(255,255,255,0.86) 85.73%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Explore all Resources
                </span>
              </button>
            </div>
          </div>

          {/* Scroll + dots */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center" style={{ gap: '12px', height: '24px' }}>
              <img src={scrollIcon} alt="" className="size-[24px] shrink-0" />
              <span
                className="text-[12px] uppercase whitespace-nowrap"
                style={{ ...jakarta(400), letterSpacing: '1.98px', color: 'rgba(248,248,248,0.75)' }}
              >
                Scroll
              </span>
            </div>

            {/* Slide indicator dots */}
            <div className="flex items-center" style={{ gap: '8px' }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Slide ${i + 1}`}
                  style={{
                    width: i === active ? '24px' : '6px',
                    height: '6px',
                    borderRadius: '999px',
                    background: i === active ? '#fff' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.3s',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
