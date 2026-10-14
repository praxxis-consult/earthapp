import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PlaceOrderModal from '../../components/ui/PlaceOrderModal'
import { useGetListingQuery } from '../../feature/marketplace/catalogApiSlice'
import { useAuth } from '../../feature/authentication/useAuth'
import { addReview, summarise, timeAgo, useReviews } from '../../lib/reviews'
import { naira } from '../../lib/productView'
import { initials } from '../../data/orders'
import backIcon from '../../assets/icons/pd-back-16.svg'
import plusIcon from '../../assets/icons/pd-plus.svg'
import bagIcon from '../../assets/icons/pd-bag.svg'
import smsIcon from '../../assets/icons/pd-sms.svg'
import arrowRight from '../../assets/icons/pd-arrow-right-16.svg'
import arrowDown from '../../assets/icons/pd-arrow-down-16.svg'
import documentIcon from '../../assets/icons/pd-document-text.svg'
import importIcon from '../../assets/icons/pd-import-24.svg'
import star20 from '../../assets/icons/pd-star-20.svg'
import starLight20 from '../../assets/icons/pd-star-light-20.svg'
import star16 from '../../assets/icons/pd-star-16.svg'
import starLight14 from '../../assets/icons/pd-star-light-14.svg'
import reviewStarOn from '../../assets/icons/pd-review-star-on.svg'
import reviewStarOff from '../../assets/icons/pd-review-star-off.svg'
import rateStar from '../../assets/icons/pd-rate-star-35.svg'
import { jakarta } from '../../utils/styles'

type Tab = 'details' | 'shipping' | 'reviews'
const TABS: { key: Tab; label: string }[] = [
  { key: 'details', label: 'Product details' },
  { key: 'shipping', label: 'Shipping and terms' },
  { key: 'reviews', label: 'Reviews' },
]

/** Figma 663:28951, character for character. */
const SHIPPING_TERMS = [
  'All orders placed on Earth are fulfilled through our verified carrier network, providing real-time tracking from seller dispatch to doorstep delivery. Buyers retain full flexibility to cancel an order for an immediate, automatic refund at any point before the seller accepts the order and begins fulfillment. Once an order has been accepted or is actively in transit with our logistics partners, cancellations are disabled to protect shipment integrity and seller operations.',
  'If a seller is unable to process your request and declines the order, or if an order expires unaccepted, a 100% refund is automatically returned to your original payment method without escrow lockups or manual support requests. Earth securely holds all buyer funds in escrow throughout the transaction lifecycle, ensuring payments are only released to the seller upon verified delivery and buyer receipt.',
]

