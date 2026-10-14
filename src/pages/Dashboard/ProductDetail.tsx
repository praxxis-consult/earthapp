import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Toast from '../../components/ui/Toast'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import trashIcon from '../../assets/icons/prod-trash.svg'
import editIcon from '../../assets/icons/prod-edit.svg'
import galleryAddIcon from '../../assets/icons/prod-gallery-add.svg'
import starIcon from '../../assets/icons/prod-star.svg'
import bagIcon from '../../assets/icons/prod-bag.svg'
import shopIcon from '../../assets/icons/db-products.svg'
import statusDotIcon from '../../assets/icons/prod-status-dot.svg'
import eyeIcon from '../../assets/icons/prod-eye.svg'
import locationIcon from '../../assets/icons/prod-location.svg'
import clockIcon from '../../assets/icons/prod-clock.svg'
import calendarIcon from '../../assets/icons/prod-calendar.svg'
import { describeError } from '../../services/earthApi'
import { useGetMyProductsQuery } from '../../feature/products/productsApiSlice'
import { useGetCategoriesQuery } from '../../feature/stores/storesApiSlice'
import { useStore } from '../../feature/stores/useStore'
import { listingStatus, naira, pickupHoursLabel, soldAsLabel, unitPlural, weightLabel } from '../../lib/productView'
import type { ProductsToast } from './Products'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between overflow-clip w-full">
      <p className="text-[#807e7e] text-[14px] leading-[24px] whitespace-nowrap" style={jakarta(400)}>
        {label}
      </p>
      <div>{children}</div>
    </div>
  )
}

