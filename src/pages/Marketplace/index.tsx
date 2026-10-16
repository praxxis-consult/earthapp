import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import arrowRight from '../../assets/icons/mp-arrow-right.svg'
import searchIcon from '../../assets/icons/mp-search.svg'
import locationIcon from '../../assets/icons/mp-location.svg'
import arrowDown from '../../assets/icons/mp-arrow-down.svg'
import settingsIcon from '../../assets/icons/mp-settings.svg'
import Pager from '../../components/ui/Pager'
import { COUNTRIES, countryName, regionsOf } from '../../data/locations'
import { EVERYWHERE, useListCatalogQuery, useListStoreQuery, type Place } from '../../feature/marketplace/catalogApiSlice'
import { useGetCategoriesQuery } from '../../feature/stores/storesApiSlice'
import { jakarta } from '../../utils/styles'

/** The frame's grid (181:3041) is four rows of three 384×494 cards. */
const ITEMS_PER_PAGE = 12
/** The location picker's first choice (174:2565 "Location: Global"): every LIVE store on the marketplace. */
const GLOBAL = 'Global'
const ALL = 'All Resources'

const sortOptions = ['Most recent', 'Price: Low to High', 'Price: High to Low']

/**
 * Marketplace (171:1851): title block, search + location + sort, category tabs with the count,
 * a 3×4 grid of listings and the pager. Listings come from the public catalogue: every store by
 * default, one country or one region of it when the picker narrows it.
 */
