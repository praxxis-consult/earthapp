import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ImageViewer from '../../components/ui/ImageViewer'
import CheckoutDialog from '../../components/ui/CheckoutDialog'
import Skeleton, { LoadingRegion } from '../../components/ui/Skeleton'
import Toast from '../../components/ui/Toast'
import { ReviewsPanel, ShippingPanel } from '../../components/marketplace/ListingPanels'
import { plural, type Tab } from '../../lib/listing'
import { useAuth } from '../../feature/authentication/useAuth'
import { useStartChatMutation } from '../../feature/chats/chatsApiSlice'
import { useGetListingQuery } from '../../feature/marketplace/catalogApiSlice'
import { useGetReviewsQuery, useRecordViewMutation } from '../../feature/reviews/reviewsApiSlice'
import { useStore } from '../../feature/stores/useStore'
import { initials } from '../../data/orders'
import { useCart } from '../../feature/cart/useCart'
import { storeFacts } from '../../lib/storeStats'
import { galleryView } from '../../lib/gallery'
import { soldAsLabel } from '../../lib/productView'
import { useSaved } from '../../lib/saved'
import { describeError } from '../../services/earthApi'
import backIcon from '../../assets/icons/bm-back.svg'
import saveIcon from '../../assets/icons/bm-save.svg'
import unitIcon from '../../assets/icons/bm-unit-bag.svg'
import smsIcon from '../../assets/icons/bm-sms.svg'
import arrowRight from '../../assets/icons/rc-arrow-right.svg'
import addToCartIcon from '../../assets/icons/bm-add-to-cart.svg'
import verifyIcon from '../../assets/icons/bm-verify.svg'
import starIcon from '../../assets/icons/bm-star.svg'
import plusIcon from '../../assets/icons/pd-plus.svg'
import { jakarta } from '../../utils/styles'

const TABS: { key: Tab; label: string }[] = [
  { key: 'details', label: 'Product description' },
  { key: 'shipping', label: 'Shipping and terms' },
  { key: 'reviews', label: 'Reviews' },
]

/**
 * A listing inside the buyer dashboard (818:10697): Back and the 24/32 "Product Details" title,
 * then the white card (radius 20, 24 padding) holding the 510×590 gallery (424 main, three 150
 * thumbnails 16 apart, the chosen one ringed 2.5px #007c53, the last counting the rest) beside
 * the 510 panel: badges with Save Product, name, copy, price with the availability pill, the
 * selling unit, three key facts, the quantity, then Message seller / Place order / add to cart.
 * The second card holds the bottom-bordered tabs, the description and the supplier preview.
 * A buyer only ever reaches this signed in, so the actions act at once.
 */
