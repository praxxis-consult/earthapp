import newsletterBg from '../../assets/images/newsletter-bg.png'

export default function Newsletter() {
  return (
    <section className="w-full h-[679px] relative overflow-hidden">
      {/* Background image */}
      <img
        src={newsletterBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-bottom"
      />

      {/* Content — centered */}
      <div className="absolute inset-0 flex flex-col items-center pt-[64px]">
        {/* Heading */}
        <div className="w-[588px] flex flex-col gap-[8px] text-center mb-[131px]">
          <h2
            className="text-[#101604] text-[48px] tracking-[-0.96px] leading-[64px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
          >
            Stay in the Loop
          </h2>
          <p
            className="text-[#807e7e] text-[16px] leading-[29.25px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
          >
            Receive notifications regarding freshly verified export parcels, port laycans, and harvest yields.
          </p>
        </div>

        {/* Email form */}
        <div className="flex gap-[16px] items-center">
          <div className="bg-[#f7f7f7] rounded-[30px] w-[564px] h-[48px] flex items-center px-[16px]">
            <span
              className="text-[#666] text-[16px] leading-[24px]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
            >
              Enter your email address
            </span>
          </div>
          <button
            className="h-[48px] px-[24px] rounded-[30px] flex items-center justify-center"
            style={{
              backgroundImage: 'linear-gradient(90deg, rgb(0, 124, 83) 0%, rgb(0, 124, 83) 100%)',
            }}
          >
            <span
              className="text-[14px] tracking-[-0.28px] bg-clip-text text-transparent whitespace-nowrap"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
                backgroundImage: 'linear-gradient(178.3deg, rgb(255,255,255) 4.9851%, rgba(255,255,255,0.86) 85.731%)',
              }}
            >
              Subscribe
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
