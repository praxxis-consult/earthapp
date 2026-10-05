import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import scrollDown from '../../assets/icons/scroll-down.svg'
import bg1 from '../../assets/images/hero-bg-3.png'
import bg2 from '../../assets/images/hero-bg-4.png'
import bg3 from '../../assets/images/hero-bg-5.png'
import bg4 from '../../assets/images/hero-bg-7.png'
import bg5 from '../../assets/images/hero-bg-10.png'

const BACKGROUNDS = [bg1, bg2, bg3, bg4, bg5]
const INTERVAL_MS = 5000

export default function Hero() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % BACKGROUNDS.length)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative h-256 w-full overflow-hidden font-jakarta">

      {/* ── Cycling backgrounds (cross-fade) ── */}
      {BACKGROUNDS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }}
        />
      ))}

      {/* ── Gradient overlay ── */}
      <div className="absolute inset-0 bg-linear-to-t from-surface-dark to-transparent to-50%" />

      {/* ── Content ── */}
      <div className="relative mx-auto h-full w-full max-w-page px-30">
        <div className="mx-auto flex h-full w-full max-w-content flex-col justify-end gap-16 pb-20">

          <div className="flex flex-col items-start gap-4">
            <p className="text-[12px] font-medium uppercase tracking-[1.98px] text-foreground-light">
              Global sourcing · Import &amp; export
            </p>
            <h1 className="text-[120px] font-bold leading-30 tracking-[-2px] text-foreground-light-warm">
              From Earth
              <br />
              to market.
            </h1>
          </div>

          <div className="flex flex-col items-start gap-10 border-t border-border-subtle/50 pt-8">
            <div className="flex w-full items-end justify-between">
              <p className="w-147 text-[16px] leading-[29.25px] text-foreground-light">
                Earth sources, buys and moves products and natural resources — agriculture, energy,
                minerals, metals and raw materials from where they are produced to the markets that
                need them.
              </p>
              <div className="flex items-center gap-4">
                <Button variant="accent">Start Trading</Button>
                <Button variant="dark">Explore all Resources</Button>
              </div>
            </div>

            {/* ── Scroll indicator + slide dots ── */}
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={scrollDown} alt="" className="size-6" />
                <p className="text-[12px] uppercase tracking-[1.98px] text-foreground-light/75">
                  Scroll
                </p>
              </div>

              {/* Slide dots */}
              <div className="flex items-center gap-2">
                {BACKGROUNDS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`Background ${i + 1}`}
                    className="transition-all duration-300"
                    style={{
                      width: i === active ? '24px' : '6px',
                      height: '6px',
                      borderRadius: '999px',
                      background: i === active ? '#fff' : 'rgba(255,255,255,0.4)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
