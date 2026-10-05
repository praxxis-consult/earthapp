import { useEffect } from 'react'
import badgeCheck from '../../assets/icons/po-badge-check.svg'
import fileText from '../../assets/icons/po-file-text.svg'
import supplierImg from '../../assets/images/po-supplier.jpeg'

const jakarta = (weight: number) => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

const SPECS = [
  { label: 'Variety',      value: 'Nacional / CCN-51' },
  { label: 'Fermentation', value: '6 days · 78%' },
  { label: 'Moisture',     value: '6.8%' },
  { label: 'Bean count',   value: '92 beans / 100 g' },
  { label: 'Packaging',    value: '65 kg jute sacks' },
  { label: 'Harvest',      value: 'May–June 2026' },
  { label: 'Incoterm',     value: 'FOB Guayaquil' },
]

interface PlaceOrderModalProps {
  onClose: () => void
}

export default function PlaceOrderModal({ onClose }: PlaceOrderModalProps) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      {/* Card — stop propagation so clicks inside don't close */}
      <div
        className="bg-white flex gap-[48px] items-start p-[32px] rounded-[30px] w-[1200px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Left: Product narrative ── */}
        <div className="flex flex-1 flex-col gap-[24px] items-start min-w-0">

          {/* Tabs */}
          <div className="border-b border-[#e4dede] flex gap-[28px] items-start w-full">
            <div className="border-b-2 border-[#007c53] flex flex-col items-start pb-[14px] shrink-0">
              <span className="text-[#0c2310] text-[14px]" style={jakarta(600)}>
                Product details
              </span>
            </div>
            <span className="text-[#807e7e] text-[14px] pb-[14px]" style={jakarta(400)}>
              Shipping &amp; terms
            </span>
            <span className="text-[#807e7e] text-[14px] pb-[14px]" style={jakarta(400)}>
              Documents
            </span>
          </div>

          {/* Story */}
          <div className="flex flex-col gap-[14px] w-full">
            <p className="text-[#0c2310] text-[32px] tracking-[-0.64px] leading-normal w-full" style={jakarta(700)}>
              Clean flavor, fully traceable origin
            </p>
            <p className="text-[#807e7e] text-[16px] leading-[1.7] w-full" style={jakarta(400)}>
              These Nacional and CCN-51 cocoa beans are grown by 86 family farms along Ecuador's lower
              Guayas River. Pods are hand-harvested at peak ripeness, box-fermented for six days, then
              sun-dried on raised beds to preserve their rounded cocoa profile.
            </p>
            <p className="text-[#807e7e] text-[16px] leading-[1.7] w-full" style={jakarta(400)}>
              The current lot offers balanced notes of toasted nut, dried fig, and a gentle citrus
              finish—well suited to couverture, baking chocolate, and premium cocoa products.
            </p>
          </div>

          {/* Supplier preview */}
          <div className="bg-[#f7f7f7] flex gap-[16px] items-center p-[18px] rounded-[16px] w-full">
            <div className="relative rounded-[16px] shrink-0 size-[64px] overflow-hidden">
              <img
                src={supplierImg}
                alt="Guayas Cacao Cooperative"
                className="absolute inset-0 w-full h-full object-cover rounded-[16px]"
              />
            </div>
            <div className="flex flex-1 flex-col gap-[5px] items-start min-w-0">
              <div className="flex gap-[7px] items-center">
                <span className="text-[#0c2310] text-[16px]" style={jakarta(600)}>
                  Guayas Cacao Cooperative
                </span>
                <img src={badgeCheck} alt="" className="size-[16px] shrink-0" />
              </div>
              <span className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
                Verified supplier · Member since 2022 · 37 completed trades
              </span>
            </div>
            <span className="text-[#007c53] text-[12px] whitespace-nowrap shrink-0" style={jakarta(500)}>
              Replies in ~2 hours
            </span>
          </div>
        </div>

        {/* ── Right: Lot specification ── */}
        <div className="flex flex-col gap-[6px] items-start shrink-0 w-[430px]">
          <p className="text-[#0c2310] text-[20px] whitespace-nowrap" style={jakarta(600)}>
            Lot specification
          </p>
          {SPECS.map(({ label, value }) => (
            <div
              key={label}
              className="border-b border-[#e4dede] flex items-start justify-between py-[13px] text-[14px] w-full"
            >
              <span className="text-[#807e7e] whitespace-nowrap" style={jakarta(400)}>
                {label}
              </span>
              <span className="text-[#0c2310] text-right w-[210px]" style={jakarta(600)}>
                {value}
              </span>
            </div>
          ))}

          {/* Certificate link */}
          <div className="flex gap-[8px] items-center pt-[16px]">
            <img src={fileText} alt="" className="size-[18px] shrink-0" />
            <span className="text-[#007c53] text-[14px]" style={jakarta(600)}>
              View SGS quality certificate
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
