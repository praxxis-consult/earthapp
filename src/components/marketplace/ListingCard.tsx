import { Link } from 'react-router-dom'
import arrowRight from '../../assets/icons/rc-arrow-right.svg'
import { jakarta } from '../../utils/styles'

export interface ListingCardData {
  id: string
  title: string
  price: string
  unit: string
  description: string
  image: string | null
  location: string
  /** "Bag, up to 70 kg", as the Sold as row shows it. */
  soldAs: string
  listed: string
}

interface ListingCardProps {
  listing: ListingCardData
  /** The grey 156×48 button on the left: a link or an action. */
  secondary: { label: string; to?: string; onClick?: () => void }
  /** The green 157×48 button on the right. */
  primary: { label: string; onClick: () => void; disabled?: boolean }
}

/**
 * The dashboard's listing card (817:9855 on the marketplace, 857:33762 on the saved list):
 * 354×502, white with the 1px #e4dede stroke inside and radius 30; the 200px photo on #eeeeee;
 * then 24 above and below, 16 at the sides: the name (600 16/24) with the price (700 18/24,
 * #007c53) on one row, two lines of copy, three 18px fact rows 12 apart, and the two buttons.
 */
export default function ListingCard({ listing: p, secondary, primary }: ListingCardProps) {
  const secondaryClass = 'bg-[#f7f7f7] text-[#101604] text-[14px] leading-[18px] h-[48px] flex-1 rounded-[30px] flex items-center justify-center px-[28px] max-lg:px-[16px]'
  return (
    <li className="bg-white rounded-[30px] overflow-hidden flex flex-col shadow-[inset_0_0_0_1px_#e4dede]">
      <div className="h-[200px] bg-[#eeeeee] overflow-hidden shrink-0">
        {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" />}
      </div>
      <div className="flex flex-col gap-[24px] px-[16px] py-[24px] flex-1">
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between gap-[16px]">
            <p className="text-[#101604] text-[16px] leading-[24px] flex-1 min-w-0 truncate" style={jakarta(600)}>
              {p.title}
            </p>
            <p className="text-[#007c53] text-[18px] leading-[24px] whitespace-nowrap shrink-0" style={jakarta(700)} title={`${p.price} per ${p.unit}`}>
              {p.price}
            </p>
          </div>
          <p className="text-[#807e7e] text-[14px] leading-[24px] h-[48px] line-clamp-2" style={jakarta(400)}>
            {p.description}
          </p>
        </div>
        <div className="flex flex-col gap-[12px]">
          {[
            { label: 'Location', value: p.location },
            { label: 'Sold as', value: p.soldAs },
            { label: 'Listed', value: p.listed },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-[12px] leading-[18px]">
              <span className="text-[#101604] text-[14px] shrink-0" style={jakarta(600)}>{label}</span>
              <span className="text-[#807e7e] text-[14px] text-right truncate" style={jakarta(400)}>{value || '—'}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-[8px] mt-auto">
          {secondary.to ? (
            <Link to={secondary.to} className={secondaryClass} style={jakarta(500)}>
              {secondary.label}
            </Link>
          ) : (
            <button type="button" onClick={secondary.onClick} className={secondaryClass} style={jakarta(500)}>
              {secondary.label}
            </button>
          )}
          <button
            type="button"
            onClick={primary.onClick}
            disabled={primary.disabled}
            className="h-[48px] flex-1 rounded-[30px] flex items-center justify-center gap-[8px] bg-[#007c53] px-[24px] max-lg:px-[16px] disabled:opacity-60"
          >
            <span
              className="text-[14px] leading-[18px]"
              style={{ ...jakarta(500), background: 'linear-gradient(178.5deg, #fff 4.99%, rgba(255,255,255,0.86) 85.73%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {primary.label}
            </span>
            <img src={arrowRight} alt="" className="size-[16px]" />
          </button>
        </div>
      </div>
    </li>
  )
}
