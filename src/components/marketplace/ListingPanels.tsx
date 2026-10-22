import { useState } from 'react'
import type { Review, ReviewSummary } from '../../feature/reviews/reviewsApiSlice'
import { initials } from '../../data/orders'
import { timeAgo } from '../../lib/reviews'
import arrowDown from '../../assets/icons/pd-arrow-down-16.svg'
import documentIcon from '../../assets/icons/pd-document-text.svg'
import importIcon from '../../assets/icons/pd-import-24.svg'
import star20 from '../../assets/icons/pd-star-20.svg'
import starLight20 from '../../assets/icons/pd-star-light-20.svg'
import star16 from '../../assets/icons/pd-star-16.svg'
import starLight14 from '../../assets/icons/pd-star-light-14.svg'
import reviewStarOn from '../../assets/icons/pd-review-star-on.svg'
import reviewStarOff from '../../assets/icons/pd-review-star-off.svg'
import { jakarta } from '../../utils/styles'
import { SHIPPING_TERMS, summarise } from '../../lib/listing'

/**
 * The "Shipping and terms" and "Reviews" panels of a listing page, shared by the public listing
 * (666:29323 / 668:30257) and the buyer dashboard's (818:10697): the terms with the policy row,
 * and the rating summary, the reviews three at a time, and where a review comes from.
 */
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

export function ShippingPanel() {
  return (
    <>
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
    </>
  )
}

export function ReviewsPanel({ reviews, summary: raw }: { reviews: Review[]; summary: ReviewSummary | undefined }) {
  const summary = summarise(raw)
  const [shown, setShown] = useState(3)
  return (
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
                          {initials(r.author.name)}
                        </span>
                        <div className="flex min-w-0 flex-col gap-[8px]">
                          <p className="text-[#121212] text-[18px] leading-[24px]" style={jakarta(600)}>
                            {r.author.name}
                          </p>
                          <div className="flex items-center gap-[8px] max-md:flex-wrap">
                            <span className="flex items-center gap-[4px]">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <img key={i} src={i <= r.rating ? reviewStarOn : reviewStarOff} alt="" className="size-[20px]" />
                              ))}
                            </span>
                            <span className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                              {timeAgo(r.createdAt)}
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

              {/* Write a review (668:30220): the API takes a review only against a completed order, so the form opens from the order once it is delivered. */}
              <div className="flex flex-col gap-[24px]">
                <p className="text-black text-[18px] leading-[24px]" style={jakarta(600)}>
                  Write a review
                </p>
                <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                  Reviews come from buyers who received this product. Once your order is delivered, you can rate it from the order.
                </p>
              </div>
            </div>
  )
}
