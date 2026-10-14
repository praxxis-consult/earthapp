import { useEffect, useState } from 'react'
import badgeCheck from '../../assets/icons/po-badge-check.svg'
import fileText from '../../assets/icons/po-file-text.svg'
import shieldIcon from '../../assets/icons/po-shield.svg'
import packageCheck from '../../assets/icons/po-package-check.svg'
import shipIcon from '../../assets/icons/po-ship.svg'
import fileCheck from '../../assets/icons/po-file-check.svg'
import packageIcon from '../../assets/icons/po-package.svg'
import supplierImg from '../../assets/images/po-supplier.jpeg'

const jakarta = (weight: number) => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

// ── Tab: Product details ─────────────────────────────────────────────────────

const SPECS = [
  { label: 'Variety',      value: 'Nacional / CCN-51' },
  { label: 'Fermentation', value: '6 days · 78%' },
  { label: 'Moisture',     value: '6.8%' },
  { label: 'Bean count',   value: '92 beans / 100 g' },
  { label: 'Packaging',    value: '65 kg jute sacks' },
  { label: 'Harvest',      value: 'May–June 2026' },
  { label: 'Incoterm',     value: 'FOB Guayaquil' },
]

function ProductDetailsTab() {
  return (
    <>
      {/* Left: narrative */}
      <div className="flex flex-1 flex-col gap-[24px] items-start min-w-0">
        <div className="flex flex-col gap-[14px] w-full">
          <p className="text-[#0c2310] text-[32px] tracking-[-0.64px] leading-normal w-full max-md:text-[24px]" style={jakarta(700)}>
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
        <div className="bg-[#f7f7f7] flex gap-[16px] items-center p-[18px] rounded-[16px] w-full max-md:flex-col max-md:items-start max-md:gap-[12px]">
          <div className="relative rounded-[16px] shrink-0 size-[64px] overflow-hidden">
            <img src={supplierImg} alt="Guayas Cacao Cooperative" className="absolute inset-0 w-full h-full object-cover rounded-[16px]" />
          </div>
          <div className="flex flex-1 flex-col gap-[5px] items-start min-w-0 max-md:w-full">
            <div className="flex gap-[7px] items-center max-md:flex-wrap">
              <span className="text-[#0c2310] text-[16px]" style={jakarta(600)}>Guayas Cacao Cooperative</span>
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

      {/* Right: Lot specification */}
      <div className="flex flex-col gap-[6px] items-start shrink-0 w-[430px] max-lg:w-full">
        <p className="text-[#0c2310] text-[20px] whitespace-nowrap" style={jakarta(600)}>Lot specification</p>
        {SPECS.map(({ label, value }) => (
          <div key={label} className="border-b border-[#e4dede] flex items-start justify-between py-[13px] text-[14px] w-full">
            <span className="text-[#807e7e] whitespace-nowrap" style={jakarta(400)}>{label}</span>
            <span className="text-[#0c2310] text-right w-[210px] max-md:w-auto max-md:flex-1 max-md:pl-[16px]" style={jakarta(600)}>{value}</span>
          </div>
        ))}
        <div className="flex gap-[8px] items-center pt-[16px]">
          <img src={fileText} alt="" className="size-[18px] shrink-0" />
          <span className="text-[#007c53] text-[14px]" style={jakarta(600)}>View SGS quality certificate</span>
        </div>
      </div>
    </>
  )
}

// ── Tab: Shipping & terms ────────────────────────────────────────────────────

const DELIVERY_STEPS = [
  {
    icon: packageCheck,
    duration: '3–5 DAYS',
    title: 'Prepare & inspect',
    body: 'Lot allocated, bag marks confirmed, and SGS pre-shipment inspection booked.',
  },
  {
    icon: shipIcon,
    duration: '7–10 DAYS',
    title: 'Export handover',
    body: 'Cargo cleared and delivered on board at the Port of Guayaquil.',
  },
  {
    icon: fileCheck,
    duration: 'AFTER SAILING',
    title: 'Documents released',
    body: 'Final invoice, bill of lading, origin, phytosanitary, and quality files issued.',
  },
]

const SHIPPING_TERMS = [
  { label: 'Incoterm',         value: 'FOB Guayaquil · Incoterms® 2020' },
  { label: 'Dispatch window',  value: '10–15 business days' },
  { label: 'Port of loading',  value: 'Guayaquil, Ecuador' },
  { label: 'Packaging',        value: '65 kg export-grade jute sacks' },
  { label: 'Container plan',   value: '20 ft dry · approx. 19.5 t' },
  { label: 'Payment',          value: '20% deposit · 80% against docs' },
  { label: 'Offer validity',   value: '5 business days' },
  { label: 'Title & risk',     value: 'Passes when goods are on board' },
]