export default function MarketplaceListing() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { account } = useAuth()
  const { store: ownStore } = useStore()
  const saved = useSaved(account?.id)
  const cart = useCart()
  const [startChat, { isLoading: openingChat }] = useStartChatMutation()
  const product = useGetListingQuery(id ?? '', { skip: !id }).currentData
  const reviewsQuery = useGetReviewsQuery(id ?? '', { skip: !id })
  const reviews = reviewsQuery.data?.items ?? []
  const [recordView] = useRecordViewMutation()
  useEffect(() => {
    if (id) recordView(id)
  }, [id, recordView])

  const [tab, setTab] = useState<Tab>('details')
  const [more, setMore] = useState(false)
  const [qty, setQty] = useState<{ id: string; qty: number } | null>(null)
  const [front, setFront] = useState<{ id: string; at: number } | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)
  // "Place order" on a marketplace card lands here with ?order=1 and opens the delivery choice straight away.
  const [ordering, setOrdering] = useState(() => params.get('order') === '1')
  const [actionError, setActionError] = useState('')
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null)

  if (product === undefined) {
    return (
      <DashboardLayout>
        <LoadingRegion label="Loading listing" className="px-[24px] pt-[40px] pb-[24px] flex flex-col gap-[24px] max-md:px-[16px] max-md:pt-[24px]">
          <Skeleton className="h-[24px] w-[64px]" />
          <Skeleton className="h-[32px] w-[200px]" />
          <div className="bg-white rounded-[20px] p-[24px] flex gap-[24px] max-lg:flex-col max-md:p-[16px]">
            <div className="flex w-[510px] shrink-0 flex-col gap-[16px] max-xl:w-auto max-xl:flex-1 max-lg:w-full">
              <Skeleton className="h-[424px] w-full rounded-[20px] max-md:h-auto max-md:aspect-[4/3]" />
              <div className="flex gap-[16px]">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-[150px] flex-1 rounded-[20px] max-md:h-[96px]" />
                ))}
              </div>
            </div>
            <div className="flex flex-1 min-w-0 flex-col gap-[16px]">
              <Skeleton className="h-[27px] w-[170px] rounded-full" />
              <Skeleton className="h-[32px] w-3/4" />
              <Skeleton className="h-[20px] w-full" />
              <Skeleton className="h-[20px] w-5/6" />
              <Skeleton className="mt-[8px] h-[53px] w-[260px]" />
              <Skeleton className="h-[52px] w-full rounded-full" />
              <div className="flex gap-[16px]">
                <Skeleton className="h-[48px] flex-1 rounded-[30px]" />
                <Skeleton className="h-[48px] flex-1 rounded-[30px]" />
              </div>
            </div>
          </div>
        </LoadingRegion>
      </DashboardLayout>
    )
  }
  if (!product) {
    return (
      <DashboardLayout>
        <div className="px-[24px] pt-[40px] max-md:px-[16px] max-md:pt-[24px]">
          <Link to="/dashboard/marketplace" className="flex items-center gap-[8px] text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500)}>
            <img src={backIcon} alt="" className="size-[16px]" />
            Back
          </Link>
          <div className="mt-[24px] bg-white rounded-[20px] py-[64px] px-[24px] flex items-center justify-center">
            <p className="text-[#807e7e] text-[16px]" style={jakarta(400)}>
              This listing is not available.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const quantity = qty && qty.id === product.id ? qty.qty : product.moq
  const setQuantity = (n: number) => setQty({ id: product.id, qty: Math.min(Math.max(product.moq, n), Math.max(product.available, product.moq)) })
  const inStock = product.available > 0
  const gallery = galleryView(product.images, front && front.id === product.id ? front.at : 0)
  const mine = !!ownStore && ownStore.id === product.store.id
  const longDescription = product.description.length > 150
  const inCart = cart.lineFor(product.id)
  const ratingCount = Number(reviewsQuery.data?.summary?.count ?? 0) || 0
  const ratingAverage = reviewsQuery.data?.summary?.average ? Number(reviewsQuery.data.summary.average) : 0

  async function messageSeller() {
    setActionError('')
    try {
      const thread = await startChat({ storeId: product!.store.id, productId: product!.id }).unwrap()
      navigate(`/dashboard/messages?chat=${thread.id}`)
    } catch (e) {
      setActionError(describeError(e))
    }
  }
  async function addToCart() {
    setActionError('')
    try {
      const now = await cart.add(product!, quantity)
      setToast({ title: inCart ? 'Cart updated' : 'Added to cart', body: `${plural(now, product!.unit)} of ${product!.title} from ${product!.store.storeName}. Check out from Cart when you are ready.` })
    } catch (e) {
      setActionError(describeError(e))
    }
  }
  function closeOrder() {
    setOrdering(false)
    if (params.get('order')) setParams({}, { replace: true })
  }

  const factLabel = 'text-[#807e7e] text-[12px] leading-[20px]'
  const factValue = 'text-[#0c2310] text-[16px] leading-[24px]'

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[24px] flex flex-col gap-[24px] max-md:px-[16px] max-md:pt-[24px]">
        {/* 818:11434: Back (16 glyph, 500 16/24 #807e7e) and the title, 24 apart */}
        <div className="flex flex-col gap-[24px]">
          <button type="button" onClick={() => navigate(-1)} className="flex w-fit items-center gap-[8px] text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500)}>
            <img src={backIcon} alt="" className="size-[16px]" />
            Back
          </button>
          <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Product Details
          </h1>
        </div>

        {/* 818:11445: gallery and panel, 24 apart, in a white card */}
        <div className="bg-white rounded-[20px] p-[24px] flex gap-[24px] items-center max-lg:flex-col max-lg:items-stretch max-md:p-[16px]">
          {/* 818:11333: 510 wide; the main photo 424 tall, thumbnails 150 tall, 16 apart */}
          <div className="flex w-[510px] shrink-0 flex-col gap-[16px] max-xl:w-auto max-xl:flex-1 max-xl:min-w-0 max-lg:w-full max-lg:flex-none">
            <button
              type="button"
              onClick={() => gallery.main && setViewing(gallery.selected)}
              aria-label={gallery.main ? `View ${product.title} photos full size` : undefined}
              disabled={!gallery.main}
              className="h-[424px] w-full overflow-hidden rounded-[20px] bg-[#ededed] max-md:h-auto max-md:aspect-[4/3] disabled:cursor-default"
            >
              {gallery.main && <img src={gallery.main} alt={product.title} className="size-full object-cover" />}
            </button>
            <div className="flex gap-[16px]">
              {[0, 1, 2].map((i) => {
                const thumb = gallery.thumbs[i]
                const moreThumbs = i === 2 && gallery.extra > 0
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!thumb}
                    onClick={() => thumb && (moreThumbs ? setViewing(thumb.index) : setFront({ id: product.id, at: thumb.index }))}
                    aria-label={thumb ? (moreThumbs ? `See all ${product.images.length} photos` : `Show photo ${thumb.index + 1}`) : undefined}
                    className="relative h-[150px] flex-1 min-w-0 overflow-hidden rounded-[20px] bg-[#ededed] max-md:h-[96px] disabled:cursor-default"
                  >
                    {thumb && <img src={thumb.src} alt="" className="size-full object-cover" />}
                    {moreThumbs && (
                      <div className="absolute inset-0 flex items-center justify-center gap-[8px]" style={{ background: 'linear-gradient(180deg, rgba(20,20,20,0) 0%, #141414 100%)' }}>
                        <img src={plusIcon} alt="" className="size-[20px]" />
                        <span className="text-white text-[32px] leading-[48px] max-md:text-[20px] max-md:leading-[28px]" style={jakarta(600)}>
                          {gallery.extra}
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 818:11347: the 510 panel, blocks 24 apart */}
          <div className="flex flex-1 min-w-0 flex-col gap-[24px]">
            <div className="flex flex-col gap-[24px]">
              {/* 818:11349: badges left, Save Product right */}
              <div className="flex h-[32px] items-center justify-between gap-[10px]">
                <div className="flex items-center gap-[8px]">
                  <span className="flex h-[27px] items-center rounded-full bg-[#aee74a] px-[12px] text-[#101604] text-[12px] leading-[15px]" style={jakarta(600)}>
                    {product.category}
                  </span>
                  <span className="flex h-[27px] items-center rounded-[30px] px-[12px] text-[12px] leading-[15px]" style={{ ...jakarta(600), background: inStock ? '#e9f1fc' : '#fdecec', color: inStock ? '#2765c7' : '#b13b3b' }}>
                    {inStock ? 'In stock' : 'Out of stock'}
                  </span>
                </div>
                {!mine && (
                  <button type="button" onClick={() => saved.toggle(product)} aria-pressed={saved.isSaved(product.id)} className="flex items-center gap-[8px] text-[#101604] text-[14px] leading-[24px] whitespace-nowrap" style={jakarta(500)}>
                    <img src={saveIcon} alt="" className="size-[24px]" />
                    {saved.isSaved(product.id) ? 'Saved' : 'Save Product'}
                  </button>
                )}
              </div>

              {/* 818:11363: name 600 24/32, copy 500 14/24 #807e7e, divider, price and unit */}
              <div className="flex flex-col gap-[16px]">
                <h2 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
                  {product.title}
                </h2>
                {/* 818:11365: two lines of 500 14/24 with "Show more" inline at the end, as the frame draws it */}
                <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(500)}>
                  {more || !longDescription ? product.description : `${product.description.slice(0, 150).trimEnd()}…`}{' '}
                  {longDescription && (
                    <button type="button" onClick={() => setMore((m) => !m)} className="text-[#007c53]" style={jakarta(500)}>
                      {more ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </p>
                <div className="h-px w-full bg-[#f7f7f7]" />
                <div className="flex flex-col gap-[24px]">
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(500)}>
                      Price per {product.unit}
                    </span>
                    <div className="flex items-center justify-between gap-[16px]">
                      <span className="text-[#0c2310] text-[28px] leading-[35px]" style={jakarta(700)}>
                        {product.price}
                      </span>
                      <span className="flex h-[24px] items-center rounded-full px-[8px] text-[#007c53] text-[11px] leading-[14px] whitespace-nowrap" style={{ ...jakarta(500), background: 'rgba(0,124,83,0.05)' }}>
                        {inStock ? `${plural(product.available, product.unit)} available` : 'Nothing available'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <span className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-[#f2f8f6]">
                      <img src={unitIcon} alt="" className="size-[16px]" />
                    </span>
                    <span className="flex flex-col gap-[2px] min-w-0">
                      <span className="text-[#807e7e] text-[13px] leading-[16px]" style={jakarta(400)}>
                        Selling unit
                      </span>
                      <span className="text-[#101604] text-[14px] leading-[20px] truncate" style={jakarta(600)}>
                        {soldAsLabel({ soldAs: product.unit, approximateWeightGrams: product.weightGrams || undefined })}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 818:11381: three facts, 18 apart, 18 above and below, a #f7f7f7 line each side */}
              <div className="grid grid-cols-3 gap-[18px] border-y border-[#f7f7f7] py-[18px] max-sm:grid-cols-2">
                {[
                  ['Location', product.location],
                  ['Available', plural(product.available, product.unit)],
                  ['MOQ', plural(product.moq, product.unit)],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-[4px] min-w-0">
                    <span className={factLabel} style={jakarta(400)}>{label}</span>
                    <span className={`${factValue} truncate`} style={jakarta(600)}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 818:11391: the quantity, label 600 16/24, control 52 tall */}
            <div className="flex flex-col gap-[10px]">
              <span className="text-[#0c2310] text-[16px] leading-[24px]" style={jakarta(600)}>
                Order quantity
              </span>
              <div className="flex h-[52px] items-center justify-between rounded-full bg-[#f7f7f7] px-[18px]">
                <button type="button" onClick={() => setQuantity(quantity - 1)} aria-label="Decrease quantity" className="text-[#807e7e] text-[22px] leading-[28px]" style={jakarta(500)}>
                  −
                </button>
                <span className="text-[#101604] text-[16px] leading-[20px]" style={jakarta(600)} aria-live="polite">
                  {quantity}
                </span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity" className="text-[#807e7e] text-[22px] leading-[28px]" style={jakarta(500)}>
                  +
                </button>
              </div>
            </div>

            {/* 818:11399: Message seller 215×48, Place order 215×48, the 48×48 lime cart button, 16 apart */}
            {mine ? (
              <div className="flex flex-col gap-[8px] rounded-[16px] bg-[#f2f8f6] px-[16px] py-[12px]">
                <span className="text-[#0c2310] text-[14px] leading-[20px]" style={jakarta(600)}>
                  This is your listing
                </span>
                <span className="text-[#807e7e] text-[13px] leading-[18px]" style={jakarta(400)}>
                  Buyers see it this way. Prices, stock and photos are changed from your dashboard.
                </span>
                <Link to={`/dashboard/products/${product.id}/edit`} className="mt-[4px] flex h-[40px] w-fit items-center gap-[8px] rounded-[30px] bg-[#007c53] px-[20px] text-white text-[14px] leading-[18px]" style={jakarta(500)}>
                  Edit listing
                  <img src={arrowRight} alt="" className="size-[16px]" />
                </Link>
              </div>
            ) : (
              <div className="flex gap-[16px] max-sm:flex-wrap">
                <button
                  type="button"
                  onClick={messageSeller}
                  disabled={openingChat}
                  className="flex h-[48px] flex-1 items-center justify-center gap-[8px] rounded-[30px] bg-[#f7f7f7] px-[24px] text-[#101604] text-[14px] leading-[18px] disabled:opacity-60 max-sm:basis-full"
                  style={jakarta(500)}
                >
                  <img src={smsIcon} alt="" className="size-[20px]" />
                  {openingChat ? 'Opening chat…' : 'Message seller'}
                </button>
                <button
                  type="button"
                  onClick={() => setOrdering(true)}
                  disabled={!inStock}
                  className="flex h-[48px] flex-1 items-center justify-center gap-[8px] rounded-[30px] bg-[#007c53] px-[24px] text-white text-[14px] leading-[18px] disabled:opacity-60"
                  style={jakarta(500)}
                >
                  Place order
                  <img src={arrowRight} alt="" className="size-[16px]" />
                </button>
                <button
                  type="button"
                  onClick={addToCart}
                  disabled={!inStock}
                  aria-label={inCart ? `Add ${plural(quantity, product.unit)} more to the cart` : 'Add to cart'}
                  title={inCart ? `${plural(inCart.quantity, product.unit)} in your cart` : 'Add to cart'}
                  className="flex size-[48px] shrink-0 items-center justify-center rounded-[30px] bg-[#aee74a] disabled:opacity-60"
                >
                  <img src={addToCartIcon} alt="" className="size-[20px]" />
                </button>
              </div>
            )}
            {actionError && (
              <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
                {actionError}
              </p>
            )}
          </div>
        </div>

        {/* 818:12936: the tabs card, blocks 24 apart */}
        <div className="bg-white rounded-[20px] p-[24px] flex flex-col gap-[24px] max-md:p-[16px]">
          {/* 818:13037: 39px tabs 16 apart, 12/16 padding, 500 12/15; the chosen one carries a 1.2px #007c53 bottom line */}
          <div role="tablist" className="flex items-center gap-[16px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className="h-[39px] shrink-0 whitespace-nowrap px-[16px] text-[12px] leading-[15px] border-b-[1.2px]"
                style={{ ...jakarta(500), color: tab === t.key ? '#007c53' : '#807e7e', borderColor: tab === t.key ? '#007c53' : 'transparent' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <>
              {/* 818:13044: 400 16/32 */}
              <p className="whitespace-pre-line text-[#101604] text-[16px] leading-[32px]" style={jakarta(400)}>
                {product.description}
              </p>
              {/* 818:13045: the supplier, 112 tall, #f7f7f7, radius 16, 80px picture; the rating comes from the listing's reviews */}
              <div className="flex items-center gap-[16px] rounded-[16px] bg-[#f7f7f7] p-[16px]">
                <span className="flex size-[80px] shrink-0 items-center justify-center rounded-[15px] bg-[#f2f8f6] text-[#007c53] text-[24px] max-md:size-[56px] max-md:text-[18px]" style={jakarta(700)}>
                  {initials(product.store.storeName)}
                </span>
                <div className="flex flex-1 flex-col gap-[8px] min-w-0">
                  <div className="flex items-center gap-[12px] max-md:flex-wrap max-md:gap-y-[4px]">
                    <span className="flex items-center gap-[5px] min-w-0">
                      <span className="text-[#101604] text-[18px] leading-[24px] truncate max-md:text-[16px]" style={jakarta(600)}>
                        {product.store.storeName}
                      </span>
                      {product.store.verificationStatus === 'VERIFIED' && <img src={verifyIcon} alt="Verified seller" className="size-[20px] shrink-0" />}
                    </span>
                    <span className="flex items-center gap-[4px] text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                      {ratingCount ? (
                        <>
                          {ratingAverage.toFixed(1)}
                          <img src={starIcon} alt="" className="size-[16px]" />
                          <span className="italic" style={jakarta(500)}>
                            ({plural(ratingCount, 'review')})
                          </span>
                        </>
                      ) : (
                        <span className="italic" style={jakarta(500)}>
                          (No reviews yet)
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                    {[product.store.verificationStatus === 'VERIFIED' ? 'Verified seller' : 'Seller on Earth', `Member since ${new Date(product.store.liveAt).getFullYear()}`, product.location, ...storeFacts(product.store)].join(' · ')}
                  </p>
                </div>
              </div>
            </>
          )}
          {tab === 'shipping' && <ShippingPanel />}
          {tab === 'reviews' && <ReviewsPanel reviews={reviews} summary={reviewsQuery.data?.summary} />}
        </div>
      </div>

      {ordering && !mine && <CheckoutDialog listing={product} quantity={quantity} onClose={closeOrder} />}
      {viewing !== null && <ImageViewer images={product.images} start={viewing} title={product.title} onClose={() => setViewing(null)} />}
      {toast && <Toast title={toast.title} body={toast.body} onDone={() => setToast(null)} />}
    </DashboardLayout>
  )
}
