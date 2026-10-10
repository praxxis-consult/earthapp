import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import scrollIcon from '../../assets/icons/hero-scroll.svg'
import arrowRight from '../../assets/icons/hero-arrow-right.svg'
// Poster frames used as video fallback backgrounds
import poster1 from '../../assets/images/hero-poster-1.png'
import poster2 from '../../assets/images/hero-poster-2.png'

// ─── Video sources ───────────────────────────────────────────────────────────
// Place the actual .mp4 files in public/videos/ and update these paths.
// Until the files are available the poster image is shown as a static fallback.
const VIDEO_SRCS: string[] = [
  // '/videos/hero-vid1.mp4',
  // '/videos/hero-vid2.mp4',
  // '/videos/hero-vid3.mp4',
  // '/videos/hero-vid4.mp4',
  // '/videos/hero-vid5.mp4',
]

const POSTER = poster1

const jakarta = (weight: number) => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

export default function Hero() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Ensure video plays on mount (needed on some browsers)
  useEffect(() => {
    videoRef.current?.play().catch(() => {})
  }, [])

  const hasVideo = VIDEO_SRCS.length > 0

  return (
    <section
      className="relative overflow-hidden w-full"
      style={{ height: '1024px' }}
    >
      {/* ── Background: video (when available) or poster fallback ── */}
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={POSTER}
          className="absolute inset-0 w-full h-full object-cover"
        >
          {VIDEO_SRCS.map((src) => (
            <source key={src} src={src} type="video/mp4" />
          ))}
        </video>
      ) : (
        /* Static poster fallback — swap poster2 for alternate look */
        <img
          src={poster2}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* ── Gradient overlay: bottom #101604 → top transparent ── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, #101604 0%, rgba(16,22,4,0) 50%)',
        }}
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

        {/* Border rule + bottom row */}
        <div
          className="flex flex-col items-start justify-end w-full"
          style={{
            gap: '40px',
            borderTop: '1px solid rgba(156,156,156,0.5)',
            paddingTop: '32px',
          }}
        >
          {/* Body + buttons */}
          <div className="flex items-end justify-between w-full">
            <p
              className="text-[#f8f8f8] text-[16px]"
              style={{ ...jakarta(400), lineHeight: '29.25px', width: '588px' }}
            >
              Earth sources, buys and moves products and natural resources — agriculture, energy,
              minerals, metals and raw materials from where they are produced to the markets that
              need them.
            </p>

            {/* CTAs */}
            <div className="flex items-center" style={{ gap: '16px' }}>
              {/* Start Trading */}
              <button
                onClick={() => navigate('/marketplace')}
                className="flex items-center justify-center"
                style={{
                  background: '#aee74a',
                  height: '48px',
                  padding: '16px 24px',
                  borderRadius: '30px',
                  gap: '8px',
                }}
              >
                <span
                  className="text-[#0c2310] text-[14px] whitespace-nowrap"
                  style={{ ...jakarta(500), letterSpacing: '-0.28px' }}
                >
                  Start Trading
                </span>
                <img src={arrowRight} alt="" className="size-[24px] shrink-0" />
              </button>

              {/* Explore all Resources */}
              <button
                className="flex items-center justify-center"
                style={{
                  background: '#404438',
                  height: '48px',
                  padding: '16px 28px',
                  borderRadius: '30px',
                }}
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

          {/* Scroll indicator */}
          <div className="flex items-center" style={{ gap: '12px', height: '24px' }}>
            <img src={scrollIcon} alt="" className="size-[24px] shrink-0" />
            <span
              className="text-[12px] uppercase whitespace-nowrap"
              style={{
                ...jakarta(400),
                letterSpacing: '1.98px',
                color: 'rgba(248,248,248,0.75)',
              }}
            >
              Scroll
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
