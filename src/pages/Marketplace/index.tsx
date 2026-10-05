import { useState, useRef, useEffect } from 'react'
import arrowRight from '../../assets/icons/mp-arrow-right.svg'
import searchIcon from '../../assets/icons/mp-search.svg'
import locationIcon from '../../assets/icons/mp-location.svg'
import arrowDown from '../../assets/icons/mp-arrow-down.svg'
import settingsIcon from '../../assets/icons/mp-settings.svg'
import arrowLeft from '../../assets/icons/mp-arrow-left.svg'
import cocoaImg from '../../assets/images/mp-cocoa.png'
import saffronImg from '../../assets/images/mp-saffron.png'
import goldImg from '../../assets/images/mp-gold.png'
import crudeOilImg from '../../assets/images/mp-crude-oil.png'
import cashewsImg from '../../assets/images/mp-cashews.png'
import lumberImg from '../../assets/images/mp-lumber.png'
import sweetPotatoImg from '../../assets/images/mp-sweet-potato.png'
import cashewW320Img from '../../assets/images/mp-cashew-w320.png'
import tomatoesImg from '../../assets/images/mp-tomatoes.png'
import teakImg from '../../assets/images/mp-teak.png'

const jakarta = (weight: number) => ({
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: weight,
})

const ITEMS_PER_PAGE = 9

const categories = ['All Resources', 'Agriculture', 'Energy', 'Minerals', 'Metals', 'Forestry', 'Raw Materials']
const sortOptions = ['Most recent', 'Price: Low to High', 'Price: High to Low']

type Category = 'Agriculture' | 'Energy' | 'Minerals' | 'Metals' | 'Forestry' | 'Raw Materials'

interface Product {
  title: string
  price: string
  priceNum: number
  description: string
  image: string | null
  location: string
  country: string
  quantity: string
  listed: string
  category: Category
}

const products: Product[] = [
  {
    title: 'Single-origin Cocoa Beans',
    price: '$250', priceNum: 250,
    description: 'Fermented and sun-dried beans harvested for artisan and commercial chocolate makers worldwide.',
    image: cocoaImg, location: 'Guayas, Ecuador', country: 'Ecuador',
    quantity: '20 tonnes', listed: 'June 2026', category: 'Agriculture',
  },
  {
    title: 'Handpicked Saffron Threads',
    price: '$450', priceNum: 450,
    description: 'Highest quality saffron, handpicked from the fields of Iran, perfect for gourmet cooking and natural ...',
    image: saffronImg, location: 'Khorasan, Iran', country: 'Iran',
    quantity: '5 kg', listed: 'October 2026', category: 'Agriculture',
  },
  {
    title: 'Unrefined Gold Doré Bars',
    price: '$500', priceNum: 500,
    description: 'High-grade gold and silver alloy bars direct from artisanal and small-scale mining concessions, ...',
    image: goldImg, location: 'Kumasi, Ghana', country: 'Ghana',
    quantity: '500 kg', listed: 'August 2026', category: 'Metals',
  },
  {
    title: 'Electrolytic Pure Copper Cathodes',
    price: '$850', priceNum: 850,
    description: "Often called the metal of electrification, copper is the world's most efficient non-precious ...",
    image: null, location: 'Vancouver, Canada', country: 'Canada',
    quantity: '500 metric tonnes', listed: 'January 2026', category: 'Metals',
  },
  {
    title: 'Bonny Light Crude Oil',
    price: '$500', priceNum: 500,
    description: 'Premium light sweet crude oil grade with low sulfur content, ideal for high-yield gasoline and diesel ...',
    image: crudeOilImg, location: 'Gulf of Guinea, Nigeria', country: 'Nigeria',
    quantity: '500,000 barrels', listed: 'September 2026', category: 'Energy',
  },
  {
    title: 'Raw Cashew Nuts',
    price: '$800', priceNum: 800,
    description: 'Sun-dried raw cashews with high nut yields, direct from West African smallholder orchards.',
    image: cashewsImg, location: 'Ogbomosho, Nigeria', country: 'Nigeria',
    quantity: '2700 kg', listed: 'August 2026', category: 'Agriculture',
  },
  {
    title: 'Northern Softwood Lumber (Pine)',
    price: '$2K', priceNum: 2000,
    description: 'Structural grade dimensional pine timber treated for commercial framing and construction.',
    image: lumberImg, location: 'Vancouver, Canada', country: 'Canada',
    quantity: '350 cubic meters', listed: 'October 2026', category: 'Forestry',
  },
  {
    title: 'Fresh Sweet Potatoes',
    price: '$150', priceNum: 150,
    description: 'A vibrant selection of fresh sweet potatoes at a local market display highlighting their rich colors and ...',
    image: sweetPotatoImg, location: 'Kaduna, Nigeria', country: 'Nigeria',
    quantity: '728 kg', listed: 'August 2026', category: 'Agriculture',
  },
  {
    title: 'Processed White Wholes (W320)',
    price: '$300', priceNum: 300,
    description: 'Premium kernel grade processed cashew nut, dried and ready for export snack manufacturing.',
    image: cashewW320Img, location: 'Binh Duong, Vietnam', country: 'Vietnam',
    quantity: '15 tonnes', listed: 'May 2026', category: 'Agriculture',
  },
  {
    title: 'Farm Fresh Plum Tomatoes (Basket)',
    price: '$120', priceNum: 120,
    description: 'Direct from smallholder farms in Ikorodu and Epe directly to restaurants, households, and ...',
    image: tomatoesImg, location: 'Lagos, Nigeria', country: 'Nigeria',
    quantity: '120 kg', listed: 'September 2026', category: 'Agriculture',
  },
  {
    title: 'Sustainably Farmed Teak Timber',
    price: '$250', priceNum: 250,
    description: 'Renowned for centuries for its natural oils and exceptional resistance to water, rot, and insects.',
    image: teakImg, location: 'Mato Grosso, Brazil', country: 'Brazil',
    quantity: '10000 units', listed: 'March 2026', category: 'Forestry',
  },
  {
    title: 'High-Grade Spodumene Ore (SC6)',
    price: '$200', priceNum: 200,
    description: 'Premium raw lithium-bearing spodumene mineral concentrate with a 6% Li₂O content ...',
    image: null, location: 'Nasarawa, Nigeria', country: 'Nigeria',
    quantity: '1,200 tonnes', listed: 'August 2026', category: 'Minerals',
  },
]