function ShippingTab() {
  return (
    <>
      {/* Left: shipping narrative */}
      <div className="flex flex-1 flex-col gap-[24px] items-start min-w-0">
        <div className="flex flex-col gap-[12px] w-full">
          <p className="text-[#0c2310] text-[32px] tracking-[-0.64px] leading-normal w-full max-md:text-[24px]" style={jakarta(700)}>
            From Guayas to your nominated port
          </p>
          <p className="text-[#807e7e] text-[16px] leading-[1.7] w-full" style={jakarta(400)}>
            The cooperative prepares, inspects, and clears this lot for export under FOB Guayaquil
            terms. After order confirmation, your trade coordinator aligns the sailing, documents,
            and handover with your nominated freight forwarder.
          </p>
        </div>

        {/* Delivery journey steps */}
        <div className="flex gap-[10px] items-start w-full max-md:flex-col">
          {DELIVERY_STEPS.map(({ icon, duration, title, body }) => (
            <div
              key={title}
              className="bg-[#f7f7f7] flex flex-1 flex-col gap-[12px] items-start min-h-[154px] p-[16px] rounded-[16px]"
            >
              <div className="flex items-center justify-between w-full">
                <div className="bg-[#f2f9f7] flex items-center justify-center rounded-[12px] size-[36px]">
                  <img src={icon} alt="" className="size-[18px]" />
                </div>
                <span className="text-[#007c53] text-[10px] tracking-[0.8px]" style={jakarta(600)}>
                  {duration}
                </span>
              </div>
              <div className="flex flex-col gap-[5px] w-full">
                <p className="text-[#0c2310] text-[15px] w-full" style={jakarta(600)}>{title}</p>
                <p className="text-[#807e7e] text-[12px] leading-[1.55] w-full" style={jakarta(400)}>{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Claims notice */}
        <div className="bg-[#f2f9f7] flex gap-[14px] items-start p-[18px] rounded-[16px] w-full">
          <div className="bg-white flex items-center justify-center rounded-[12px] shrink-0 size-[42px]">
            <img src={shieldIcon} alt="" className="size-[21px]" />
          </div>
          <div className="flex flex-1 flex-col gap-[5px] min-w-0">
            <p className="text-[#0c2310] text-[14px] w-full" style={jakarta(600)}>
              Claims are handled against the agreed specification
            </p>
            <p className="text-[#34473a] text-[12px] leading-[1.6] w-full" style={jakarta(400)}>
              Notify Earth within 5 business days of delivery with seal records, photos, and an
              independent survey. Commodity lots are not returnable for change of mind.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Delivery & purchase terms */}
      <div className="flex flex-col gap-[6px] items-start shrink-0 w-[430px] max-lg:w-full">
        <p className="text-[#0c2310] text-[20px]" style={jakarta(600)}>Delivery &amp; purchase terms</p>
        {SHIPPING_TERMS.map(({ label, value }) => (
          <div key={label} className="border-b border-[#e4dede] flex items-start justify-between py-[13px] text-[14px] w-full">
            <span className="text-[#807e7e] whitespace-nowrap" style={jakarta(400)}>{label}</span>
            <span className="text-[#0c2310] text-right w-[220px] max-md:w-auto max-md:flex-1 max-md:pl-[16px]" style={jakarta(600)}>{value}</span>
          </div>
        ))}
        {/* Packaging note */}
        <div className="flex flex-col gap-[8px] items-start pt-[16px] w-full">
          <div className="flex gap-[8px] items-center">
            <img src={packageIcon} alt="" className="size-[18px] shrink-0" />
            <span className="text-[#007c53] text-[14px]" style={jakarta(600)}>Food-safe export packaging</span>
          </div>
          <p className="text-[#807e7e] text-[12px] leading-[1.6]" style={jakarta(400)}>
            New jute sacks with hermetic liners, lot code, net weight, and cooperative mark.
            Palletization and custom marks available at cost.
          </p>
        </div>
      </div>
    </>
  )
}

// ── Modal shell ──────────────────────────────────────────────────────────────

const TABS = ['Product details', 'Shipping & terms', 'Documents'] as const
type Tab = typeof TABS[number]

interface PlaceOrderModalProps {
  onClose: () => void
}

export default function PlaceOrderModal({ onClose }: PlaceOrderModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Product details')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-[16px]"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white flex flex-col p-[32px] rounded-[30px] w-[1200px] max-w-full max-h-[90vh] overflow-y-auto max-md:p-[20px] max-md:rounded-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Tab bar (full width, above both columns) ── */}
        <div className="border-b border-[#e4dede] flex gap-[28px] items-start w-full shrink-0 mb-[24px] max-md:gap-[16px] max-md:overflow-x-auto max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-[14px] text-[14px] shrink-0 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-[#007c53] text-[#0c2310]'
                  : 'text-[#807e7e]'
              }`}
              style={activeTab === tab ? jakarta(600) : jakarta(400)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab content (two-column layout) ── */}
        <div className="flex gap-[48px] items-start w-full max-lg:flex-col max-lg:gap-[32px]">
          {activeTab === 'Product details' && <ProductDetailsTab />}
          {activeTab === 'Shipping & terms' && <ShippingTab />}
          {activeTab === 'Documents' && (
            <div className="flex flex-1 items-center justify-center py-[64px]">
              <p className="text-[#807e7e] text-[16px]" style={jakarta(400)}>Documents coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
