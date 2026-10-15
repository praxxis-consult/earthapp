import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import arrowRight from '../../assets/icons/arrow-right.svg'
import { useListGlobalQuery } from '../../feature/marketplace/catalogApiSlice'
import { useGetCategoriesQuery } from '../../feature/stores/storesApiSlice'
import type { Listing } from '../../lib/catalog'

const jakartaSemiBold = { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }
const jakartaMedium = { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }
const jakartaRegular = { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }

const ALL = 'All Resources'
/** The frame's grid (181:3042) holds six cards, three by two. */
const SHOWN = 6

/**
 * Landing catalogue (90:188): the title block, the category tabs, a 3×2 grid of 384×494 cards
 * and "Explore all Resources". The tabs are the API's categories and the cards are the newest
 * published listings everywhere the app knows, so what a visitor sees is what they can order.
 */
export default function MarketplaceCatalog() {
  const [active, setActive] = useState(ALL)
  const { data: categoryList = [] } = useGetCategoriesQuery()
  const { currentData, isFetching, error } = useListGlobalQuery()
  const tabs = [ALL, ...categoryList.map((c) => c.name)]
  const listings = useMemo(() => {
    const all = currentData?.listings ?? []
    return (active === ALL ? all : all.filter((l) => l.category === active)).slice(0, SHOWN)
  }, [currentData, active])
  // The catalogue fills in country by country; the skeleton stays only until the first cards land.
  const loading = (isFetching && currentData === undefined) || (currentData !== undefined && currentData.listings.length === 0 && currentData.pending.length > 0)
  const failed = Boolean(error) || Boolean(currentData && currentData.error && currentData.listings.length === 0 && currentData.pending.length === 0)

  return (
    <section className="w-full bg-white py-[64px]">
      <div className="max-w-[1200px] mx-auto max-xl:px-[24px] max-md:px-[16px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-[24px] max-lg:flex-col max-lg:gap-[16px]">
          <div className="w-[588px] flex flex-col gap-[8px] max-lg:w-full max-lg:max-w-[588px]">
            <h2
              className="text-[#101604] text-[48px] leading-[64px] tracking-[-0.96px] max-md:text-[32px] max-md:leading-[40px]"
              style={jakartaSemiBold}
            >
              From the Ground<br />to Your Daily Life
            </h2>
            <p className="text-[#807e7e] text-[16px] leading-[29.25px]" style={jakartaRegular}>
              Browse our live catalog of ethically sourced raw materials with transparent origins and lab-tested quality.
            </p>
          </div>
          {/* Link (670:30758): 192×48, 74px below the header top */}
          <Link
            to="/marketplace"
            className="mt-[74px] flex h-[48px] w-[192px] items-center justify-center rounded-[30px] text-[#007c53] text-[14px] leading-[18px] whitespace-nowrap max-lg:mt-0 max-lg:w-auto max-lg:justify-start"
            style={jakartaMedium}
          >
            Explore all Resources
          </Link>
        </div>

        {/* Category tabs (112:85): 40px pills, 12 apart; the active one green */}
        <div
          className="flex gap-[12px] items-center mb-[32px] max-lg:overflow-x-auto max-lg:-mx-[24px] max-lg:px-[24px] max-md:-mx-[16px] max-md:px-[16px]"
          style={{ scrollbarWidth: 'none' }}
          role="tablist"
          aria-label="Categories"
        >
          {tabs.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={cat === active}
              onClick={() => setActive(cat)}
              className={`px-[16px] py-[12px] rounded-[30px] text-[13px] leading-[16px] whitespace-nowrap shrink-0 ${
                cat === active ? 'bg-[#007c53] text-white' : 'bg-[#f7f7f7] text-[#807e7e]'
              }`}
              style={jakartaMedium}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid — 3×2 of 384×494 cards (113:94) */}
        {failed ? (
          <p role="alert" className="text-[#807e7e] text-[16px] leading-[24px]" style={jakartaRegular}>
            We could not load the catalogue. Check your connection and try again.
          </p>
        ) : loading ? (
          <div className="grid grid-cols-3 gap-[24px] max-lg:grid-cols-2 max-md:grid-cols-1" aria-busy="true">
            {Array.from({ length: SHOWN }, (_, i) => (
              <div key={i} className="h-[494px] rounded-[30px] bg-[#f7f7f7]" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakartaRegular}>
            {active === ALL ? 'The first listings are on their way.' : `Nothing listed under ${active} yet.`}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-[24px] max-lg:grid-cols-2 max-md:grid-cols-1">
            {listings.map((p) => (
              <CatalogCard key={p.id} listing={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function CatalogCard({ listing: p }: { listing: Listing }) {
  return (
    <div className="rounded-[30px] overflow-hidden flex flex-col shadow-[inset_0_0_0_1px_#e4dede]">
      {/* Image (115:100): 200 tall on #eee */}
      <div className="h-[200px] bg-[#eee] overflow-hidden shrink-0">
        {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" />}
      </div>
      {/* Content (118:206): 24px top, 16px sides, blocks 24 apart */}
      <div className="flex flex-col gap-[24px] p-[16px] pt-[24px] flex-1">
        <div className="flex flex-col gap-[8px]">
          <p className="text-[#101604] text-[18px] tracking-[-1px] leading-[24px] truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
            {p.title}
          </p>
          <p className="text-[#807e7e] text-[14px] leading-[24px] h-[48px] line-clamp-2" style={jakartaRegular}>
            {p.description}
          </p>
        </div>
        <div className="flex flex-col gap-[12px]">
          {[
            { label: 'Location', value: p.location },
            { label: 'Quantity', value: p.quantity },
            { label: 'Listed', value: p.listed },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-[12px] leading-[18px]">
              <span className="text-[#101604] text-[14px] shrink-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                {label}
              </span>
              <span className="text-[#807e7e] text-[14px] text-right truncate" style={jakartaRegular}>
                {value}
              </span>
            </div>
          ))}
        </div>
        {/* View details + Place order (118:198) */}
        <div className="flex items-center justify-between mt-auto max-lg:gap-[12px]">
          <Link
            to={`/marketplace/${p.id}`}
            className="bg-[#f7f7f7] text-[#101604] text-[14px] tracking-[-0.14px] h-[48px] w-[168px] rounded-[30px] flex items-center justify-center max-lg:w-auto max-lg:flex-1"
            style={jakartaMedium}
          >
            View details
          </Link>
          <Link
            to={`/marketplace/${p.id}/order`}
            className="h-[48px] w-[168px] rounded-[30px] flex items-center justify-center gap-[8px] max-lg:w-auto max-lg:flex-1"
            style={{ backgroundImage: 'linear-gradient(90deg, rgb(0, 124, 83) 0%, rgb(0, 124, 83) 100%)' }}
          >
            <span
              className="text-[14px] tracking-[-0.14px] bg-clip-text text-transparent"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
                backgroundImage: 'linear-gradient(177.52deg, rgb(255,255,255) 4.9851%, rgba(255,255,255,0.86) 85.731%)',
              }}
            >
              Place order
            </span>
            <img src={arrowRight} alt="" className="size-[16px]" />
          </Link>
        </div>
      </div>
    </div>
  )
}
