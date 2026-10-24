import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import PlaceOrderModal from '../../components/ui/PlaceOrderModal'
import ImageViewer from '../../components/ui/ImageViewer'
import Skeleton, { LoadingRegion } from '../../components/ui/Skeleton'
import { useStore } from '../../feature/stores/useStore'
import SignInDialogs from '../../components/ui/SignInDialogs'
import { useStartChatMutation } from '../../feature/chats/chatsApiSlice'
import { describeError } from '../../services/earthApi'
import { useGetListingQuery } from '../../feature/marketplace/catalogApiSlice'
import { useAuth } from '../../feature/authentication/useAuth'
import { useSaved } from '../../lib/saved'
import { galleryView } from '../../lib/gallery'
import savedIcon from '../../assets/icons/db-nav-archive.svg'
import { useGetReviewsQuery, useRecordViewMutation } from '../../feature/reviews/reviewsApiSlice'
import { naira } from '../../lib/productView'
import { initials } from '../../data/orders'
import backIcon from '../../assets/icons/pd-back-16.svg'
import plusIcon from '../../assets/icons/pd-plus.svg'
import bagIcon from '../../assets/icons/pd-bag.svg'
import smsIcon from '../../assets/icons/pd-sms.svg'
import arrowRight from '../../assets/icons/pd-arrow-right-16.svg'
import star16 from '../../assets/icons/pd-star-16.svg'
import { jakarta } from '../../utils/styles'
import { ReviewsPanel, ShippingPanel } from '../../components/marketplace/ListingPanels'
import { SCROLL_MD, TABS, plural, summarise, type Tab } from '../../lib/listing'