/** A row that scrolls sideways on phones (thumbnails, tabs) with the scrollbar hidden. */
const SCROLL_MD = 'max-md:overflow-x-auto max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden'

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`

/** Five stars at a size, the first `filled` lit (Figma "ic:round-star" / "ph:star-light"). */
function Stars({ filled, size }: { filled: number; size: 20 | 16 }) {
  const on = size === 20 ? star20 : star16
  const off = size === 20 ? starLight20 : starLight14
  return (
    <span className="flex items-center gap-[4px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="flex items-center justify-center" style={{ width: size, height: size }}>
          <img src={i <= filled ? on : off} alt="" style={{ width: i <= filled ? size : size - 2, height: i <= filled ? size : size - 2 }} />
        </span>
      ))}
    </span>
  )
}

/**
 * Figma "product details" (663:28852 shipping tab, 666:29323 reviews tab, 328:2262 details tab):
 * Back at 120/160, the 588×480 gallery (397 main + three 175×150 thumbs, the last counting the
 * rest), the 588 panel at 732 (badges, name, description, price, selling unit, key facts, the
 * quantity control, Message seller / Place order), then the three tabs at 854 and their content.
 */
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { account } = useAuth()
  // undefined while loading, null when the API has no such public listing
  const product = useGetListingQuery(id ?? '', { skip: !id }).currentData
  const reviews = useReviews(id ?? '')
  const [tab, setTab] = useState<Tab>('details')
  const [more, setMore] = useState(false)
  const [qty, setQty] = useState<{ id: string; qty: number } | null>(null)
  const [ordering, setOrdering] = useState(false)
  const [shown, setShown] = useState(3)
  const [draftRating, setDraftRating] = useState(0)
  const [draftText, setDraftText] = useState('')
  const [reviewNote, setReviewNote] = useState('')

  if (!product) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-[#807e7e] text-[16px]" style={jakarta(400)}>
          {product === undefined ? 'Loading…' : 'This listing is not available.'}
        </p>
      </div>
    )
  }

  const quantity = qty && qty.id === product.id ? qty.qty : product.moq
  const setQuantity = (n: number) => setQty({ id: product.id, qty: Math.min(Math.max(product.moq, n), Math.max(product.available, product.moq)) })
  const inStock = product.available > 0
  const thumbs = product.images.slice(1, 4)
  const extra = Math.max(0, product.images.length - 4)
  const summary = summarise(reviews)
  const longDescription = product.description.length > 150

  function submitReview() {
    if (!draftRating) return setReviewNote('Tap a star to rate this listing.')
    if (!draftText.trim()) return setReviewNote('Write a few words about the product.')
    addReview({
      productId: product!.id,
      author: account ? `${account.firstName} ${account.lastName}` : 'A buyer',
      rating: draftRating as 1 | 2 | 3 | 4 | 5,
      text: draftText.trim(),
    })
    setDraftRating(0)
    setDraftText('')
    setReviewNote('Thanks. Your review is saved on this device until reviews reach the platform.')
  }

  return (
    <div className="bg-white w-full pb-[80px]">
      <div className="max-w-[1200px] mx-auto pt-[64px] max-xl:px-[24px] max-md:px-[16px] max-md:pt-[32px]">
        <button type="button" onClick={() => navigate(-1)} className="flex gap-[8px] items-center">
          <img src={backIcon} alt="" className="size-[16px]" />
          <span className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500)}>
            Back
          </span>
        </button>

        <div className="mt-[40px] flex gap-[24px] items-start max-lg:flex-col max-md:mt-[24px]">
          {/* Gallery (663:28963) */}
          <div className="flex w-[588px] shrink-0 gap-[16px] max-xl:w-auto max-xl:flex-1 max-xl:min-w-0 max-lg:w-full max-lg:flex-none max-md:flex-col">
            <div className="h-[480px] w-[397px] overflow-hidden rounded-[20px] bg-[#ededed] max-xl:w-auto max-xl:flex-1 max-xl:min-w-0 max-md:flex-none max-md:w-full max-md:h-auto max-md:aspect-[4/3]">
              {product.image && <img src={product.image} alt={product.title} className="size-full object-cover" />}
            </div>
            <div className={`flex w-[175px] flex-col gap-[16px] max-md:w-full max-md:flex-row ${SCROLL_MD}`}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="relative h-[150px] overflow-hidden rounded-[20px] bg-[#ededed] max-md:h-[96px] max-md:w-[96px] max-md:shrink-0 max-md:rounded-[16px]">
                  {thumbs[i] && <img src={thumbs[i]} alt="" className="size-full object-cover" />}
                  {i === 2 && extra > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center gap-[8px]" style={{ background: 'linear-gradient(180deg, rgba(20,20,20,0) 0%, #141414 100%)' }}>
                      <img src={plusIcon} alt="" className="size-[20px]" />
                      <span className="text-white text-[32px] leading-[48px] max-md:text-[20px] max-md:leading-[28px]" style={jakarta(600)}>
                        {extra}
                      </span>
                    </div>
                  )}
                </div>
              ))}
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
                    <button type="button" onClick={() => setMore((m) => !m)} className="text-[#007c53]" style={jakarta(500)}>
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
                <button type="button" onClick={() => setQuantity(quantity - 1)} aria-label="Decrease quantity" className="text-[#807e7e] text-[22px] leading-[28px]" style={jakarta(500)}>
                  −
                </button>
                <span className="text-[#101604] text-[16px] leading-[20px]" style={jakarta(600)}>
                  {quantity}
                </span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity" className="text-[#807e7e] text-[22px] leading-[28px]" style={jakarta(500)}>
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-[16px] max-sm:flex-col">
              <button
                type="button"
                title="Buyer messaging opens with the messaging API"
                className="flex h-[48px] flex-1 max-sm:flex-none items-center justify-center gap-[8px] rounded-[30px] bg-[#f7f7f7] px-[24px] text-[#101604] text-[14px] leading-[18px]"
                style={jakarta(500)}
              >
                <img src={smsIcon} alt="" className="size-[20px]" />
                Message seller
              </button>
              <button
                type="button"
                onClick={() => setOrdering(true)}
                disabled={!inStock}
                className="flex h-[48px] flex-1 max-sm:flex-none items-center justify-center gap-[8px] rounded-[30px] bg-[#007c53] px-[24px] text-white text-[14px] leading-[18px] disabled:opacity-60"
                style={jakarta(500)}
              >
                Place order
                <img src={arrowRight} alt="" className="size-[16px]" />
              </button>
            </div>
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
                className="h-[39px] rounded-[30px] border px-[16px] text-[12px] leading-[15px] whitespace-nowrap shrink-0"
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

          {tab === 'shipping' && (
            <>
              <div className="text-[#101604] text-[16px] leading-[32px]" style={jakarta(400)}>
                {SHIPPING_TERMS.map((p) => (
                  <p key={p.slice(0, 20)}>{p}</p>
                ))}
              </div>
              {/* 666:29259 */}
              <div className="flex items-center gap-[16px] rounded-[16px] bg-[#f7f7f7] p-[16px] max-md:flex-wrap">
                <span className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-[#f2f8f6]">
                  <img src={documentIcon} alt="" className="size-[20px]" />
                </span>
                <div className="flex flex-1 flex-col gap-[4px]">
                  <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
                    Shipping &amp; refund policy
                  </p>
                  <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                    Read our terms on order fulfillment, cancellations, and payouts.
                  </p>
                </div>
                <button type="button" title="The policy document is on its way" className="flex h-[32px] items-center gap-[8px] rounded-[30px] px-[8px] text-[#007c53] text-[14px] leading-[18px]" style={jakarta(500)}>
                  <img src={importIcon} alt="" className="size-[24px]" />
                  Download
                </button>
              </div>
            </>
          )}

          {tab === 'reviews' && (
            <div className="flex flex-col gap-[40px]">
              {/* Summary (668:30257): the average, its stars and the five share bars */}
              <div className="flex w-[711px] items-center gap-[24px] max-lg:w-full max-md:flex-col max-md:items-stretch max-md:gap-[16px]">
                <div className="flex w-[116px] flex-col items-center gap-[16px] max-md:w-full">
                  <p className="text-[#101604] text-[56px] leading-[71px]" style={jakarta(700)}>
                    {summary.count ? summary.average.toFixed(1) : '0.0'}
                  </p>
                  <Stars filled={Math.round(summary.average)} size={20} />
                  <p className="text-[#101604] text-[14px] leading-[24px] whitespace-nowrap" style={jakarta(400)}>
                    {summary.count ? `${summary.count} Buyer Rating${summary.count === 1 ? '' : 's'}` : 'No buyer ratings yet'}
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-[8px] max-md:w-full">
                  {summary.share.map((row) => (
                    <div key={row.stars} className="flex h-[24px] items-center gap-[12px]">
                      <div className="relative h-[5px] w-[424px] rounded-[25px] max-lg:w-auto max-lg:flex-1" style={{ background: 'rgba(0,124,83,0.05)' }}>
                        <div className="absolute -top-px left-0 h-[7px] rounded-[25px] bg-[#007c53]" style={{ width: `${row.pct}%` }} />
                      </div>
                      <div className="flex shrink-0 items-center gap-[12px]">
                        <Stars filled={row.stars} size={16} />
                        <span className="text-[#101604] text-[14px] leading-[24px] w-[32px]" style={jakarta(400)}>
                          {row.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews (668:30172) */}
              {reviews.length > 0 && (
                <div className="flex flex-col gap-[32px]">
                  {reviews.slice(0, shown).map((r) => (
                    <article key={r.id} className="flex flex-col gap-[16px]">
                      <div className="flex gap-[8px]">
                        <span className="flex size-[56px] shrink-0 items-center justify-center rounded-full bg-[#f2f8f6] text-[#007c53] text-[16px]" style={jakarta(700)}>
                          {initials(r.author)}
                        </span>
                        <div className="flex min-w-0 flex-col gap-[8px]">
                          <p className="text-[#121212] text-[18px] leading-[24px]" style={jakarta(600)}>
                            {r.author}
                          </p>
                          <div className="flex items-center gap-[8px] max-md:flex-wrap">
                            <span className="flex items-center gap-[4px]">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <img key={i} src={i <= r.rating ? reviewStarOn : reviewStarOff} alt="" className="size-[20px]" />
                              ))}
                            </span>
                            <span className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                              {timeAgo(r.at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[#101604] text-[16px] leading-[32px]" style={jakarta(400)}>
                        {r.text}
                      </p>
                    </article>
                  ))}
                  {reviews.length > shown && (
                    <button type="button" onClick={() => setShown((n) => n + 3)} className="flex w-fit items-center gap-[8px] text-[#007c53] text-[14px] leading-[24px]" style={jakarta(500)}>
                      Show more
                      <img src={arrowDown} alt="" className="size-[16px]" />
                    </button>
                  )}
                </div>
              )}

              {/* Write a review (668:30220) */}
              <div className="flex flex-col gap-[24px]">
                <p className="text-black text-[18px] leading-[24px]" style={jakarta(600)}>
                  Write a review
                </p>
                <div className="flex items-center gap-[16px]" role="radiogroup" aria-label="Your rating">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={draftRating === i}
                      aria-label={`${i} star${i === 1 ? '' : 's'}`}
                      onClick={() => setDraftRating(i)}
                      className="size-[35px]"
                    >
                      <img src={i <= draftRating ? reviewStarOn : rateStar} alt="" className="size-[35px]" />
                    </button>
                  ))}
                </div>
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Start typing here"
                  aria-label="Your review"
                  className="h-[160px] w-full resize-none rounded-[20px] bg-[#f7f7f7] p-[16px] text-[#101604] text-[14px] leading-[24px] outline-none placeholder:text-[#807e7e]"
                  style={jakarta(400)}
                />
                {reviewNote && (
                  <p role="status" className="text-[#007c53] text-[13px] leading-[20px]" style={jakarta(400)}>
                    {reviewNote}
                  </p>
                )}
                <button type="button" onClick={submitReview} className="flex h-[48px] w-full items-center justify-center rounded-[30px] bg-[#007c53] text-white text-[14px] leading-[18px]" style={jakarta(500)}>
                  Submit review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {ordering && <PlaceOrderModal onClose={() => setOrdering(false)} />}
    </div>
  )
}
