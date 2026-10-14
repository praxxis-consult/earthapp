import { Link } from 'react-router-dom'
import arrowRight from '../../assets/icons/arrow-right.svg'
import cocoaImg from '../../assets/images/catalog-cocoa.png'
import saffronImg from '../../assets/images/catalog-saffron.png'
import crudeOilImg from '../../assets/images/catalog-crude-oil.png'
import goldImg from '../../assets/images/catalog-gold.png'
import lumberImg from '../../assets/images/catalog-lumber.png'
import cashewsImg from '../../assets/images/catalog-cashews.png'

const jakartaSemiBold = { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }
const jakartaMedium = { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }

const categories = ['All Resources', 'Agriculture', 'Energy', 'Minerals', 'Metals', 'Forestry', 'Raw Materials']

interface ProductCard {
  title: string
  description: string
  image: string
  location: string
  quantity: string
  listed: string
}

const products: ProductCard[] = [
  {
    title: 'Single-origin Cocoa Beans',
    description: 'Fermented and sun-dried beans harvested for artisan and commercial chocolate makers worldwide.',
    image: cocoaImg,
    location: 'Guayas, Ecuador',
    quantity: '20 tonnes',
    listed: 'June 2026',
  },
  {
    title: 'Handpicked Saffron Threads',
    description: 'Highest quality saffron, handpicked from the fields of Iran, perfect for gourmet cooking and natural ...',
    image: saffronImg,
    location: 'Khorasan, Iran',
    quantity: '5 kg',
    listed: 'October 2026',
  },
  {
    title: 'Bonny Light Crude Oil',
    description: 'Premium light sweet crude oil grade with low sulfur content, ideal for high-yield gasoline and diesel ...',
    image: crudeOilImg,
    location: 'Gulf of Guinea, Nigeria',
    quantity: '500,000 barrels',
    listed: 'September 2026',
  },
  {
    title: 'Unrefined Gold Doré Bars',
    description: 'High-grade gold and silver alloy bars direct from artisanal and small-scale mining concessions, ...',
    image: goldImg,
    location: 'Kumasi, Ghana',
    quantity: '500 kg',
    listed: 'August 2026',
  },
  {
    title: 'Northern Softwood Lumber (Pine)',
    description: 'Structural grade dimensional pine timber treated for commercial framing and construction.',
    image: lumberImg,
    location: 'Vancouver, Canada',
    quantity: '350 cubic meters',
    listed: 'October 2026',
  },
  {
    title: 'Raw Cashew Nuts',
    description: 'Sun-dried raw cashews with high nut yields, direct from West African smallholder orchards.',
    image: cashewsImg,
    location: 'Ogbomosho, Nigeria',
    quantity: '2700 kg',
    listed: 'August 2026',
  },
]

export default function MarketplaceCatalog() {
  return (
    <section className="w-full bg-white py-[64px]">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-[24px]">
          <div className="w-[588px] flex flex-col gap-[8px]">
            <h2
              className="text-[#101604] text-[48px] leading-[64px] tracking-[-0.96px]"
              style={jakartaSemiBold}
            >
              From the Ground<br />to Your Daily Life
            </h2>
            <p
              className="text-[#807e7e] text-[16px] leading-[29.25px]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
            >
              Browse our live catalog of ethically sourced raw materials with transparent origins and lab-tested quality.
            </p>
          </div>
          {/* Link (670:30758): 192×48, 74px below the header top */}
          <Link
            to="/marketplace"
            className="mt-[74px] flex h-[48px] w-[192px] items-center justify-center rounded-[30px] text-[#007c53] text-[14px] leading-[18px] whitespace-nowrap"
            style={jakartaMedium}
          >
            Explore all Resources
          </Link>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-[12px] items-center mb-[32px]">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-[16px] py-[12px] rounded-[30px] text-[13px] leading-[16px] whitespace-nowrap ${
                i === 0
                  ? 'bg-[#007c53] text-white'
                  : 'bg-[#f7f7f7] text-[#807e7e]'
              }`}
              style={jakartaMedium}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid — 3×2 */}
        <div className="grid grid-cols-3 gap-[24px]">
          {products.map((p) => (
            <div
              key={p.title}
              className="rounded-[30px] overflow-hidden flex flex-col shadow-[inset_0_0_0_1px_#e4dede]"
            >
              {/* Image */}
              <div className="h-[200px] bg-[#eee] overflow-hidden shrink-0">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-[24px] p-[16px] pt-[24px] flex-1">
                {/* Title + description */}
                <div className="flex flex-col gap-[8px]">
                  <p
                    className="text-[#101604] text-[18px] tracking-[-1px] leading-[24px]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
                  >
                    {p.title}
                  </p>
                  <p
                    className="text-[#807e7e] text-[14px] leading-[24px]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
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
                    <div key={label} className="flex items-center justify-between leading-[18px]">
                      <span
                        className="text-[#101604] text-[14px]"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-[#807e7e] text-[14px]"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex items-center justify-between mt-auto">
                  <button
                    className="bg-[#f7f7f7] text-[#101604] text-[14px] tracking-[-0.14px] h-[48px] w-[168px] rounded-[30px] flex items-center justify-center"
                    style={jakartaMedium}
                  >
                    View details
                  </button>
                  <button
                    className="h-[48px] w-[168px] rounded-[30px] flex items-center justify-center gap-[8px]"
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
                      Inquire
                    </span>
                    <img src={arrowRight} alt="" className="size-[16px]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