export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { account } = useAuth()
  const saved = useSaved(account?.id)
  // A seller looking at their own listing: the API refuses a chat with one's own store, and an order makes no sense.
  const { store: ownStore } = useStore()
  const [startChat, { isLoading: openingChat }] = useStartChatMutation()
  // undefined while loading, null when the API has no such public listing
  const product = useGetListingQuery(id ?? '', { skip: !id }).currentData
  // Reviews come from the API; a visitor's view of the listing is counted for the seller's overview.
  const reviewsQuery = useGetReviewsQuery(id ?? '', { skip: !id })
  const reviews = reviewsQuery.data?.items ?? []
  const [recordView] = useRecordViewMutation()
  useEffect(() => {
    if (id) recordView(id)
  }, [id, recordView])
  const [tab, setTab] = useState<Tab>('details')
  const [more, setMore] = useState(false)
  const [qty, setQty] = useState<{ id: string; qty: number } | null>(null)
  // Messaging and ordering need an account: a visitor signs in first, then the action carries on.
  const [wants, setWants] = useState<'message' | 'order' | null>(null)
  const [actionError, setActionError] = useState('')
  // The photo in front, per listing (so moving to another listing starts from its first photo), and the full-size viewer.
  const [front, setFront] = useState<{ id: string; at: number } | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)
  const signInOpen = wants !== null && !account
  const ordering = wants === 'order' && Boolean(account)

  // Signed in with a chat pending: open it (the mutation is the external work this effect waits on).
  useEffect(() => {
    if (account && wants === 'message') void messageSeller()
  }, [account, wants]) // eslint-disable-line react-hooks/exhaustive-deps

  /** Opens (or returns to) the buyer's thread with this store, about this listing. */
  async function messageSeller() {
    if (!product) return
    if (!account) return setWants('message')
    setActionError('')
    try {
      const thread = await startChat({ storeId: product.store.id, productId: product.id }).unwrap()
      navigate(`/dashboard/messages?chat=${thread.id}`)
    } catch (e) {
      setWants(null)
      setActionError(describeError(e))
    }
  }

  if (product === undefined) {
    // The outline of the loaded page (gallery, then the panel's badges, name, copy, price and buttons) shimmers until the listing lands.
    return (
      <LoadingRegion label="Loading listing" className="bg-white w-full pb-[80px]">
        <div className="max-w-[1200px] mx-auto pt-[64px] max-xl:px-[24px] max-md:px-[16px] max-md:pt-[32px]">
          <Skeleton className="h-[24px] w-[64px]" />
          <div className="mt-[40px] flex gap-[24px] items-start max-lg:flex-col max-md:mt-[24px]">
            <div className="flex w-[588px] shrink-0 gap-[16px] max-xl:w-auto max-xl:flex-1 max-xl:min-w-0 max-lg:w-full max-lg:flex-none max-md:flex-col">
              <Skeleton className="h-[480px] w-[397px] rounded-[20px] max-xl:w-auto max-xl:flex-1 max-md:w-full max-md:h-auto max-md:aspect-[4/3]" />
              <div className="flex w-[175px] flex-col gap-[16px] max-md:w-full max-md:flex-row">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-[150px] rounded-[20px] max-md:h-[96px] max-md:w-[96px]" />
                ))}
              </div>
            </div>
            <div className="flex flex-1 min-w-0 flex-col gap-[16px] max-lg:w-full">
              <div className="flex gap-[8px]">
                <Skeleton className="h-[28px] w-[88px] rounded-full" />
                <Skeleton className="h-[28px] w-[72px] rounded-full" />
              </div>
              <Skeleton className="h-[36px] w-3/4" />
              <Skeleton className="h-[20px] w-full" />
              <Skeleton className="h-[20px] w-5/6" />
              <Skeleton className="mt-[8px] h-[44px] w-[220px]" />
              <div className="mt-[8px] grid grid-cols-3 gap-[16px]">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-[48px]" />
                ))}
              </div>
              <Skeleton className="mt-[8px] h-[56px] w-full rounded-[16px]" />
              <div className="flex gap-[16px] max-sm:flex-col">
                <Skeleton className="h-[48px] flex-1 rounded-[30px]" />
                <Skeleton className="h-[48px] flex-1 rounded-[30px]" />
              </div>
            </div>
          </div>
        </div>
      </LoadingRegion>
    )
  }
  if (!product) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-[#807e7e] text-[16px]" style={jakarta(400)}>
          This listing is not available.
        </p>
      </div>
    )
  }

  const quantity = qty && qty.id === product.id ? qty.qty : product.moq
  const setQuantity = (n: number) => setQty({ id: product.id, qty: Math.min(Math.max(product.moq, n), Math.max(product.available, product.moq)) })
  const inStock = product.available > 0
  const gallery = galleryView(product.images, front && front.id === product.id ? front.at : 0)
  const mine = !!ownStore && ownStore.id === product.store.id
  const summary = summarise(reviewsQuery.data?.summary)
  const longDescription = product.description.length > 150


  return (
    <div className="bg-white w-full pb-[80px]">
      <div className="max-w-[1200px] mx-auto pt-[64px] max-xl:px-[24px] max-md:px-[16px] max-md:pt-[32px]">
        <button type="button" onClick={() => navigate(-1)} className="flex gap-[8px] items-center max-md:min-h-[44px] max-md:-my-[10px]">
          <img src={backIcon} alt="" className="size-[16px]" />
          <span className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500)}>
            Back
          </span>
        </button>

        <div className="mt-[40px] flex gap-[24px] items-start max-lg:flex-col max-md:mt-[24px]">
          {/* Gallery (663:28963): any thumbnail comes to the front on a tap; the front photo opens the full-size viewer. */}
          <div className="flex w-[588px] shrink-0 gap-[16px] max-xl:w-auto max-xl:flex-1 max-xl:min-w-0 max-lg:w-full max-lg:flex-none max-md:flex-col">
            <button
              type="button"
              onClick={() => gallery.main && setViewing(gallery.selected)}
              aria-label={gallery.main ? `View ${product.title} photos full size` : undefined}
              disabled={!gallery.main}
              className="h-[480px] w-[397px] overflow-hidden rounded-[20px] bg-[#ededed] max-xl:w-auto max-xl:flex-1 max-xl:min-w-0 max-md:flex-none max-md:w-full max-md:h-auto max-md:aspect-[4/3] disabled:cursor-default"
            >
              {gallery.main && <img src={gallery.main} alt={product.title} className="size-full object-cover" />}
            </button>
            <div className={`flex w-[175px] flex-col gap-[16px] max-md:w-full max-md:flex-row ${SCROLL_MD}`}>
              {[0, 1, 2].map((i) => {
                const thumb = gallery.thumbs[i]
                const more = i === 2 && gallery.extra > 0
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!thumb}
                    onClick={() => thumb && (more ? setViewing(thumb.index) : setFront({ id: product.id, at: thumb.index }))}
                    aria-label={thumb ? (more ? `See all ${product.images.length} photos` : `Show photo ${thumb.index + 1}`) : undefined}
                    className="relative h-[150px] overflow-hidden rounded-[20px] bg-[#ededed] max-md:h-[96px] max-md:w-[96px] max-md:shrink-0 max-md:rounded-[16px] disabled:cursor-default"
                  >
                    {thumb && <img src={thumb.src} alt="" className="size-full object-cover" />}
                    {more && (
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

          {/* Panel (687:7112) */}
          <div className="flex w-[588px] shrink-0 flex-col gap-[24px] max-xl:w-auto max-xl:flex-1 max-xl:min-w-0 max-lg:w-full max-lg:flex-none">
            <div className="flex flex-col gap-[24px]">
              <div className="flex h-[32px] items-center gap-[8px]">
                <span className="rounded-full bg-[#aee74a] px-[12px] py-[6px] text-[#101604] text-[12px] leading-[15px]" style={jakarta(600)}>
                  {product.category}
                </span>
                {/* Order status (663:28480): In stock / Out of Stock */}
                <span
                  className="rounded-[30px] px-[12px] py-[6px] text-[12px] leading-[15px]"
                  style={{ ...jakarta(600), background: inStock ? '#e9f1fc' : '#fff0f0', color: inStock ? '#2765c7' : '#b13b3b' }}
                >
                  {inStock ? 'In stock' : 'Out of Stock'}
                </span>
              </div>
              <div className="flex flex-col gap-[16px]">
                <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
                  {product.title}
                </h1>
                <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(500)}>
                  {more || !longDescription ? product.description : `${product.description.slice(0, 150).trimEnd()}…`}{' '}
                  {longDescription && (
                    <button type="button" onClick={() => setMore((m) => !m)} className="text-[#007c53] max-md:py-[10px] max-md:-my-[10px]" style={jakarta(500)}>
                      {more ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </p>
                <div className="h-px w-full bg-[#f7f7f7]" />
                <div className="flex flex-col gap-[24px]">
                  <div className="flex flex-col gap-[4px]">
                    <p className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(500)}>
                      Price per {product.unit}
                    </p>
                    <div className="flex items-center justify-between gap-[16px]">
                      <p className="text-[#0c2310] text-[28px] leading-[35px]" style={jakarta(700)}>
                        {naira(product.priceNum)}
                      </p>
                      <span className="rounded-full px-[8px] py-[5px] text-[#007c53] text-[11px] leading-[14px]" style={{ ...jakarta(500), background: 'rgba(0,124,83,0.05)' }}>
                        {plural(product.available, product.unit)} available
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <span className="flex size-[36px] items-center justify-center rounded-full bg-[#f2f8f6]">
                      <img src={bagIcon} alt="" className="size-[16px]" />
                    </span>
                    <div className="flex flex-col gap-[2px]">
                      <p className="text-[#807e7e] text-[13px] leading-[16px]" style={jakarta(400)}>
                        Selling unit
                      </p>
                      <p className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>
                        {product.unit.charAt(0).toUpperCase() + product.unit.slice(1)}s
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Key facts (687:7143): 1px #f7f7f7 above and below, 18px padding, three 184px columns */}
              <div className="flex gap-[18px] border-y border-[#f7f7f7] py-[17px] max-md:gap-[12px]">
                {[
                  ['Location', product.location],
                  ['Available', plural(product.available, product.unit)],
                  ['MOQ', plural(product.moq, product.unit)],
                ].map(([label, value]) => (
                  <div key={label} className="flex w-[184px] flex-col gap-[4px] max-xl:w-auto max-xl:flex-1 max-xl:min-w-0">
                    <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                      {label}
                    </p>
                    <p className="text-[#0c2310] text-[16px] leading-[24px] truncate" style={jakarta(600)}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order quantity (687:7153) */}
            <div className="flex flex-col gap-[10px]">
              <p className="text-[#0c2310] text-[16px] leading-[24px]" style={jakarta(600)}>
                Order quantity
              </p>
              <div className="flex h-[52px] items-center justify-between rounded-full bg-[#f7f7f7] px-[18px]">
                <button type="button" onClick={() => setQuantity(quantity - 1)} aria-label="Decrease quantity" className="text-[#807e7e] text-[22px] leading-[28px] max-md:flex max-md:size-[44px] max-md:items-center max-md:justify-center max-md:-ml-[14px]" style={jakarta(500)}>
                  −
                </button>
                <span className="text-[#101604] text-[16px] leading-[20px]" style={jakarta(600)}>
                  {quantity}
                </span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity" className="text-[#807e7e] text-[22px] leading-[28px] max-md:flex max-md:size-[44px] max-md:items-center max-md:justify-center max-md:-mr-[14px]" style={jakarta(500)}>
                  +
                </button>
              </div>
            </div>

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
            <div className="flex gap-[16px] max-sm:flex-col">
              <button
                type="button"
                onClick={messageSeller}
                disabled={openingChat}
                className="flex h-[48px] flex-1 max-sm:flex-none items-center justify-center gap-[8px] rounded-[30px] bg-[#f7f7f7] px-[24px] text-[#101604] text-[14px] leading-[18px] disabled:opacity-60"
                style={jakarta(500)}
              >
                <img src={smsIcon} alt="" className="size-[20px]" />
                {openingChat ? 'Opening chat…' : 'Message seller'}
              </button>
              <button
                type="button"
                onClick={() => setWants('order')}
                disabled={!inStock}
                className="flex h-[48px] flex-1 max-sm:flex-none items-center justify-center gap-[8px] rounded-[30px] bg-[#007c53] px-[24px] text-white text-[14px] leading-[18px] disabled:opacity-60"
                style={jakarta(500)}
              >
                Place order
                <img src={arrowRight} alt="" className="size-[16px]" />
              </button>
            </div>
            )}
            {account && !mine && (
              <button
                type="button"
                onClick={() => saved.toggle(product)}
                aria-pressed={saved.isSaved(product.id)}
                className="flex h-[40px] w-fit items-center gap-[8px] text-[#007c53] text-[14px] leading-[18px]"
                style={jakarta(500)}
              >
                <img src={savedIcon} alt="" className="size-[20px]" />
                {saved.isSaved(product.id) ? 'Saved · remove' : 'Save for later'}
              </button>
            )}
            {actionError && (
              <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
                {actionError}
              </p>
            )}
          </div>
        </div>

        {/* Tabs (663:28946) */}
        <div className="mt-[40px] flex flex-col gap-[24px]">
          <div className={`flex items-center gap-[16px] ${SCROLL_MD}`} role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className="h-[39px] rounded-[30px] border px-[16px] text-[12px] leading-[15px] whitespace-nowrap shrink-0 max-md:h-[44px]"
                style={{ ...jakarta(500), color: tab === t.key ? '#007c53' : '#807e7e', borderColor: tab === t.key ? '#007c53' : 'transparent' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <>
              <p className="whitespace-pre-line text-[#101604] text-[16px] leading-[32px]" style={jakarta(400)}>
                {product.description}
              </p>
              {/* Supplier preview (663:28805): 112 tall, #f7f7f7, radius 16, 80px avatar */}
              <div className="flex items-center gap-[16px] rounded-[16px] bg-[#f7f7f7] p-[16px]">
                <span className="flex size-[80px] shrink-0 items-center justify-center rounded-[15px] bg-[#f2f8f6] text-[#007c53] text-[24px] max-md:size-[56px] max-md:text-[18px]" style={jakarta(700)}>
                  {initials(product.store.storeName)}
                </span>
                <div className="flex flex-1 flex-col gap-[8px] min-w-0">
                  <div className="flex items-center gap-[12px] max-md:flex-wrap max-md:gap-y-[4px]">
                    <p className="text-[#101604] text-[18px] leading-[24px] truncate max-md:text-[16px]" style={jakarta(600)}>
                      {product.store.storeName}
                    </p>
                    <span className="flex items-center gap-[4px] text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                      {summary.count ? (
                        <>
                          {summary.average.toFixed(1)}
                          <img src={star16} alt="" className="size-[16px]" />
                          <span className="italic" style={jakarta(500)}>
                            ({plural(summary.count, 'review')})
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
                    Seller on Earth · Member since {new Date(product.store.liveAt).getFullYear()} · {product.location}
                  </p>
                </div>
              </div>
            </>
          )}

          {tab === 'shipping' && <ShippingPanel />}
          {tab === 'reviews' && <ReviewsPanel reviews={reviews} summary={reviewsQuery.data?.summary} />}
        </div>
      </div>

      {ordering && <PlaceOrderModal listing={product} quantity={quantity} onClose={() => setWants(null)} />}
      {viewing !== null && <ImageViewer images={product.images} start={viewing} title={product.title} onClose={() => setViewing(null)} />}
      <SignInDialogs open={signInOpen} onClose={() => setWants(null)} redirectTo={location.pathname} />
    </div>
  )
}
