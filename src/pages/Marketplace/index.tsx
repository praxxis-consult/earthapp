import { useState } from 'react'
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

const categories = ['All Resources', 'Agriculture', 'Energy', 'Minerals', 'Metals', 'Forestry', 'Raw Materials']

interface Product {
  title: string
  price: string
  description: string
  image: string | null
  location: string
  quantity: string
  listed: string
}

const products: Product[] = [
  {
    title: 'Single-origin Cocoa Beans',
    price: '$250',
    description: 'Fermented and sun-dried beans harvested for artisan and commercial chocolate makers worldwide.',
    image: cocoaImg,
    location: 'Guayas, Ecuador',
    quantity: '20 tonnes',
    listed: 'June 2026',
  },
  {
    title: 'Handpicked Saffron Threads',
    price: '$450',
    description: 'Highest quality saffron, handpicked from the fields of Iran, perfect for gourmet cooking and natural ...',
    image: saffronImg,
    location: 'Khorasan, Iran',
    quantity: '5 kg',
    listed: 'October 2026',
  },
  {
    title: 'Unrefined Gold Doré Bars',
    price: '$500',
    description: 'High-grade gold and silver alloy bars direct from artisanal and small-scale mining concessions, ...',
    image: goldImg,
    location: 'Kumasi, Ghana',
    quantity: '500 kg',
    listed: 'August 2026',
  },
  {
    title: 'Electrolytic Pure Copper Cathodes',
    price: '$850',
    description: "Often called the metal of electrification, copper is the world's most efficient non-precious ...",
    image: null,
    location: 'Vancouver, Canada',
    quantity: '500 metric tonnes',
    listed: 'January 2026',
  },
  {
    title: 'Bonny Light Crude Oil',
    price: '$500',
    description: 'Premium light sweet crude oil grade with low sulfur content, ideal for high-yield gasoline and diesel ...',
    image: crudeOilImg,
    location: 'Gulf of Guinea, Nigeria',
    quantity: '500,000 barrels',
    listed: 'September 2026',
  },
  {
    title: 'Raw Cashew Nuts',
    price: '$800',
    description: 'Sun-dried raw cashews with high nut yields, direct from West African smallholder orchards.',
    image: cashewsImg,
    location: 'Ogbomosho, Nigeria',
    quantity: '2700 kg',
    listed: 'August 2026',
  },
  {
    title: 'Northern Softwood Lumber (Pine)',
    price: '$2K',
    description: 'Structural grade dimensional pine timber treated for commercial framing and construction.',
    image: lumberImg,
    location: 'Vancouver, Canada',
    quantity: '350 cubic meters',
    listed: 'October 2026',
  },
  {
    title: 'Fresh Sweet Potatoes',
    price: '$150',
    description: 'A vibrant selection of fresh sweet potatoes at a local market display highlighting their rich colors and ...',
    image: sweetPotatoImg,
    location: 'Kaduna, Nigeria',
    quantity: '728 kg',
    listed: 'August 2026',
  },
  {
    title: 'Processed White Wholes (W320 ...)',
    price: '$300',
    description: 'Premium kernel grade processed cashew nut, dried and ready for export snack manufacturing.',
    image: cashewW320Img,
    location: 'Binh Duong, Vietnam',
    quantity: '15 tonnes',
    listed: 'May 2026',
  },
  {
    title: 'Farm Fresh Plum Tomatoes (Basket)',
    price: '$120',
    description: 'Direct from smallholder farms in Ikorodu and Epe directly to restaurants, households, and ...',
    image: tomatoesImg,
    location: 'Lagos, Nigeria',
    quantity: '120 kg',
    listed: 'September 2026',
  },
  {
    title: 'Sustainably Farmed Teak Timber',
    price: '$250',
    description: 'Renowned for centuries for its natural oils and exceptional resistance to water, rot, and insects.',
    image: teakImg,
    location: 'Mato Grosso, Brazil',
    quantity: '10000 units',
    listed: 'March 2026',
  },
  {
    title: 'High-Grade Spodumene Ore (SC6)',
    price: '$200',
    description: 'Premium raw lithium-bearing spodumene mineral concentrate with a 6% Li₂O content ...',
    image: null,
    location: 'Nasarawa, Nigeria',
    quantity: '1,200 tonnes',
    listed: 'August 2026',
  },
]

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState('All Resources')

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
          <p
            className="text-[#807e7e] text-[16px] leading-[29.25px]"
            style={jakarta(400)}
          >
            Direct access to authenticated bulk agricultural harvests, battery minerals, precious bullion,
            clean energy, and sustainable timber. Explore live 30-day price trends, technical specifications,
            and origin ports with zero speculative markups.
          </p>
        </div>

        {/* ── Search + filter controls ── */}
        <div className="flex flex-col gap-[24px] mt-[136px]">

          {/* Row 1: search bar + dropdowns */}
          <div className="flex items-center justify-between">
            {/* Search bar */}
            <div className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center px-[16px] rounded-[30px] w-[588px]">
              <img src={searchIcon} alt="" className="size-[20px] shrink-0" />
              <span className="text-[#807e7e] text-[13px]" style={jakarta(400)}>
                Search by commodity name, location ...
              </span>
            </div>

            {/* Dropdowns */}
            <div className="flex gap-[16px] items-center">
              {/* Location */}
              <div className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center justify-center px-[16px] rounded-[30px]">
                <img src={locationIcon} alt="" className="size-[20px] shrink-0" />
                <span className="text-[13px]" style={jakarta(500)}>
                  <span className="text-[#807e7e]">Location: </span>
                  <span className="text-[#101604]" style={jakarta(600)}>Global</span>
                </span>
                <img src={arrowDown} alt="" className="size-[16px] shrink-0" />
              </div>

              {/* Sort */}
              <div className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center justify-center px-[16px] rounded-[30px]">
                <img src={settingsIcon} alt="" className="size-[20px] shrink-0" />
                <span className="text-[13px]" style={jakarta(500)}>
                  <span className="text-[#807e7e]">Sort: </span>
                  <span className="text-[#101604]" style={jakarta(600)}>Most recent</span>
                </span>
                <img src={arrowDown} alt="" className="size-[16px] shrink-0" />
              </div>
            </div>
          </div>

          {/* Row 2: category tabs + count */}
          <div className="flex items-center justify-between">
            <div className="flex gap-[12px] items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`h-[40px] px-[16px] rounded-[30px] text-[13px] whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-[#007c53] text-white'
                      : 'bg-[#f7f7f7] text-[#807e7e]'
                  }`}
                  style={jakarta(500)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-[14px] text-[#807e7e]" style={jakarta(400)}>
              Showing <span className="text-[#101604]" style={jakarta(600)}>12</span> of 12 commodities
            </span>
          </div>
        </div>

        {/* ── Product grid — 3×4 ── */}
        <div className="grid grid-cols-3 gap-[24px] mt-[24px]">
          {products.map((p) => (
            <div
              key={p.title}
              className="border border-[#e4dede] rounded-[30px] overflow-hidden flex flex-col"
            >
              {/* Product image */}
              <div className="h-[200px] bg-[#eee] overflow-hidden shrink-0">
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Card content */}
              <div className="flex flex-col gap-[24px] p-[16px] flex-1">

                {/* Title + price */}
                <div className="flex flex-col gap-[8px]">
                  <div className="flex items-start justify-between text-[18px]">
                    <p
                      className="text-[#101604] tracking-[-1px] leading-[24px] w-[282px]"
                      style={jakarta(600)}
                    >
                      {p.title}
                    </p>
                    <p
                      className="text-[#007c53] tracking-[-0.36px] leading-[24px] whitespace-nowrap"
                      style={jakarta(700)}
                    >
                      {p.price}
                    </p>
                  </div>
                  <p
                    className="text-[#807e7e] text-[14px] leading-[24px]"
                    style={jakarta(400)}
                  >
                    {p.description}
                  </p>
                </div>

                {/* Meta rows */}
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

                {/* CTAs */}
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
          ))}
        </div>

        {/* ── Pagination ── */}
        <div className="flex gap-[16px] items-center justify-center mt-[64px] px-[64px] py-[16px]">
          <button className="opacity-50 size-[20px] flex items-center justify-center">
            <img src={arrowLeft} alt="Previous" className="size-[20px]" />
          </button>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`size-[40px] rounded-[30px] flex items-center justify-center text-[14px] ${
                n === 1
                  ? 'bg-[#f2f9f7] text-[#007c53]'
                  : 'bg-[#f7f7f7] text-[#807e7e]'
              }`}
              style={jakarta(600)}
            >
              {n}
            </button>
          ))}
          <button className="size-[20px] flex items-center justify-center">
            <img src={arrowRight} alt="Next" className="size-[20px]" />
          </button>
        </div>

      </div>
    </div>
  )
}
