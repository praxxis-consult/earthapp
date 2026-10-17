import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useGetListingQuery } from '../../feature/marketplace/catalogApiSlice'
import { useAuth } from '../../feature/authentication/useAuth'
import { naira } from '../../lib/productView'
import PlaceOrderModal from '../../components/ui/PlaceOrderModal'
import SignInDialogs from '../../components/ui/SignInDialogs'
import arrowLeft from '../../assets/icons/po-arrow-left.svg'
import arrowRight from '../../assets/icons/po-arrow-right.svg'
import shieldIcon from '../../assets/icons/po-shield.svg'
import lockIcon from '../../assets/icons/po-lock.svg'
import badgeCheck from '../../assets/icons/po-badge-check.svg'
import cameraIcon from '../../assets/icons/po-camera.svg'
import starIcon from '../../assets/icons/po-star.svg'
import trendIcon from '../../assets/icons/po-trend.svg'

const jakarta = (weight: number) => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

const STEP = 1

export default function PlaceOrder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { account } = useAuth()
  // undefined while loading, null when the API has no such public listing
  const product = useGetListingQuery(id ?? '', { skip: !id }).currentData
  const [activeThumb, setActiveThumb] = useState(0)
  const [wantsOrder, setWantsOrder] = useState(false)
  // Ordering needs an account: a visitor signs in first and the checkout opens once they are back.
  const signInOpen = wantsOrder && !account
  const modalOpen = wantsOrder && Boolean(account)
  // The quantity starts at the listing's minimum order once it loads.
  const [qtyState, setQtyState] = useState<{ id: string; qty: number } | null>(null)
  const qty = qtyState && qtyState.id === id ? qtyState.qty : (product?.moq ?? 1)
  const setQty = (update: (q: number) => number) => setQtyState({ id: id ?? '', qty: update(qty) })


  if (!product) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-[#807e7e] text-[16px]" style={jakarta(400)}>
          {product === undefined ? 'Loading…' : 'This listing is not available.'}
        </p>
      </div>
    )
  }

  const MIN_QTY = product.moq
  const THUMBNAILS = product.images
  const unit = product.unit
  const units = (n: number) => `${n} ${unit}${n === 1 ? '' : 's'}`
  const estimatedValue = naira(qty * product.priceNum).replace(/\.00$/, '')
  const mainImage = THUMBNAILS[activeThumb] ?? product.image ?? ''
  const inStock = product.available > 0

  return (
    <div className="bg-white w-full pb-[72px]">
      <div className="max-w-[1200px] mx-auto pt-[32px] max-xl:px-[24px] max-md:px-[16px]">

        {/* ── Breadcrumb ── */}
        <div className="flex gap-[10px] items-center mb-[28px] min-w-0">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center size-[18px] shrink-0">
            <img src={arrowLeft} alt="" className="size-[18px]" />
          </button>
          <button
            onClick={() => navigate('/marketplace')}
            className="text-[#807e7e] text-[14px] whitespace-nowrap"
            style={jakarta(400)}
          >
            Marketplace
          </button>
          <span className="text-[#807e7e] text-[14px]" style={jakarta(400)}>/</span>
          <span className="text-[#0c2310] text-[14px] whitespace-nowrap truncate min-w-0" style={jakarta(500)}>
            {product.title}
          </span>
        </div>

        {/* ── Product purchase layout ── */}
        <div className="flex gap-[48px] items-start max-lg:flex-col max-lg:gap-[24px]">

          {/* ── Left: Product gallery (652px) ── */}
          <div className="flex flex-col gap-[20px] items-start shrink-0 w-[652px] max-xl:w-auto max-xl:flex-1 max-xl:min-w-0 max-lg:w-full max-lg:flex-none">

            {/* Media row: thumbnails + main image */}
            <div className="flex gap-[16px] h-[548px] items-start w-full max-lg:h-auto max-md:flex-col-reverse">

              {/* Thumbnails column */}
              <div className="flex flex-col gap-[14px] shrink-0 w-[96px] max-md:w-full max-md:flex-row max-md:gap-[12px] max-md:overflow-x-auto max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
                {THUMBNAILS.slice(0, 4).map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    className={`relative rounded-[16px] shrink-0 size-[96px] overflow-hidden ${
                      activeThumb === i
                        ? 'border-2 border-[#008f63]'
                        : 'border border-[#e4dede]'
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover rounded-[16px]"
                    />
                  </button>
                ))}
              </div>

              {/* Main image */}
              <div className="relative h-[548px] rounded-[30px] overflow-hidden shrink-0 w-[540px] max-xl:w-auto max-xl:flex-1 max-xl:min-w-0 max-md:flex-none max-md:w-full max-md:h-auto max-md:aspect-[4/3] max-md:rounded-[20px]">
                {/* Origin verified badge */}
                <div className="absolute bg-white flex gap-[7px] items-center left-[20px] px-[14px] py-[8px] rounded-[999px] top-[20px] z-10">
                  <img src={badgeCheck} alt="" className="size-[16px] shrink-0" />
                  <span className="text-[#0c2310] text-[12px]" style={jakarta(600)}>
                    Origin verified
                  </span>
                </div>
                <img
                  src={mainImage}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Gallery note bar */}
            <div className="bg-[#f2f9f7] flex items-center justify-between px-[20px] py-[16px] rounded-[16px] w-full max-md:flex-col max-md:items-start max-md:gap-[8px]">
              <div className="flex gap-[10px] items-center">
                <img src={cameraIcon} alt="" className="size-[20px] shrink-0" />
                <span className="text-[#34473a] text-[14px]" style={jakarta(400)}>
                  Photos from {product.store.storeName} · listed {product.listed}
                </span>
              </div>
              <span className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
                {Math.min(activeThumb + 1, Math.max(THUMBNAILS.length, 1))} / {Math.max(THUMBNAILS.length, 1)}
              </span>
            </div>
          </div>

          {/* ── Right: Order panel (500px) ── */}
          <div
            className="bg-white border border-[#e4dede] flex flex-col gap-[22px] items-start p-[28px] rounded-[30px] shrink-0 w-[500px] max-xl:w-auto max-xl:flex-1 max-xl:min-w-0 max-lg:w-full max-lg:flex-none max-md:p-[20px]"
          >
            {/* Product badges + rating */}
            <div className="flex items-center justify-between w-full max-md:flex-wrap max-md:gap-[8px]">
              <div className="flex gap-[8px] items-center">
                <div className="bg-[#f2f9f7] flex items-center px-[14px] py-[7px] rounded-[999px]">
                  <span className="text-[#007c53] text-[12px]" style={jakarta(500)}>
                    {product.category}
                  </span>
                </div>
                <div className="bg-[#f7f7f7] flex items-center px-[14px] py-[7px] rounded-[999px]">
                  <span className="text-[#34473a] text-[12px]" style={jakarta(500)}>
                    {inStock ? 'In stock' : 'Out of stock'}
                  </span>
                </div>
              </div>
              <div className="flex gap-[6px] items-center">
                <img src={starIcon} alt="" className="size-[16px] shrink-0" />
                <span className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
                  No reviews yet
                </span>
              </div>
            </div>

            {/* Product title + description */}
            <div className="flex flex-col gap-[10px] w-full">
              <p
                className="text-[#0c2310] text-[40px] tracking-[-1.2px] leading-[1.15] w-full max-md:text-[28px] max-md:tracking-[-0.84px]"
                style={jakarta(700)}
              >
                {product.title}
              </p>
              <p className="text-[#807e7e] text-[16px] leading-[1.7] w-full" style={jakarta(400)}>
                {product.description}
              </p>
            </div>

            {/* Price summary */}
            <div className="flex items-end justify-between w-full max-sm:flex-wrap max-sm:gap-[8px]">
              <div className="flex flex-col gap-[4px]">
                <span className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
                  Current unit price
                </span>
                <p className="text-[14px]" style={jakarta(700)}>
                  <span className="text-[#007c53] text-[32px] tracking-[-0.64px]" style={jakarta(700)}>
                    {product.price}{' '}
                  </span>
                  <span className="text-[#807e7e] text-[14px]" style={jakarta(500)}>
                    / {unit}
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-[3px] items-end">
                <img src={trendIcon} alt="" className="h-[30px] w-[94px]" />
                <span className="text-[#007c53] text-[12px]" style={jakarta(600)}>
                  Listed {product.listed}
                </span>
              </div>
            </div>

            {/* Key facts */}
            <div className="border-[#e4dede] border-b border-t flex gap-[18px] items-start py-[18px] w-full">
              {[
                { label: 'Origin', value: product.location },
                { label: 'Available', value: product.quantity },
                { label: 'Minimum', value: units(MIN_QTY) },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-[4px] flex-1 min-w-0">
                  <span className="text-[#807e7e] text-[12px] whitespace-nowrap" style={jakarta(400)}>
                    {label}
                  </span>
                  <span className="text-[#0c2310] text-[14px]" style={jakarta(600)}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Order quantity */}
            <div className="flex flex-col gap-[10px] w-full">
              <div className="flex items-start justify-between w-full">
                <span className="text-[#0c2310] text-[14px]" style={jakarta(600)}>
                  Order quantity
                </span>
                <span className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
                  Minimum {units(MIN_QTY)}
                </span>
              </div>
              <div className="bg-[#f7f7f7] border border-[#e4dede] flex h-[52px] items-center justify-between px-[18px] rounded-[999px] w-full">
                <button
                  onClick={() => setQty((q) => Math.max(MIN_QTY, q - STEP))}
                  className="text-[#807e7e] text-[22px] leading-none"
                  style={jakarta(500)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="text-[#0c2310] text-[16px]" style={jakarta(600)}>
                  {units(qty)}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(Math.max(product.available, MIN_QTY), q + STEP))}
                  className="text-[#0c2310] text-[22px] leading-none"
                  style={jakarta(500)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Estimated value */}
            <div className="flex items-center justify-between w-full">
              <span className="text-[#807e7e] text-[14px]" style={jakarta(400)}>
                Estimated commodity value
              </span>
              <span className="text-[#0c2310] text-[20px]" style={jakarta(700)}>
                {estimatedValue}
              </span>
            </div>

            {/* Place order button */}
            <button
              onClick={() => setWantsOrder(true)}
              disabled={!inStock}
              className="bg-[#008f63] flex gap-[8px] h-[52px] items-center justify-center px-[24px] rounded-[999px] w-full disabled:opacity-60"
            >
              <span className="text-white text-[14px]" style={jakarta(600)}>
                Place order
              </span>
              <img src={arrowRight} alt="" className="size-[18px] shrink-0" />
            </button>

            {/* Request a sample: nothing on the API takes a sample request yet, so the button says so. */}
            <button
              type="button"
              disabled
              title="Sample requests are coming with the orders API"
              className="bg-[#f7f7f7] border border-[#e4dede] flex h-[52px] items-center justify-center px-[24px] rounded-[999px] w-full disabled:opacity-60"
            >
              <span className="text-[#0c2310] text-[14px]" style={jakarta(600)}>
                Request a sample
              </span>
            </button>

            {/* Purchase assurances */}
            <div className="flex gap-[20px] items-start w-full">
              <div className="flex flex-1 gap-[8px] items-center min-w-0">
                <img src={lockIcon} alt="" className="size-[18px] shrink-0" />
                <span className="text-[#807e7e] text-[12px] leading-[1.45]" style={jakarta(400)}>
                  Protected payment
                </span>
              </div>
              <div className="flex flex-1 gap-[8px] items-center min-w-0">
                <img src={shieldIcon} alt="" className="size-[18px] shrink-0" />
                <span className="text-[#807e7e] text-[12px] leading-[1.45]" style={jakarta(400)}>
                  Independent testing
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && <PlaceOrderModal listing={product} quantity={qty} onClose={() => setWantsOrder(false)} />}
      <SignInDialogs open={signInOpen} onClose={() => setWantsOrder(false)} redirectTo={location.pathname} />
    </div>
  )
}
