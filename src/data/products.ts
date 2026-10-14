import cocoaImg from '../assets/images/mp-cocoa.png'
import saffronImg from '../assets/images/mp-saffron.png'
import goldImg from '../assets/images/mp-gold.png'
import crudeOilImg from '../assets/images/mp-crude-oil.png'
import cashewsImg from '../assets/images/mp-cashews.png'
import lumberImg from '../assets/images/mp-lumber.png'
import sweetPotatoImg from '../assets/images/mp-sweet-potato.png'
import cashewW320Img from '../assets/images/mp-cashew-w320.png'
import tomatoesImg from '../assets/images/mp-tomatoes.png'
import teakImg from '../assets/images/mp-teak.png'
import cocoaThumb1 from '../assets/images/pd-cocoa-thumb1.png'
import cocoaThumb2 from '../assets/images/pd-cocoa-thumb2.png'

export type Category = 'Agriculture' | 'Energy' | 'Minerals' | 'Metals' | 'Forestry' | 'Raw Materials'

export interface Product {
  id: string
  title: string
  price: string
  priceNum: number
  description: string
  details: string
  image: string | null
  thumbnails: string[]
  extraPhotos: number
  location: string
  country: string
  quantity: string
  listed: string
  category: Category
  rating: number
  reviewCount: number
}

const defaultDetails = (title: string) =>
  `${title} is carefully sourced from a specific growing region and selected for quality, consistency, and distinctive characteristics. Properly processed to preserve integrity and quality, making it suitable for industrial, commercial, and specialty applications. Ideal for manufacturers, processors, wholesalers, and international buyers seeking traceable, high-quality commodities with reliable performance.\n\nCarefully handled from harvest through post-harvest processing, prepared to meet the demands of both specialty and commercial markets. Consistent size, characteristics, and quality make this a versatile ingredient for buyers looking to create premium products while maintaining authentic origin character.`