function Dot({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-[6px] items-center">
      <div className="relative shrink-0 size-[7px]" style={{ opacity: on ? 1 : 0.35 }}>
        <img src={statusDotIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
      </div>
      <p
        className="text-[16px] leading-[24px] whitespace-nowrap"
        style={{ ...jakarta(600), color: on ? '#007c53' : '#807e7e' }}
      >
        {children}
      </p>
    </div>
  )
}

function FulfillmentCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="border border-[#f7f7f7] flex gap-[12px] items-center p-[16px] rounded-[16px] w-full">
      <div className="bg-[#f2f8f6] flex items-center justify-center rounded-full shrink-0 size-[36px]">
        <div className="relative shrink-0 size-[16px]">
          <img src={icon} alt="" className="absolute block inset-0 max-w-none size-full" />
        </div>
      </div>
      <div className="flex flex-col gap-[2px] flex-1 min-w-0">
        <p className="text-[#807e7e] text-[11px]" style={jakarta(400)}>
          {label}
        </p>
        <p className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>
          {value}
        </p>
        {sub && (
          <p className="text-[#807e7e] text-[11px]" style={jakarta(400)}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

const updatedLabel = (iso: string) => {
  const d = new Date(iso)
  const today = new Date()
  const time = d.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })
  if (d.toDateString() === today.toDateString()) return `Today at ${time}`
  return `${d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} at ${time}`
}

/** Figma products 467:12577, fed by the seller's own product list (drafts included). */
export default function ProductDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const myProducts = useGetMyProductsQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const { store } = useStore()
  const product = myProducts.data?.find((x) => x.id === id) ?? null
  const error = myProducts.error ? describeError(myProducts.error) : myProducts.data && !product ? 'We could not find that product.' : ''
  const [expanded, setExpanded] = useState(false)
  const [toast, setToast] = useState<ProductsToast | null>(
    () => (location.state as { toast?: ProductsToast } | null)?.toast ?? null,
  )

  useEffect(() => {
    if ((location.state as { toast?: ProductsToast } | null)?.toast)
      navigate(location.pathname, { replace: true, state: null })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const category = categories.find((c) => c.id === product?.categoryId)?.name ?? product?.categoryId ?? '—'
  const status = product ? listingStatus(product) : 'Draft'
  const qty = product?.availableQuantity ?? 0
  const unit = unitPlural(product?.soldAs, 1)
  const images = product?.images ?? []
  const hours = pickupHoursLabel(product?.pickupHours)
  const pickup =
    product?.pickupLocation?.type === 'CUSTOM'
      ? `${product.pickupLocation.address.street} · ${product.pickupLocation.address.area}, ${product.pickupLocation.address.region}`
      : store
        ? `${store.storeName} · ${store.businessAddress.area}, ${store.businessAddress.region}`
        : 'Your business address'
  const description = product?.description ?? ''
  const long = description.length > 140

  return (
    <DashboardLayout>
      <div className="relative px-[24px] pt-[40px] pb-[40px] flex flex-col gap-[24px]">
        {toast && <Toast title={toast.title} body={toast.body} onDone={() => setToast(null)} />}

        {/* Back + title row */}
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-[24px] max-w-[490px]">
            <button onClick={() => navigate('/dashboard/products')} className="flex gap-[8px] items-center">
              <div className="flex items-center justify-center size-[16px]" style={{ transform: 'rotate(90deg)' }}>
                <img src={arrowDownIcon} alt="" className="size-[16px]" />
              </div>
              <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500)}>
                Back
              </p>
            </button>
            <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
              Product Details
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-[16px] pt-[8px]">
            {/* The API has no delete yet; the button stays as designed but says so. */}
            <button
              disabled
              title="Deleting a listing is not available yet"
              className="bg-[#f5ebed] flex gap-[8px] h-[48px] items-center justify-center px-[28px] rounded-[30px] w-[168px] opacity-60 cursor-not-allowed"
            >
              <div className="relative shrink-0 size-[20px]">
                <img src={trashIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
              </div>
              <p className="text-[#d80027] text-[14px] tracking-[-0.14px] whitespace-nowrap" style={jakarta(500)}>
                Delete
              </p>
            </button>
            <button
              onClick={() => navigate(`/dashboard/products/${id}/edit`)}
              disabled={!product}
              className="flex gap-[8px] h-[48px] items-center justify-center px-[24px] rounded-[30px] w-[168px] disabled:opacity-60"
              style={{ backgroundImage: CTA_BG }}
            >
              <div className="relative shrink-0 size-[20px]">
                <img src={editIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
              </div>
              <p
                className="text-[14px] tracking-[-0.14px] bg-clip-text text-transparent"
                style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}
              >
                Edit product
              </p>
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
            {error}
          </p>
        )}

        {product && (
          <>
            {/* Photo + info card */}
            <div className="bg-white flex items-center justify-between p-[24px] rounded-[20px] w-full overflow-hidden">
              {/* Photo gallery: cover, second photo, third photo or placeholder */}
              <div className="h-[390px] relative shrink-0 w-[515px]">
                <div className="absolute bg-[#ededed] inset-[0_31.72%_0_0] overflow-clip rounded-[15px]">
                  {images[0] ? (
                    <img
                      src={images[0].url}
                      alt={product.productName ?? ''}
                      className="absolute inset-0 max-w-none object-cover size-full"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#f7f7f7]">
                      <img src={galleryAddIcon} alt="" className="size-[40px]" />
                    </div>
                  )}
                </div>
                <div className="absolute bg-[#ededed] inset-[0_0.26%_51.03%_69.83%] overflow-clip rounded-[15px]">
                  {images[1] ? (
                    <img src={images[1].url} alt="" className="absolute inset-0 max-w-none object-cover size-full" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#f7f7f7]">
                      <img src={galleryAddIcon} alt="" className="size-[40px]" />
                    </div>
                  )}
                </div>
                <div className="absolute bg-[#f7f7f7] inset-[51.03%_0.26%_0_69.83%] overflow-clip rounded-[15px] flex items-center justify-center">
                  {images[2] ? (
                    <img src={images[2].url} alt="" className="absolute inset-0 max-w-none object-cover size-full" />
                  ) : (
                    <div className="relative size-[40px]">
                      <img src={galleryAddIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                    </div>
                  )}
                </div>
              </div>

              {/* Product info */}
              <div className="flex flex-col gap-[24px] items-start w-[514px]">
                <div className="bg-[#aee74a] flex items-center justify-center overflow-clip px-[12px] py-[6px] rounded-[999px]">
                  <p className="text-[#101604] text-[12px] leading-[20px] whitespace-nowrap" style={jakarta(600)}>
                    {category}
                  </p>
                </div>

                <div className="flex flex-col gap-[16px] w-full">
                  <p className="text-[#101604] text-[24px] leading-[32px] tracking-[-0.48px]" style={jakarta(600)}>
                    {product.productName || 'Untitled product'}
                  </p>

                  <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(500)}>
                    {long && !expanded
                      ? `${description.slice(0, 140).trimEnd()}… `
                      : description || 'No description yet.'}
                    {long && (
                      <button
                        type="button"
                        onClick={() => setExpanded((e) => !e)}
                        className="text-[#007c53]"
                        style={jakarta(500)}
                      >
                        {expanded ? ' Show less' : 'Show more'}
                      </button>
                    )}
                  </p>

                  <div className="bg-[#f7f7f7] h-px w-full" />

                  <div className="flex flex-col gap-[24px] w-full">
                    <div className="flex flex-col gap-[8px]">
                      <div className="flex flex-col gap-[8px]">
                        <p className="text-[#807e7e] text-[11px] whitespace-nowrap" style={jakarta(500)}>
                          Price per {unit}
                        </p>
                        <div className="flex gap-[16px] items-center">
                          <p className="text-[#0c2310] text-[28px]" style={jakarta(700)}>
                            {product.price ? naira(product.price) : '—'}
                          </p>
                          <div className="bg-[rgba(0,124,83,0.05)] flex items-center overflow-clip px-[8px] py-[5px] rounded-[999px]">
                            <p className="text-[#007c53] text-[11px] whitespace-nowrap" style={jakarta(500)}>
                              {qty} {unitPlural(product.soldAs, qty)} available
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Reviews are not in the API yet. */}
                      <div className="flex gap-[8px] items-center">
                        <div className="flex gap-[4px] items-center">
                          <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
                            —
                          </p>
                          <div className="relative shrink-0 size-[16px]">
                            <img src={starIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                          </div>
                        </div>
                        <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(600)}>
                          No reviews yet
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-[16px] w-full">
                      <div className="flex gap-[12px] items-center w-full overflow-clip">
                        <div className="bg-[#f2f8f6] flex items-center justify-center rounded-full shrink-0 size-[36px]">
                          <div className="relative shrink-0 size-[16px]">
                            <img src={bagIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                          <p className="text-[#807e7e] text-[13px]" style={jakarta(400)}>
                            Selling unit
                          </p>
                          <p className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>
                            {product.soldAs ? `${soldAsLabel(product).replace(',', ' -')}` : 'Not set'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-[12px] items-center w-full overflow-clip">
                        <div className="bg-[#f2f8f6] flex items-center justify-center rounded-full shrink-0 size-[36px]">
                          <div className="relative shrink-0 size-[16px]">
                            <img src={shopIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                          <p className="text-[#807e7e] text-[13px]" style={jakarta(400)}>
                            Customer visibility/Status
                          </p>
                          <p className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>
                            {status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom two cards */}
            <div className="flex gap-[16px] w-full">
              <div className="bg-white flex flex-col gap-[16px] p-[20px] rounded-[20px] flex-1 overflow-hidden">
                <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
                  Inventory &amp; Visibility
                </p>
                <div className="bg-[#f7f7f7] h-px w-full" />

                <div className="flex flex-col gap-[24px] w-full">
                  <div className="flex flex-col gap-[16px] w-full">
                    <DetailRow label="Listing status">
                      <Dot on={product.status === 'PUBLISHED'}>
                        {product.status === 'PUBLISHED' ? 'On sale' : 'Draft'}
                      </Dot>
                    </DetailRow>
                    <DetailRow label="Customer visibility">
                      <Dot on={product.status === 'PUBLISHED' && qty > 0}>
                        {product.status === 'PUBLISHED' && qty > 0 ? 'Available' : 'Hidden'}
                      </Dot>
                    </DetailRow>
                    <DetailRow label="Quantity in stock">
                      <p className="text-[#101604] text-[16px] leading-[24px] whitespace-nowrap" style={jakarta(600)}>
                        {qty} {unitPlural(product.soldAs, qty)}
                      </p>
                    </DetailRow>
                    <DetailRow label="Track quantity">
                      <Dot on={product.availableQuantity != null}>
                        {product.availableQuantity != null ? 'On' : 'Off'}
                      </Dot>
                    </DetailRow>
                  </div>

                  <div className="flex gap-[12px] items-center py-[16px] rounded-[16px] w-full">
                    <div className="flex flex-1 gap-[12px] items-center min-w-0">
                      <div className="bg-[#f2f8f6] flex items-center justify-center rounded-full shrink-0 size-[40px]">
                        <div className="relative shrink-0 size-[16px]">
                          <img src={eyeIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                        <p className="text-[#101604] text-[14px]" style={jakarta(500)}>
                          Seller-only information
                        </p>
                        <p className="text-[#807e7e] text-[11px] leading-[20px]" style={jakarta(400)}>
                          These settings are only visible to you and your store team.
                          {product.note ? ` Note: ${product.note}` : ''} SKU {product.sku}.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-[2px] items-end shrink-0 whitespace-nowrap">
                      <p className="text-[#807e7e] text-[11px] leading-[20px]" style={jakarta(400)}>
                        Last updated
                      </p>
                      <p className="text-[#101604] text-[12px] leading-[20px]" style={jakarta(600)}>
                        {updatedLabel(product.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white flex flex-col gap-[16px] p-[20px] rounded-[20px] flex-1 overflow-hidden">
                <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
                  Pickup &amp; Availability
                </p>
                <div className="bg-[#f7f7f7] h-px w-full" />

                <div className="flex flex-col gap-[12px] w-full">
                  <FulfillmentCard icon={locationIcon} label="Pickup location" value={pickup} />
                  {/* No preparation-time field on the API yet; the MOQ and weight fill this card. */}
                  <FulfillmentCard
                    icon={clockIcon}
                    label="Minimum order"
                    value={`${product.moq ?? 1} ${unitPlural(product.soldAs, product.moq ?? 1)}`}
                    sub={
                      weightLabel(product.approximateWeightGrams)
                        ? `${weightLabel(product.approximateWeightGrams)} per ${unit}`
                        : undefined
                    }
                  />
                  <FulfillmentCard
                    icon={calendarIcon}
                    label="Pickup hours"
                    value={hours.days}
                    sub={hours.time || undefined}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
