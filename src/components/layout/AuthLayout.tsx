import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  /** The photo in the right-hand panel (Figma "Frame 13"); one or two layers. */
  images: { src: string; className?: string }[]
}

/**
 * The create-account, authentication and onboarding frames (393:2975, 394:3195, 413:3439 …):
 * a 1440 canvas with the copy column at 120/120 (580 wide) and a 676×976 photo panel inset 24px
 * on the right under a #101604 gradient. The page flows and scrolls, and the panel sticks at
 * 24px and fills the viewport height, so the frame's numbers hold at 1440×1024 and nothing is
 * clipped on a shorter or narrower screen.
 */
export default function AuthLayout({ children, images }: AuthLayoutProps) {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto flex max-w-[1440px] items-start px-[24px] py-[24px] min-h-screen">
        {/* Below lg the photo panel is gone, so the copy column takes the full width with the outer 24px gutters. */}
        <main className="flex-1 min-w-0 pt-[96px] pb-[48px] pl-[clamp(16px,6.67vw,96px)] pr-[40px] max-lg:px-0 max-lg:pt-[32px] max-lg:pb-[24px]">
          <div className="w-full max-w-[580px] max-lg:mx-auto">{children}</div>
        </main>
        <aside
          className="sticky top-[24px] hidden lg:block shrink-0 w-[clamp(320px,46.94vw,676px)] h-[calc(100vh-48px)] rounded-[25px] overflow-hidden bg-[#e3e3e3]"
          aria-hidden="true"
        >
          {images.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt=""
              className={`absolute inset-0 size-full object-cover pointer-events-none ${img.className ?? ''}`}
            />
          ))}
          {/* Frame (403:3415): #101604 at 0 → 50% over the bottom half */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(16,22,4,0) 0%, rgba(16,22,4,0.5) 100%)' }}
          />
        </aside>
      </div>
    </div>
  )
}