export const products: Product[] = [
  {
    id: 'single-origin-cocoa-beans',
    title: 'Single-origin Cocoa Beans',
    price: '$250', priceNum: 250,
    description: 'Fermented and sun-dried beans harvested for artisan and commercial chocolate makers worldwide.',
    details: `Single-origin cocoa beans carefully sourced from a specific growing region and selected for their quality, consistency, and distinctive flavor profile. These premium beans are naturally shaped by the unique soil, climate, and farming practices of their origin, delivering a rich cocoa aroma with deep chocolate notes, subtle earthy and nutty undertones, and hints of natural fruitiness. The beans are properly fermented and dried to preserve their flavor, aroma, and quality, making them suitable for chocolate production, cocoa powder, confectionery, beverages, and other cocoa-based products. Ideal for chocolate manufacturers, processors, wholesalers, and international buyers seeking traceable, high-quality cocoa beans with a distinctive origin and reliable performance.\n\nCarefully handled from harvest through post-harvest processing, the beans are prepared to meet the demands of both specialty and commercial cocoa markets. Their consistent size, aroma, and flavor characteristics make them a versatile ingredient for buyers looking to create premium chocolate and cocoa products while maintaining the authentic character of the beans' place of origin.`,
    image: cocoaImg, thumbnails: [cocoaThumb1, cocoaThumb2], extraPhotos: 4,
    location: 'Guayas, Ecuador', country: 'Ecuador',
    quantity: '20 tonnes', listed: 'June 2026', category: 'Agriculture',
    rating: 4.5, reviewCount: 18,
  },
  {
    id: 'handpicked-saffron-threads',
    title: 'Handpicked Saffron Threads',
    price: '$450', priceNum: 450,
    description: 'Highest quality saffron, handpicked from the fields of Iran, perfect for gourmet cooking and natural ...',
    details: defaultDetails('Handpicked Saffron Threads'),
    image: saffronImg, thumbnails: [], extraPhotos: 0,
    location: 'Khorasan, Iran', country: 'Iran',
    quantity: '5 kg', listed: 'October 2026', category: 'Agriculture',
    rating: 4.8, reviewCount: 12,
  },
  {
    id: 'unrefined-gold-dore-bars',
    title: 'Unrefined Gold Doré Bars',
    price: '$500', priceNum: 500,
    description: 'High-grade gold and silver alloy bars direct from artisanal and small-scale mining concessions, ...',
    details: defaultDetails('Unrefined Gold Doré Bars'),
    image: goldImg, thumbnails: [], extraPhotos: 0,
    location: 'Kumasi, Ghana', country: 'Ghana',
    quantity: '500 kg', listed: 'August 2026', category: 'Metals',
    rating: 4.7, reviewCount: 9,
  },
  {
    id: 'electrolytic-pure-copper-cathodes',
    title: 'Electrolytic Pure Copper Cathodes',
    price: '$850', priceNum: 850,
    description: "Often called the metal of electrification, copper is the world's most efficient non-precious ...",
    details: defaultDetails('Electrolytic Pure Copper Cathodes'),
    image: null, thumbnails: [], extraPhotos: 0,
    location: 'Vancouver, Canada', country: 'Canada',
    quantity: '500 metric tonnes', listed: 'January 2026', category: 'Metals',
    rating: 4.6, reviewCount: 7,
  },
  {
    id: 'bonny-light-crude-oil',
    title: 'Bonny Light Crude Oil',
    price: '$500', priceNum: 500,
    description: 'Premium light sweet crude oil grade with low sulfur content, ideal for high-yield gasoline and diesel ...',
    details: defaultDetails('Bonny Light Crude Oil'),
    image: crudeOilImg, thumbnails: [], extraPhotos: 0,
    location: 'Gulf of Guinea, Nigeria', country: 'Nigeria',
    quantity: '500,000 barrels', listed: 'September 2026', category: 'Energy',
    rating: 4.4, reviewCount: 22,
  },
  {
    id: 'raw-cashew-nuts',
    title: 'Raw Cashew Nuts',
    price: '$800', priceNum: 800,
    description: 'Sun-dried raw cashews with high nut yields, direct from West African smallholder orchards.',
    details: defaultDetails('Raw Cashew Nuts'),
    image: cashewsImg, thumbnails: [], extraPhotos: 0,
    location: 'Ogbomosho, Nigeria', country: 'Nigeria',
    quantity: '2700 kg', listed: 'August 2026', category: 'Agriculture',
    rating: 4.3, reviewCount: 15,
  },
  {
    id: 'northern-softwood-lumber-pine',
    title: 'Northern Softwood Lumber (Pine)',
    price: '$2K', priceNum: 2000,
    description: 'Structural grade dimensional pine timber treated for commercial framing and construction.',
    details: defaultDetails('Northern Softwood Lumber (Pine)'),
    image: lumberImg, thumbnails: [], extraPhotos: 0,
    location: 'Vancouver, Canada', country: 'Canada',
    quantity: '350 cubic meters', listed: 'October 2026', category: 'Forestry',
    rating: 4.5, reviewCount: 11,
  },
  {
    id: 'fresh-sweet-potatoes',
    title: 'Fresh Sweet Potatoes',
    price: '$150', priceNum: 150,
    description: 'A vibrant selection of fresh sweet potatoes at a local market display highlighting their rich colors and ...',
    details: defaultDetails('Fresh Sweet Potatoes'),
    image: sweetPotatoImg, thumbnails: [], extraPhotos: 0,
    location: 'Kaduna, Nigeria', country: 'Nigeria',
    quantity: '728 kg', listed: 'August 2026', category: 'Agriculture',
    rating: 4.2, reviewCount: 8,
  },
  {
    id: 'processed-white-wholes-w320',
    title: 'Processed White Wholes (W320)',
    price: '$300', priceNum: 300,
    description: 'Premium kernel grade processed cashew nut, dried and ready for export snack manufacturing.',
    details: defaultDetails('Processed White Wholes (W320)'),
    image: cashewW320Img, thumbnails: [], extraPhotos: 0,
    location: 'Binh Duong, Vietnam', country: 'Vietnam',
    quantity: '15 tonnes', listed: 'May 2026', category: 'Agriculture',
    rating: 4.6, reviewCount: 14,
  },
  {
    id: 'farm-fresh-plum-tomatoes',
    title: 'Farm Fresh Plum Tomatoes (Basket)',
    price: '$120', priceNum: 120,
    description: 'Direct from smallholder farms in Ikorodu and Epe directly to restaurants, households, and ...',
    details: defaultDetails('Farm Fresh Plum Tomatoes'),
    image: tomatoesImg, thumbnails: [], extraPhotos: 0,
    location: 'Lagos, Nigeria', country: 'Nigeria',
    quantity: '120 kg', listed: 'September 2026', category: 'Agriculture',
    rating: 4.1, reviewCount: 6,
  },
  {
    id: 'sustainably-farmed-teak-timber',
    title: 'Sustainably Farmed Teak Timber',
    price: '$250', priceNum: 250,
    description: 'Renowned for centuries for its natural oils and exceptional resistance to water, rot, and insects.',
    details: defaultDetails('Sustainably Farmed Teak Timber'),
    image: teakImg, thumbnails: [], extraPhotos: 0,
    location: 'Mato Grosso, Brazil', country: 'Brazil',
    quantity: '10000 units', listed: 'March 2026', category: 'Forestry',
    rating: 4.7, reviewCount: 19,
  },
  {
    id: 'high-grade-spodumene-ore-sc6',
    title: 'High-Grade Spodumene Ore (SC6)',
    price: '$200', priceNum: 200,
    description: 'Premium raw lithium-bearing spodumene mineral concentrate with a 6% Li₂O content ...',
    details: defaultDetails('High-Grade Spodumene Ore (SC6)'),
    image: null, thumbnails: [], extraPhotos: 0,
    location: 'Nasarawa, Nigeria', country: 'Nigeria',
    quantity: '1,200 tonnes', listed: 'August 2026', category: 'Minerals',
    rating: 4.4, reviewCount: 5,
  },
]
