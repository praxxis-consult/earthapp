import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import arrowRight from '../../assets/icons/mp-arrow-right.svg'
import searchIcon from '../../assets/icons/mp-search.svg'
import locationIcon from '../../assets/icons/mp-location.svg'
import arrowDown from '../../assets/icons/mp-arrow-down.svg'
import settingsIcon from '../../assets/icons/mp-settings.svg'
import arrowLeft from '../../assets/icons/mp-arrow-left.svg'
import { DEFAULT_REGION, REGIONS } from '../../lib/catalog'
import { useListRegionQuery, useListStoreQuery } from '../../feature/marketplace/catalogApiSlice'
import { useGetCategoriesQuery } from '../../feature/stores/storesApiSlice'

const jakarta = (weight: number) => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

const ITEMS_PER_PAGE = 9

const sortOptions = ['Most recent', 'Price: Low to High', 'Price: High to Low']

export default function Marketplace() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All Resources')
  const [search, setSearch] = useState('')
  // The catalogue API lists stores per region, so the location picker is the region (Nigeria's states).
  const [location, setLocation] = useState(DEFAULT_REGION)
  // "Share my store" links land here with ?store=<id>: one store's listings, its region in the picker.
  const [searchParams, setSearchParams] = useSearchParams()
  const storeId = searchParams.get('store') ?? ''
  const regionListing = useListRegionQuery({ region: location }, { skip: Boolean(storeId) })
  const storeListing = useListStoreQuery(storeId, { skip: !storeId })
  const listing = storeId ? storeListing : regionListing
  const store = storeId ? (storeListing.currentData?.store ?? null) : null
  const { data: categoryList = [] } = useGetCategoriesQuery()
  const loading = listing.isFetching || (listing.currentData === undefined && !listing.error)
  const products = useMemo(() => {
    if (loading) return []
    if (storeId) return storeListing.currentData?.listings ?? []
    return regionListing.currentData ?? []
  }, [loading, storeId, storeListing.currentData, regionListing.currentData])
  const loadError = listing.error ? 'We could not load the marketplace. Check your connection and try again.' : ''
  const shownRegion = store?.businessAddress.region ?? location
  const categoryNames = useMemo(() => categoryList.map((c) => c.name), [categoryList])
  const [sort, setSort] = useState('Most recent')
  const [page, setPage] = useState(1)
  const [locationOpen, setLocationOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  const categories = ['All Resources', ...categoryNames]

  // Close dropdowns on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) setLocationOpen(false)
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])


  const filtered = products
    .filter((p) => {
      const matchCat = activeCategory === 'All Resources' || p.category === activeCategory
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
      return 0 // Most recent — preserve original order
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="bg-white w-full pb-[120px] max-md:pb-[64px]">
      <div className="max-w-[1200px] mx-auto max-xl:px-[24px] max-md:px-[16px]">

        {/* ── Page header ── */}
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

        {/* ── Search + filter controls ── */}
        <div className={`flex flex-col gap-[24px] ${storeId ? 'mt-[24px]' : 'mt-[40px]'}`}>

          {/* Row 1: search + dropdowns */}
          <div className="flex items-center justify-between max-lg:flex-col max-lg:items-stretch max-lg:gap-[12px]">

            {/* Search */}
            <div className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center px-[16px] rounded-[30px] w-[588px] max-lg:w-full">
              <img src={searchIcon} alt="" className="size-[20px] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by commodity name, location ..."
                className="bg-transparent outline-none text-[#807e7e] text-[13px] w-full placeholder:text-[#807e7e]"
                style={jakarta(400)}
              />
            </div>

            <div className="flex gap-[16px] items-center max-md:flex-col max-md:items-stretch max-md:gap-[12px]">

              {/* Location dropdown */}
              <div className="relative max-md:w-full" ref={locationRef}>
                <button
                  onClick={() => { if (storeId) return; setLocationOpen((o) => !o); setSortOpen(false) }}
                  title={storeId ? 'Showing one store; choose "See every store" to browse by state' : undefined}
                  className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center justify-center px-[16px] rounded-[30px] cursor-pointer max-md:w-full"
                >
                  <img src={locationIcon} alt="" className="size-[20px] shrink-0" />
                  <span className="text-[13px]" style={jakarta(500)}>
                    <span className="text-[#807e7e]">Location: </span>
                    <span className="text-[#101604]" style={jakarta(600)}>{shownRegion}</span>
                  </span>
                  <img src={arrowDown} alt="" className={`size-[16px] shrink-0 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
                </button>
                {locationOpen && (
                  <div className="absolute top-[52px] left-0 bg-white border border-[#e4dede] rounded-[16px] shadow-[0px_8px_32px_rgba(0,0,0,0.1)] z-50 min-w-[180px] overflow-hidden max-md:w-full max-md:max-h-[320px] max-md:overflow-y-auto">
                    {REGIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setLocation(c); setLocationOpen(false); setPage(1) }}
                        className={`w-full text-left px-[16px] py-[10px] text-[13px] hover:bg-[#f7f7f7] transition-colors ${
                          c === location ? 'text-[#007c53]' : 'text-[#101604]'
                        }`}
                        style={jakarta(c === location ? 600 : 400)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort dropdown */}
              <div className="relative max-md:w-full" ref={sortRef}>
                <button
                  onClick={() => { setSortOpen((o) => !o); setLocationOpen(false) }}
                  className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center justify-center px-[16px] rounded-[30px] cursor-pointer max-md:w-full"
                >
                  <img src={settingsIcon} alt="" className="size-[20px] shrink-0" />
                  <span className="text-[13px]" style={jakarta(500)}>
                    <span className="text-[#807e7e]">Sort: </span>
                    <span className="text-[#101604]" style={jakarta(600)}>{sort}</span>
                  </span>
                  <img src={arrowDown} alt="" className={`size-[16px] shrink-0 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute top-[52px] right-0 bg-white border border-[#e4dede] rounded-[16px] shadow-[0px_8px_32px_rgba(0,0,0,0.1)] z-50 min-w-[200px] overflow-hidden">
                    {sortOptions.map((s) => (
                      <button
                        key={s}
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

          {/* Row 2: category tabs + count */}
          <div className="flex items-center justify-between max-xl:flex-col max-xl:items-start max-xl:gap-[12px]">
            <div className="flex gap-[12px] items-center max-xl:w-full max-xl:overflow-x-auto max-xl:[scrollbar-width:none] max-xl:[&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setPage(1) }}
                  className={`h-[40px] px-[16px] rounded-[30px] text-[13px] whitespace-nowrap transition-colors ${
                    activeCategory === cat ? 'bg-[#007c53] text-white' : 'bg-[#f7f7f7] text-[#807e7e]'
                  }`}
                  style={jakarta(500)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-[14px] text-[#807e7e]" style={jakarta(400)}>
              Showing{' '}
              <span className="text-[#101604]" style={jakarta(600)}>{filtered.length}</span>
              {' '}of {products.length} commodities
            </span>
          </div>
        </div>

        {/* ── Product grid ── */}
        <div className="grid grid-cols-3 gap-[24px] mt-[24px] max-lg:grid-cols-2 max-md:grid-cols-1">
          {paginated.length === 0 ? (
            <div className="col-span-full text-center py-[64px] text-[#807e7e] text-[16px]" style={jakarta(400)}>
              {loading ? 'Loading listings…' : loadError || `No listings in ${location} match your filters yet.`}
            </div>
          ) : (
            paginated.map((p) => (
              <div
                key={p.id}
                className="border border-[#e4dede] rounded-[30px] overflow-hidden flex flex-col"
              >
                <div className="h-[200px] bg-[#eee] overflow-hidden shrink-0">
                  {p.image && (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex flex-col gap-[24px] p-[16px] flex-1">
                  <div className="flex flex-col gap-[8px]">
                    <div className="flex items-start justify-between text-[18px]">
                      <p className="text-[#101604] tracking-[-1px] leading-[24px] w-[282px] max-lg:w-auto max-lg:flex-1 max-lg:min-w-0" style={jakarta(600)}>
                        {p.title}
                      </p>
                      <p className="text-[#007c53] tracking-[-0.36px] leading-[24px] whitespace-nowrap" style={jakarta(700)}>
                        {p.price}
                        <span className="text-[#807e7e] text-[12px]" style={jakarta(500)}>
                          {' '}/ {p.unit}
                        </span>
                      </p>
                    </div>
                    <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                      {p.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-[12px]">
                    {[
                      { label: 'Location', value: p.location },
                      { label: 'Quantity', value: p.quantity },
                      { label: 'Listed', value: p.listed },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-[#101604] text-[14px]" style={jakarta(600)}>{label}</span>
                        <span className="text-[#807e7e] text-[14px] text-right" style={jakarta(400)}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-auto max-lg:gap-[12px]">
                    <button
                      onClick={() => navigate(`/marketplace/${p.id}`)}
                      className="bg-[#f7f7f7] text-[#101604] text-[14px] tracking-[-0.14px] h-[48px] w-[168px] rounded-[30px] flex items-center justify-center max-lg:w-auto max-lg:flex-1"
                      style={jakarta(500)}
                    >
                      View details
                    </button>
                    <button
                      onClick={() => navigate(`/marketplace/${p.id}/order`)}
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
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex gap-[16px] items-center justify-center mt-[64px]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="size-[20px] flex items-center justify-center disabled:opacity-30 transition-opacity"
            >
              <img src={arrowLeft} alt="Previous" className="size-[20px]" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`size-[40px] rounded-[30px] flex items-center justify-center text-[14px] transition-colors ${
                  n === page ? 'bg-[#f2f9f7] text-[#007c53]' : 'bg-[#f7f7f7] text-[#807e7e]'
                }`}
                style={jakarta(600)}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="size-[20px] flex items-center justify-center disabled:opacity-30 transition-opacity"
            >
              <img src={arrowRight} alt="Next" className="size-[20px]" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
