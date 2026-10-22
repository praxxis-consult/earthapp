/**
 * What a listing page's tabs and panels share: the tab keys, the API's rating summary in the shape
 * the reviews panel draws, the shipping terms, and two small helpers.
 */
export type Tab = 'details' | 'shipping' | 'reviews'

/** The API's rating summary in the shape the tab draws: count, average and a share per star. */
export function summarise(s: { average: string | null; count: string; stars: { rating: number; count: string }[] } | undefined) {
  const count = Number(s?.count ?? 0) || 0
  const average = s?.average ? Number(s.average) : 0
  const share = [5, 4, 3, 2, 1].map((stars) => ({ stars, pct: count ? Math.round(((Number(s?.stars.find((b) => b.rating === stars)?.count ?? 0) || 0) / count) * 100) : 0 }))
  return { count, average, share }
}
export const TABS: { key: Tab; label: string }[] = [
  { key: 'details', label: 'Product details' },
  { key: 'shipping', label: 'Shipping and terms' },
  { key: 'reviews', label: 'Reviews' },
]

/** Figma 663:28951, character for character. */
export const SHIPPING_TERMS = [
  'All orders placed on Earth are fulfilled through our verified carrier network, providing real-time tracking from seller dispatch to doorstep delivery. Buyers retain full flexibility to cancel an order for an immediate, automatic refund at any point before the seller accepts the order and begins fulfillment. Once an order has been accepted or is actively in transit with our logistics partners, cancellations are disabled to protect shipment integrity and seller operations.',
  'If a seller is unable to process your request and declines the order, or if an order expires unaccepted, a 100% refund is automatically returned to your original payment method without escrow lockups or manual support requests. Earth securely holds all buyer funds in escrow throughout the transaction lifecycle, ensuring payments are only released to the seller upon verified delivery and buyer receipt.',
]

/** A row that scrolls sideways on phones (thumbnails, tabs) with the scrollbar hidden. */
export const SCROLL_MD = 'max-md:overflow-x-auto max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden'

export const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`