export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState(ALL)
  const [search, setSearch] = useState('')
  // The catalogue narrows by country and region, so the picker is Global, a country, or a region of it.
  const [place, setPlace] = useState<Place>(EVERYWHERE)
  // "Share my store" links land here with ?store=<id>: one store's listings, its place in the picker.
  const [searchParams, setSearchParams] = useSearchParams()
  const storeId = searchParams.get('store') ?? ''
  const catalogListing = useListCatalogQuery(place, { skip: Boolean(storeId) })
  const storeListing = useListStoreQuery(storeId, { skip: !storeId })
  const listing = storeId ? storeListing : catalogListing
  const store = storeId ? (storeListing.currentData?.store ?? null) : null
  const { data: categoryList = [] } = useGetCategoriesQuery()
  // `currentData` is for the current place only, so changing the picker shows the skeleton, not the last place's cards.
  const loading = listing.isFetching || (listing.currentData === undefined && !listing.error)
  const products = useMemo(() => {
    if (loading) return []
    if (storeId) return storeListing.currentData?.listings ?? []
    return catalogListing.currentData ?? []
  }, [loading, storeId, storeListing.currentData, catalogListing.currentData])
  const failed = Boolean(listing.error)
  const loadError = failed ? 'We could not load the marketplace. Check your connection and try again.' : ''
  const placeLabel = (p: Place) => (p.region ? `${p.region}, ${countryName(p.country)}` : p.country ? countryName(p.country) : GLOBAL)
  const shownPlace = store ? placeLabel({ country: store.businessAddress.country, region: store.businessAddress.region }) : placeLabel(place)
  // The location menu: the country list first, then the chosen country's regions; a filter box for both.
  const [menuCountry, setMenuCountry] = useState('')
  const [placeFilter, setPlaceFilter] = useState('')
  const categoryNames = useMemo(() => categoryList.map((c) => c.name), [categoryList])
  const [sort, setSort] = useState('Most recent')
  const [page, setPage] = useState(1)
  const [locationOpen, setLocationOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  const categories = [ALL, ...categoryNames]
  function closeLocation() {
    setLocationOpen(false)
    setPlaceFilter('')
  }
  function choosePlace(next: Place) {
    setPlace(next)
    setPage(1)
    closeLocation()
  }
  const q = placeFilter.trim().toLowerCase()
  const menuCountries = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES
  const menuRegions = q ? regionsOf(menuCountry).filter((r) => r.toLowerCase().includes(q)) : regionsOf(menuCountry)
  const menuRow = (selected: boolean, extra = '') =>
    `w-full text-left px-[16px] py-[10px] text-[13px] leading-[20px] hover:bg-[#f7f7f7] transition-colors ${selected ? 'text-[#007c53]' : 'text-[#101604]'} ${extra}`

  // Close dropdowns on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) closeLocation()
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const filtered = products
    .filter((p) => {
      const matchCat = activeCategory === ALL || p.category === activeCategory
      const q = search.toLowerCase()
      const matchSearch =
        q === '' ||
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.store.storeName.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
    .sort((a, b) => {
      if (sort === 'Price: Low to High') return a.priceNum - b.priceNum
      if (sort === 'Price: High to Low') return b.priceNum - a.priceNum
      return 0 // Most recent — the catalogue is already newest first
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const current = Math.min(page, totalPages)
  const paginated = filtered.slice((current - 1) * ITEMS_PER_PAGE, current * ITEMS_PER_PAGE)
  const emptyText = loading
    ? ''
    : loadError ||
      (storeId
        ? 'This store has nothing listed yet.'
        : place.country
          ? `No listings in ${placeLabel(place)} match your filters yet.`
          : 'No listings match your filters yet.')

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
            <button type="button" onClick={() => setSearchParams({})} className="text-[#007c53]" style={jakarta(500)}>
              See every store
            </button>
          </p>
        )}

        {/* ── Search + filter controls (175:2625): 40 below the header, rows 24 apart ── */}
        <div className={`flex flex-col gap-[24px] ${storeId ? 'mt-[24px]' : 'mt-[40px]'}`}>

          {/* Row 1 (175:2624): search 588×48 on the left, the two pickers 16 apart on the right */}
          <div className="flex items-center justify-between max-lg:flex-col max-lg:items-stretch max-lg:gap-[12px]">

            {/* Search (173:2423) */}
            <label className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center px-[16px] rounded-[30px] w-[588px] max-lg:w-full">
              <img src={searchIcon} alt="" className="size-[20px] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by commodity name, location ..."
                aria-label="Search listings"
                className="bg-transparent outline-none text-[#101604] text-[13px] leading-[16px] w-full placeholder:text-[#807e7e]"
                style={jakarta(400)}
              />
            </label>

            <div className="flex gap-[16px] items-center max-md:flex-col max-md:items-stretch max-md:gap-[12px]">

              {/* Location (174:2563): 187×48 hugging "Location: Global", 500 13 #807e7e. The frame shows the
                  pill only; the menu is Global, then every country, then the chosen country's regions. */}
              <div className="relative max-md:w-full" ref={locationRef}>
                <button
                  type="button"
                  onClick={() => { if (storeId) return; if (locationOpen) closeLocation(); else { setMenuCountry(place.country); setLocationOpen(true) } setSortOpen(false) }}
                  title={storeId ? 'Showing one store; choose "See every store" to browse by location' : undefined}
                  aria-haspopup="listbox"
                  aria-expanded={locationOpen}
                  className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center justify-center px-[16px] rounded-[30px] max-md:w-full"
                >
                  <img src={locationIcon} alt="" className="size-[20px] shrink-0" />
                  <span className="text-[13px] leading-[16px] text-[#807e7e] whitespace-nowrap" style={jakarta(500)}>
                    Location: {shownPlace}
                  </span>
                  <img src={arrowDown} alt="" className={`size-[16px] shrink-0 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
                </button>
                {locationOpen && (
                  <div
                    role="listbox"
                    aria-label="Location"
                    className="absolute top-[52px] left-0 bg-white border border-[#e4dede] rounded-[16px] shadow-[0px_8px_32px_rgba(0,0,0,0.1)] z-50 w-[260px] max-md:w-full flex flex-col overflow-hidden"
                  >
                    <div className="p-[8px] pb-0">
                      <input
                        type="text"
                        value={placeFilter}
                        onChange={(e) => setPlaceFilter(e.target.value)}
                        placeholder={menuCountry ? `Find a region in ${countryName(menuCountry)}` : 'Find a country'}
                        aria-label={menuCountry ? 'Find a region' : 'Find a country'}
                        autoFocus
                        className="bg-[#f7f7f7] h-[40px] w-full rounded-[30px] px-[16px] text-[13px] leading-[20px] text-[#101604] outline-none placeholder:text-[#807e7e]"
                        style={jakarta(400)}
                      />
                    </div>
                    <div className="max-h-[320px] overflow-y-auto py-[4px]">
                      {menuCountry ? (
                        <>
                          <button type="button" onClick={() => { setMenuCountry(''); setPlaceFilter('') }} className={menuRow(false, 'text-[#807e7e]')} style={jakarta(500)}>
                            ← All countries
                          </button>
                          <button
                            type="button"
                            role="option"
                            aria-selected={place.country === menuCountry && !place.region}
                            onClick={() => choosePlace({ country: menuCountry, region: '' })}
                            className={menuRow(place.country === menuCountry && !place.region, 'border-b border-[#f7f7f7]')}
                            style={jakarta(600)}
                          >
                            All of {countryName(menuCountry)}
                          </button>
                          {menuRegions.map((r) => (
                            <button
                              key={r}
                              type="button"
                              role="option"
                              aria-selected={place.country === menuCountry && place.region === r}
                              onClick={() => choosePlace({ country: menuCountry, region: r })}
                              className={menuRow(place.country === menuCountry && place.region === r)}
                              style={jakarta(place.country === menuCountry && place.region === r ? 600 : 400)}
                            >
                              {r}
                            </button>
                          ))}
                          {menuRegions.length === 0 && (
                            <p className="px-[16px] py-[10px] text-[13px] leading-[20px] text-[#807e7e]" style={jakarta(400)}>
                              {q ? 'No region matches.' : 'No regions listed for this country.'}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          {!q && (
                            <button
                              type="button"
                              role="option"
                              aria-selected={!place.country}
                              onClick={() => choosePlace(EVERYWHERE)}
                              className={menuRow(!place.country, 'border-b border-[#f7f7f7]')}
                              style={jakarta(600)}
                            >
                              {GLOBAL}
                            </button>
                          )}
                          {menuCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => { setMenuCountry(c.code); setPlaceFilter('') }}
                              className={`${menuRow(place.country === c.code)} flex items-center justify-between gap-[8px]`}
                              style={jakarta(place.country === c.code ? 600 : 400)}
                            >
                              <span className="truncate">{c.name}</span>
                              <span className="text-[#807e7e] shrink-0">›</span>
                            </button>
                          ))}
                          {menuCountries.length === 0 && (
                            <p className="px-[16px] py-[10px] text-[13px] leading-[20px] text-[#807e7e]" style={jakarta(400)}>
                              No country matches.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sort (174:2481): 193×48 hugging "Sort: Most recent" */}
              <div className="relative max-md:w-full" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => { setSortOpen((o) => !o); setLocationOpen(false) }}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center justify-center px-[16px] rounded-[30px] max-md:w-full"
                >
                  <img src={settingsIcon} alt="" className="size-[20px] shrink-0" />
                  <span className="text-[13px] leading-[16px] text-[#807e7e] whitespace-nowrap" style={jakarta(500)}>
                    Sort: {sort}
                  </span>
                  <img src={arrowDown} alt="" className={`size-[16px] shrink-0 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div
                    role="listbox"
                    aria-label="Sort"
                    className="absolute top-[52px] right-0 bg-white border border-[#e4dede] rounded-[16px] shadow-[0px_8px_32px_rgba(0,0,0,0.1)] z-50 min-w-[193px] overflow-hidden"
                  >
                    {sortOptions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        role="option"
                        aria-selected={s === sort}
                        onClick={() => { setSort(s); setSortOpen(false); setPage(1) }}
                        className={`w-full text-left px-[16px] py-[10px] text-[13px] hover:bg-[#f7f7f7] transition-colors ${
                          s === sort ? 'text-[#007c53]' : 'text-[#101604]'
                        }`}
                        style={jakarta(s === sort ? 600 : 400)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Row 2 (174:2471): 40px category pills 12 apart, the count right-aligned on the same line.
              The API has more categories than the frame's five, so the pills scroll sideways under a
              hidden scrollbar instead of pushing the count onto a second line. */}
          <div className="flex items-center justify-between gap-[24px] max-xl:flex-col max-xl:items-start max-xl:gap-[12px]">
            <div
              role="tablist"
              aria-label="Categories"
              className="flex gap-[12px] items-center min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-xl:w-full"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat}
                  onClick={() => { setActiveCategory(cat); setPage(1) }}
                  className={`h-[40px] px-[16px] rounded-[30px] text-[13px] leading-[16px] whitespace-nowrap shrink-0 transition-colors ${
                    activeCategory === cat ? 'bg-[#007c53] text-white' : 'bg-[#f7f7f7] text-[#807e7e]'
                  }`}
                  style={jakarta(500)}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* 174:2470: "Showing 12 of 12 commodities", 400 14/24 #807e7e */}
            <span className="text-[14px] leading-[24px] text-[#807e7e] whitespace-nowrap shrink-0" style={jakarta(400)} aria-live="polite">
              Showing {paginated.length} of {filtered.length} commodities
            </span>
          </div>
        </div>

        {/* ── Listings (181:3041): 40 below the tabs, 3 × 384×494 cards 24 apart ── */}
        {loading ? (
          <div className="grid grid-cols-3 gap-[24px] mt-[40px] max-lg:grid-cols-2 max-md:grid-cols-1" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-[494px] rounded-[30px] bg-[#f7f7f7]" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <p role={loadError ? 'alert' : undefined} className="mt-[40px] text-center py-[64px] text-[#807e7e] text-[16px]" style={jakarta(400)}>
            {emptyText}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-[24px] mt-[40px] max-lg:grid-cols-2 max-md:grid-cols-1">
            {paginated.map((p) => (
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
        {totalPages > 1 && (
          <div className="mt-[24px]">
            <Pager variant="plain" page={current} pageCount={totalPages} onChange={setPage} />
          </div>
        )}

      </div>
    </div>
  )
}
