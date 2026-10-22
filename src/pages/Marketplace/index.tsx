import { Link } from 'react-router-dom'
import arrowRight from '../../assets/icons/mp-arrow-right.svg'
import searchIcon from '../../assets/icons/mp-search.svg'
import locationIcon from '../../assets/icons/mp-location.svg'
import arrowDown from '../../assets/icons/mp-arrow-down.svg'
import settingsIcon from '../../assets/icons/mp-settings.svg'
import BrowseControls from '../../components/marketplace/BrowseControls'
import Pager from '../../components/ui/Pager'
import { useBrowse } from '../../feature/marketplace/useBrowse'
import { jakarta } from '../../utils/styles'

/** The frame's grid (181:3041) is four rows of three 384×494 cards. */
const ITEMS_PER_PAGE = 12

const ICONS = { search: searchIcon, location: locationIcon, sort: settingsIcon, arrowDown }

/**
 * Marketplace (171:1851): title block, search + location + sort, category tabs with the count,
 * a 3×4 grid of listings and the pager. Listings come from the public catalogue: every store by
 * default, one country or one region of it when the picker narrows it.
 */
export default function Marketplace() {
  const b = useBrowse(ITEMS_PER_PAGE)
  const { storeId, store, loading, listings, emptyText, failed } = b

  return (
    // 171:1960 ends 66 below the pager (2656 → 2722)
    <div className="bg-white w-full pb-[66px] max-md:pb-[48px]">
      <div className="max-w-[1200px] mx-auto max-xl:px-[24px] max-md:px-[16px]">

        {/* ── Page header (171:1961): 892 wide, 64 below the nav, title and text 8 apart ── */}
        <div className="flex flex-col gap-[8px] pt-[64px] w-[892px] max-lg:w-full max-md:pt-[32px]">
          <h1
            className="text-[#0c2310] text-[48px] tracking-[-0.96px] leading-[64px] max-md:text-[32px] max-md:leading-[40px] max-md:tracking-[-0.64px]"
            style={jakarta(700)}
          >
            Products & Natural Resources
          </h1>
          <p className="text-[#807e7e] text-[16px] leading-[29.25px]" style={jakarta(400)}>
            Direct access to authenticated bulk agricultural harvests, battery minerals, precious bullion,
            clean energy, and sustainable timber. Explore live 30-day price trends, technical specifications,
            and origin ports with zero speculative markups.
          </p>
        </div>

        {storeId && !loading && (
          <p className="mt-[24px] text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
            {store ? (
              <>
                Showing listings from <span className="text-[#0c2310]" style={jakarta(600)}>{store.storeName}</span>, {store.businessAddress.area}, {store.businessAddress.region}.{' '}
              </>
            ) : (
              <>That store is not on the marketplace. </>
            )}
            <button type="button" onClick={b.showEveryStore} className="text-[#007c53]" style={jakarta(500)}>
              See every store
            </button>
          </p>
        )}

        {/* ── Search + filter controls (175:2625): 40 below the header, rows 24 apart ── */}
        <div className={storeId ? 'mt-[24px]' : 'mt-[40px]'}>
          <BrowseControls browse={b} icons={ICONS} />
        </div>

        {/* ── Listings (181:3041): 40 below the tabs, 3 × 384×494 cards 24 apart ── */}
        {loading ? (
          <div className="grid grid-cols-3 gap-[24px] mt-[40px] max-lg:grid-cols-2 max-md:grid-cols-1" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-[494px] rounded-[30px] bg-[#f7f7f7]" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <p role={failed ? 'alert' : undefined} className="mt-[40px] text-center py-[64px] text-[#807e7e] text-[16px]" style={jakarta(400)}>
            {emptyText}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-[24px] mt-[40px] max-lg:grid-cols-2 max-md:grid-cols-1">
            {listings.map((p) => (
              // Card (171:1980): 384×494 with the 1px #e4dede stroke inside, so it is drawn as an inset ring
              <div key={p.id} className="rounded-[30px] overflow-hidden flex flex-col shadow-[inset_0_0_0_1px_#e4dede]">
                {/* Image (171:1981): 200 tall on #eeeeee */}
                <div className="h-[200px] bg-[#eee] overflow-hidden shrink-0">
                  {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" />}
                </div>
                {/* Content (171:1983): 24 top, 16 sides and bottom, blocks 24 apart */}
                <div className="flex flex-col gap-[24px] p-[16px] pt-[24px] flex-1">
                  <div className="flex flex-col gap-[8px]">
                    {/* Title row (351:3189): name on the left, price right-aligned, 24 apart */}
                    <div className="flex items-center justify-between gap-[24px] text-[18px] leading-[24px]">
                      <p className="text-[#101604] tracking-[-1px] flex-1 min-w-0 truncate" style={jakarta(600)}>
                        {p.title}
                      </p>
                      {/* The frame shows the price alone; the unit is in the Quantity row and on the detail page. */}
                      <p className="text-[#007c53] whitespace-nowrap shrink-0" style={jakarta(700)} title={`${p.price} per ${p.unit}`}>
                        {p.price}
                      </p>
                    </div>
                    <p className="text-[#807e7e] text-[14px] leading-[24px] h-[48px] line-clamp-2" style={jakarta(400)}>
                      {p.description}
                    </p>
                  </div>
                  {/* Meta rows (171:1987): 18 tall, 12 apart */}
                  <div className="flex flex-col gap-[12px]">
                    {[
                      { label: 'Location', value: p.location },
                      { label: 'Quantity', value: p.quantity },
                      { label: 'Listed', value: p.listed },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between gap-[12px] leading-[18px]">
                        <span className="text-[#101604] text-[14px] shrink-0" style={jakarta(600)}>{label}</span>
                        <span className="text-[#807e7e] text-[14px] text-right truncate" style={jakarta(400)}>{value}</span>
                      </div>
                    ))}
                  </div>
                  {/* View details + Place order (171:2004): 168×48 each */}
                  <div className="flex items-center justify-between mt-auto max-lg:gap-[12px]">
                    <Link
                      to={`/marketplace/${p.id}`}
                      className="bg-[#f7f7f7] text-[#101604] text-[14px] tracking-[-0.14px] h-[48px] w-[168px] rounded-[30px] flex items-center justify-center max-lg:w-auto max-lg:flex-1"
                      style={jakarta(500)}
                    >
                      View details
                    </Link>
                    <Link
                      to={`/marketplace/${p.id}/order`}
                      className="h-[48px] w-[168px] rounded-[30px] flex items-center justify-center gap-[8px] max-lg:w-auto max-lg:flex-1"
                      style={{ background: 'rgb(0, 124, 83)' }}
                    >
                      <span
                        className="text-[14px] tracking-[-0.14px]"
                        style={{
                          ...jakarta(500),
                          background: 'linear-gradient(178.5deg, #fff 4.99%, rgba(255,255,255,0.86) 85.73%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        Place order
                      </span>
                      <img src={arrowRight} alt="" className="size-[16px]" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pager (177:2853): 24 below the grid, 1200×72 white, no frame ── */}
        {b.pageCount > 1 && (
          <div className="mt-[24px]">
            <Pager variant="plain" page={b.page} pageCount={b.pageCount} onChange={b.setPage} />
          </div>
        )}

      </div>
    </div>
  )
}
