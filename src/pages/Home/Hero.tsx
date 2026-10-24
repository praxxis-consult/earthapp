import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import scrollIcon from '../../assets/icons/hero-scroll.svg'
import arrowRight from '../../assets/icons/hero-arrow-right.svg'

// Compressed muted renditions of the source .mov files (h264, faststart); each poster is the
// video's own first frame so the first paint matches where playback starts.
const VIDEOS = [
  { src: '/videos/hero-1.mp4', poster: '/videos/hero-1-poster.jpg' },
  { src: '/videos/hero-2.mp4', poster: '/videos/hero-2-poster.jpg' },
  { src: '/videos/hero-3.mp4', poster: '/videos/hero-3-poster.jpg' },
  { src: '/videos/hero-4.mp4', poster: '/videos/hero-4-poster.jpg' },
]
// Poster rotation cadence when the reader prefers reduced motion and the videos stay paused.
const INTERVAL_MS = 5000

// 120/120 on the frame; 72 on tablets and 48 on phones so both lines fit without wrapping.
const headlineClass =
  'text-[#f8f6f1] text-[120px] leading-[120px] tracking-[-2px] w-full max-lg:text-[72px] max-lg:leading-[76px] max-md:text-[48px] max-md:leading-[52px] max-md:tracking-[-1px]'

const jakarta = (weight: number): React.CSSProperties => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

export default function Hero() {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  // Reduced motion: videos stay paused on their posters and the rotation is a timed crossfade.
  useEffect(() => {
    if (!reduceMotion) return
    const id = setInterval(() => setActive((i) => (i + 1) % VIDEOS.length), INTERVAL_MS)
    return () => clearInterval(id)
  }, [reduceMotion])

  // Only the active video plays, from its start; the others hold their frame while faded out.
  useEffect(() => {
    if (reduceMotion) return
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === active) {
        v.currentTime = 0
        v.play().catch(() => {}) // autoplay can be blocked — the poster stays up
      } else {
        v.pause()
      }
    })
  }, [active, reduceMotion])

  const sectionRef = useRef<HTMLElement>(null)
  // "Scroll" takes the reader to what follows the hero, however tall the screen made it.
  const scrollPast = () => sectionRef.current?.nextElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    // The hero fills the first screen on every desktop: the viewport height under the 96px nav
    // (the frame's 1024 is what a 1120-tall screen gives). The content stays anchored 80 above
    // the fold, so the headline, text and buttons are on screen before any scroll on any size;
    // 560 is the floor for a very short window. The dark green behind the videos is what shows
    // until the first poster arrives (700 KB, several seconds on a phone), so the cream copy
    // never sits on white.
    <section ref={sectionRef} className="relative overflow-hidden w-full bg-[#0c2310] h-[calc(100svh-96px)] min-h-[560px] max-lg:h-auto max-lg:min-h-[640px] max-lg:flex max-lg:flex-col max-lg:justify-end">

      {/* ── Cycling background videos — each advances to the next when it ends ── */}
      {VIDEOS.map((v, i) => (
        <video
          key={v.src}
          ref={(el) => { videoRefs.current[i] = el }}
          src={v.src}
          poster={v.poster}
          muted
          playsInline
          preload={i === 0 ? 'auto' : 'metadata'}
          onEnded={() => setActive((n) => (n + 1) % VIDEOS.length)}
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
      {/* The 1200 block sits at 120/80 on the 1440 frame and stays centred on wider screens, in line with the
          sections below; it gets gutters under 1280 and flows on phones and tablets. */}
      <div className="absolute flex flex-col items-start bottom-[80px] left-[max(120px,calc((100%-1200px)/2))] w-[1200px] gap-[64px] max-xl:left-[24px] max-xl:w-[calc(100%-48px)] max-lg:relative max-lg:bottom-auto max-lg:left-auto max-lg:w-full max-lg:gap-[40px] max-lg:px-[24px] max-lg:pt-[200px] max-lg:pb-[48px] max-md:px-[16px] max-md:pt-[160px] max-md:pb-[40px]">
        {/* Eyebrow + headline */}
        <div className="flex flex-col items-start w-full" style={{ gap: '16px' }}>
          <p
            className="text-[#f8f8f8] text-[12px] uppercase w-full"
            style={{ ...jakarta(500), letterSpacing: '1.98px' }}
          >
            Global sourcing · Import &amp; export
          </p>
          <div className="flex flex-col items-start w-full">
            <p className={headlineClass} style={jakarta(700)}>
              From Earth
            </p>
            <p className={headlineClass} style={jakarta(700)}>
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
          <div className="flex items-end justify-between w-full max-lg:flex-col max-lg:items-start max-lg:gap-[24px]">
            <p
              className="text-[#f8f8f8] text-[16px] w-[588px] max-lg:w-full max-lg:max-w-[588px]"
              style={{ ...jakarta(400), lineHeight: '29.25px' }}
            >
              Earth sources, buys and moves products and natural resources — agriculture, energy,
              minerals, metals and raw materials from where they are produced to the markets that
              need them.
            </p>

            <div className="flex items-center max-md:w-full max-md:flex-col max-md:items-stretch" style={{ gap: '16px' }}>
              {/* Start Trading */}
              <button
                onClick={() => navigate('/marketplace')}
                className="flex items-center justify-center max-md:w-full"
                style={{ background: '#aee74a', height: '48px', padding: '16px 24px', borderRadius: '30px', gap: '8px' }}
              >
                <span className="text-[#0c2310] text-[14px] whitespace-nowrap" style={{ ...jakarta(500), letterSpacing: '-0.28px' }}>
                  Start Trading
                </span>
                <img src={arrowRight} alt="" className="size-[24px] shrink-0" />
              </button>

              {/* Explore all Resources */}
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="flex items-center justify-center max-md:w-full"
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
            <button
              type="button"
              onClick={scrollPast}
              aria-label="Scroll to the next section"
              className="flex items-center max-md:hidden"
              style={{ gap: '12px', height: '24px' }}
            >
              {/* The arrow nods down (a 1.6s ease) unless the reader prefers reduced motion */}
              <img src={scrollIcon} alt="" className="size-[24px] shrink-0 motion-safe:animate-[hero-scroll_1.6s_ease-in-out_infinite]" />
              <span
                className="text-[12px] uppercase whitespace-nowrap"
                style={{ ...jakarta(400), letterSpacing: '1.98px', color: 'rgba(248,248,248,0.75)' }}
              >
                Scroll
              </span>
            </button>

            {/* Slide indicator dots */}
            <div className="flex items-center max-md:ml-auto" style={{ gap: '8px' }}>
              {VIDEOS.map((_, i) => (
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