const allCountries = ['Global', ...Array.from(new Set(products.map((p) => p.country))).sort()]

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState('All Resources')
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('Global')
  const [sort, setSort] = useState('Most recent')
  const [page, setPage] = useState(1)
  const [locationOpen, setLocationOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

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
      const matchLoc = location === 'Global' || p.country === location
      const matchSearch = search === '' ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchLoc && matchSearch
    })
    .sort((a, b) => {
      if (sort === 'Price: Low to High') return a.priceNum - b.priceNum
      if (sort === 'Price: High to Low') return b.priceNum - a.priceNum
      return 0 // Most recent — preserve original order
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="bg-white w-full pb-[120px]">
      <div className="max-w-[1200px] mx-auto">

        {/* ── Page header ── */}
        <div className="flex flex-col gap-[8px] pt-[64px] w-[892px]">
          <h1
            className="text-[#0c2310] text-[48px] tracking-[-0.96px] leading-[64px]"
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

        {/* ── Search + filter controls ── */}
        <div className="flex flex-col gap-[24px] mt-[40px]">

          {/* Row 1: search + dropdowns */}
          <div className="flex items-center justify-between">

            {/* Search */}
            <div className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center px-[16px] rounded-[30px] w-[588px]">
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

            <div className="flex gap-[16px] items-center">

              {/* Location dropdown */}
              <div className="relative" ref={locationRef}>
                <button
                  onClick={() => { setLocationOpen((o) => !o); setSortOpen(false) }}
                  className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center justify-center px-[16px] rounded-[30px] cursor-pointer"
                >
                  <img src={locationIcon} alt="" className="size-[20px] shrink-0" />
                  <span className="text-[13px]" style={jakarta(500)}>
                    <span className="text-[#807e7e]">Location: </span>
                    <span className="text-[#101604]" style={jakarta(600)}>{location}</span>
                  </span>
                  <img src={arrowDown} alt="" className={`size-[16px] shrink-0 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
                </button>
                {locationOpen && (
                  <div className="absolute top-[52px] left-0 bg-white border border-[#e4dede] rounded-[16px] shadow-[0px_8px_32px_rgba(0,0,0,0.1)] z-50 min-w-[180px] overflow-hidden">
                    {allCountries.map((c) => (
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
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => { setSortOpen((o) => !o); setLocationOpen(false) }}
                  className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center justify-center px-[16px] rounded-[30px] cursor-pointer"
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
          <div className="flex items-center justify-between">
            <div className="flex gap-[12px] items-center">
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
        <div className="grid grid-cols-3 gap-[24px] mt-[24px]">
          {paginated.length === 0 ? (
            <div className="col-span-3 text-center py-[64px] text-[#807e7e] text-[16px]" style={jakarta(400)}>
              No commodities match your filters.
            </div>
          ) : (
            paginated.map((p) => (
              <div
                key={p.title}
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
                      <p className="text-[#101604] tracking-[-1px] leading-[24px] w-[282px]" style={jakarta(600)}>
                        {p.title}
                      </p>
                      <p className="text-[#007c53] tracking-[-0.36px] leading-[24px] whitespace-nowrap" style={jakarta(700)}>
                        {p.price}
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
                  <div className="flex items-center justify-between mt-auto">
                    <button
                      className="bg-[#f7f7f7] text-[#101604] text-[14px] tracking-[-0.14px] h-[48px] w-[168px] rounded-[30px] flex items-center justify-center"
                      style={jakarta(500)}
                    >
                      View details
                    </button>
                    <button
                      className="h-[48px] w-[168px] rounded-[30px] flex items-center justify-center gap-[8px]"
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
