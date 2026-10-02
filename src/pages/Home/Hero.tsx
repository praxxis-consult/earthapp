import Button from '../../components/ui/Button'
import heroBg from '../../assets/images/hero-bg.png'
import scrollDown from '../../assets/icons/scroll-down.svg'

export default function Hero() {
  return (
    <section className="relative h-256 w-full overflow-hidden font-jakarta">
      <img src={heroBg} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-surface-dark to-transparent to-50%" />

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

            <div className="flex items-center gap-3">
              <img src={scrollDown} alt="" className="size-6" />
              <p className="text-[12px] uppercase tracking-[1.98px] text-foreground-light/75">
                Scroll
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
