import { useEffect, useState } from 'react'
import CheckoutDialog from './CheckoutDialog'
import badgeCheck from '../../assets/icons/po-badge-check.svg'
import shieldIcon from '../../assets/icons/po-shield.svg'
import packageCheck from '../../assets/icons/po-package-check.svg'
import shipIcon from '../../assets/icons/po-ship.svg'
import fileCheck from '../../assets/icons/po-file-check.svg'
import packageIcon from '../../assets/icons/po-package.svg'
import arrowRight from '../../assets/icons/po-arrow-right.svg'
import type { Listing } from '../../lib/catalog'
import { naira } from '../../lib/productView'
import { initials } from '../../data/orders'
import { jakarta } from '../../utils/styles'

const TABS = ['Product details', 'Shipping & terms', 'Documents'] as const
type Tab = (typeof TABS)[number]

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`
const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#e4dede] flex items-start justify-between py-[13px] text-[14px] w-full">
      <span className="text-[#807e7e] whitespace-nowrap" style={jakarta(400)}>{label}</span>
      <span className="text-[#0c2310] text-right w-[220px] max-md:w-auto max-md:flex-1 max-md:pl-[16px]" style={jakarta(600)}>{value}</span>
    </div>
  )
}

/** Left: the listing's own description and its seller; right: what the seller entered about the lot. */
function ProductDetailsTab({ listing: p }: { listing: Listing }) {
  const s = p.store
  return (
    <>
      <div className="flex flex-1 flex-col gap-[24px] items-start min-w-0">
        <div className="flex flex-col gap-[14px] w-full">
          <p className="text-[#0c2310] text-[32px] tracking-[-0.64px] leading-normal w-full max-md:text-[24px]" style={jakarta(700)}>
            {p.title}
          </p>
          <p className="text-[#807e7e] text-[16px] leading-[1.7] w-full whitespace-pre-line" style={jakarta(400)}>
            {p.description}
          </p>
        </div>
        {/* The seller, as the marketplace knows them: name, where, and since when. */}
        <div className="bg-[#f7f7f7] flex gap-[16px] items-center p-[18px] rounded-[16px] w-full max-md:flex-col max-md:items-start max-md:gap-[12px]">
          <span className="flex items-center justify-center rounded-[16px] shrink-0 size-[64px] bg-[#f2f8f6] text-[#007c53] text-[20px]" style={jakarta(700)}>
            {initials(s.storeName)}
          </span>
          <div className="flex flex-1 flex-col gap-[5px] items-start min-w-0 max-md:w-full">
            <div className="flex gap-[7px] items-center max-md:flex-wrap">
              <span className="text-[#0c2310] text-[16px]" style={jakarta(600)}>{s.storeName}</span>
              <img src={badgeCheck} alt="" className="size-[16px] shrink-0" />
            </div>
            <span className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
              Seller on Earth · {s.businessAddress.area}, {s.businessAddress.region} · Member since {monthYear(s.liveAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[6px] items-start shrink-0 w-[430px] max-lg:w-full">
        <p className="text-[#0c2310] text-[20px] whitespace-nowrap" style={jakarta(600)}>Listing details</p>
        <Row label="Category" value={p.category} />
        <Row label="Sold as" value={p.unit} />
        <Row label="Price" value={`${p.price} per ${p.unit}`} />
        <Row label="Available" value={plural(p.available, p.unit)} />
        <Row label="Minimum order" value={plural(p.moq, p.unit)} />
        <Row label="Origin" value={p.location} />
        <Row label="Listed" value={p.listed} />
      </div>
    </>
  )
}

/** How an order moves on Earth: the seller packs, a carrier the buyer picks collects, the buyer confirms. */
function ShippingTab({ listing: p }: { listing: Listing }) {
  const steps = [
    { icon: packageCheck, title: 'Seller prepares', body: `${p.store.storeName} accepts the order and packs it for pickup in ${p.store.businessAddress.area}.` },
    { icon: shipIcon, title: 'Carrier collects', body: 'The carrier you choose at checkout collects from the seller and delivers to your address.' },
    { icon: fileCheck, title: 'You confirm', body: 'You confirm the delivery on Earth, which closes the order.' },
  ]
  return (
    <>
      <div className="flex flex-1 flex-col gap-[24px] items-start min-w-0">
        <div className="flex flex-col gap-[12px] w-full">
          <p className="text-[#0c2310] text-[32px] tracking-[-0.64px] leading-normal w-full max-md:text-[24px]" style={jakarta(700)}>
            From {p.store.businessAddress.area} to your door
          </p>
          <p className="text-[#807e7e] text-[16px] leading-[1.7] w-full" style={jakarta(400)}>
            Earth is the marketplace: the seller prepares the goods and a carrier from Earth's delivery partners brings them to you. At checkout you give the delivery address and the carriers quote the trip; you pay only after choosing one.
          </p>
        </div>
        <div className="flex gap-[10px] items-start w-full max-md:flex-col">
          {steps.map(({ icon, title, body }) => (
            <div key={title} className="bg-[#f7f7f7] flex flex-1 flex-col gap-[12px] items-start min-h-[154px] p-[16px] rounded-[16px]">
              <div className="bg-[#f2f9f7] flex items-center justify-center rounded-[12px] size-[36px]">
                <img src={icon} alt="" className="size-[18px]" />
              </div>
              <div className="flex flex-col gap-[5px] w-full">
                <p className="text-[#0c2310] text-[15px] w-full" style={jakarta(600)}>{title}</p>
                <p className="text-[#807e7e] text-[12px] leading-[1.55] w-full" style={jakarta(400)}>{body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#f2f9f7] flex gap-[14px] items-start p-[18px] rounded-[16px] w-full">
          <div className="bg-white flex items-center justify-center rounded-[12px] shrink-0 size-[42px]">
            <img src={shieldIcon} alt="" className="size-[21px]" />
          </div>
          <div className="flex flex-1 flex-col gap-[5px] min-w-0">
            <p className="text-[#0c2310] text-[14px] w-full" style={jakarta(600)}>If something is wrong with the delivery</p>
            <p className="text-[#34473a] text-[12px] leading-[1.6] w-full" style={jakarta(400)}>
              Open a claim on the order with photos of what arrived. You can cancel for a full refund any time before the seller accepts the order.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[6px] items-start shrink-0 w-[430px] max-lg:w-full">
        <p className="text-[#0c2310] text-[20px]" style={jakarta(600)}>Delivery &amp; purchase terms</p>
        <Row label="Pickup from" value={`${p.store.businessAddress.area}, ${p.store.businessAddress.region}`} />
        <Row label="Delivery" value="Carrier quotes at checkout" />
        <Row label="Delivers within" value="Nigeria" />
        <Row label="Payment" value="Card or transfer, after you choose a carrier" />
        <Row label="Cancellation" value="Free until the seller accepts" />
        <Row label="Minimum order" value={plural(p.moq, p.unit)} />
        <div className="flex flex-col gap-[8px] items-start pt-[16px] w-full">
          <div className="flex gap-[8px] items-center">
            <img src={packageIcon} alt="" className="size-[18px] shrink-0" />
            <span className="text-[#007c53] text-[14px]" style={jakarta(600)}>Packed by the seller</span>
          </div>
          <p className="text-[#807e7e] text-[12px] leading-[1.6]" style={jakarta(400)}>
            Sold by the {p.unit}; the seller labels each package with the order number before the carrier collects.
          </p>
        </div>
      </div>
    </>
  )
}

interface PlaceOrderModalProps {
  listing: Listing
  quantity: number
  onClose: () => void
}

/**
 * The order review (1200 wide, three tabs) that "Place order" opens: the listing's details, how
 * delivery works, documents (none on the API yet), and the summary with "Continue to delivery",
 * which goes on to the delivery address and the carrier quotes (CheckoutDialog).
 */
export default function PlaceOrderModal({ listing, quantity, onClose }: PlaceOrderModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Product details')
  const [checkout, setCheckout] = useState(false)
  const total = naira(quantity * listing.priceNum).replace(/\.00$/, '')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (checkout) return <CheckoutDialog listing={listing} quantity={quantity} onClose={onClose} />

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Order ${listing.title}`}
        className="bg-white flex flex-col p-[32px] rounded-[30px] w-[1200px] max-w-full max-h-[90vh] overflow-y-auto max-md:p-[20px] max-md:rounded-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#e4dede] flex gap-[28px] items-start w-full shrink-0 mb-[24px] max-md:gap-[16px] max-md:overflow-x-auto max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-[14px] text-[14px] shrink-0 whitespace-nowrap transition-colors ${activeTab === tab ? 'border-b-2 border-[#007c53] text-[#0c2310]' : 'text-[#807e7e]'}`}
              style={activeTab === tab ? jakarta(600) : jakarta(400)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-[48px] items-start w-full max-lg:flex-col max-lg:gap-[32px]">
          {activeTab === 'Product details' && <ProductDetailsTab listing={listing} />}
          {activeTab === 'Shipping & terms' && <ShippingTab listing={listing} />}
          {activeTab === 'Documents' && (
            <div className="flex flex-1 items-center justify-center py-[64px]">
              {/* Nothing on the API holds a listing's documents yet. */}
              <p className="text-[#807e7e] text-[16px]" style={jakarta(400)}>This seller has not attached any documents to the listing.</p>
            </div>
          )}
        </div>

        {/* Summary + the step on: what is being ordered, and where it should go */}
        <div className="mt-[32px] flex items-center justify-between gap-[16px] border-t border-[#e4dede] pt-[24px] max-md:flex-col max-md:items-stretch">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[#807e7e] text-[12px]" style={jakarta(400)}>Your order</span>
            <span className="text-[#0c2310] text-[16px]" style={jakarta(600)}>
              {plural(quantity, listing.unit)} of {listing.title} · {total}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCheckout(true)}
            className="bg-[#008f63] flex gap-[8px] h-[52px] items-center justify-center px-[24px] rounded-[999px] max-md:w-full"
          >
            <span className="text-white text-[14px]" style={jakarta(600)}>Continue to delivery</span>
            <img src={arrowRight} alt="" className="size-[18px] shrink-0" />
          </button>
        </div>
      </div>
    </div>
  )
}
