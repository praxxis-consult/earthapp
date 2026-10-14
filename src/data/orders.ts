import productThumb from '../assets/images/db-product-thumb.png'

export type OrderStatus = 'new' | 'processing' | 'ready' | 'dispatched' | 'completed' | 'cancelled' | 'declined'

export type DeliveryMethod = 'Motorbike' | 'Pickup' | 'Car'

export interface Order {
  id: string
  /** Display form from the design, e.g. "September 24, 01:35AM". */
  placed: string
  /** ISO timestamp, for sorting and the detail page header. */
  placedAt: string
  buyer: {
    name: string
    since: string
    address: string
  }
  item: {
    title: string
    sku: string
    soldBy: string
    qty: number
    weightKg: number
    unit: string
    price: number
    onSale: boolean
    image: string
  }
  delivery: {
    method: DeliveryMethod
    courier: string
    address: string
    expected: string
    amountPaid: number
  }
  payment: {
    subtotal: number
    fee: number
    discount: number
  }
  note?: string
  status: OrderStatus
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'New order',
  processing: 'Processing',
  ready: 'Ready for pickup',
  dispatched: 'Dispatched',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
}

/** Badge colours per status (Figma "Order status" cells, orders 561:3325). */
export const STATUS_STYLE: Record<OrderStatus, { bg: string; color: string }> = {
  new: { bg: '#eaf2ff', color: '#4385ed' },
  processing: { bg: '#fff6dd', color: '#a66608' },
  ready: { bg: 'rgba(138,88,255,0.1)', color: '#8a58ff' },
  dispatched: { bg: 'rgba(184,0,204,0.08)', color: '#b800cc' },
  completed: { bg: '#eaf8f0', color: '#177b4d' },
  cancelled: { bg: '#fff0f0', color: '#b13b3b' },
  declined: { bg: '#fff0f0', color: '#b13b3b' },
}

export const naira = (n: number) =>
  '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const orderTotal = (o: Order) => o.payment.subtotal + o.payment.fee - o.payment.discount

type Seed = [
  id: string,
  placed: string,
  placedAt: string,
  buyer: string,
  title: string,
  qty: number,
  weightKg: number,
  price: number,
  method: DeliveryMethod,
  status: OrderStatus,
]

// The seven rows on the design, then the rest of the list the counters and pages are read from.
const seeds: Seed[] = [
  [
    'EA-0828-0229',
    'September 24, 01:35AM',
    '2024-09-24T01:35:00',
    'Adaora Amunike',
    'Farm fresh plum tomatoes',
    6,
    48,
    24000,
    'Motorbike',
    'new',
  ],
  [
    'EA-0828-0230',
    'September 19, 11:27PM',
    '2024-09-19T23:27:00',
    'Mitchelle Obi',
    'Sweet potatoes',
    1,
    12,
    45000,
    'Pickup',
    'processing',
  ],
  [
    'EA-0830-0341',
    'September 20, 9:14AM',
    '2024-09-20T09:14:00',
    'Jasper Oladele',
    'Free-range chicken eggs',
    2,
    16,
    15000,
    'Car',
    'dispatched',
  ],
  [
    'EA-0845-0672',
    'September 21, 3:45PM',
    '2024-09-21T15:45:00',
    'Amaka Johnson',
    'Quinoa',
    3,
    24,
    20500,
    'Motorbike',
    'ready',
  ],
  [
    'EA-0850-0123',
    'September 22, 7:30AM',
    '2024-09-22T07:30:00',
    'Sofia Martinez',
    'Handpicked wild blueberries',
    4,
    32,
    8750,
    'Motorbike',
    'cancelled',
  ],
  [
    'EA-0862-0456',
    'September 23, 5:20PM',
    '2024-09-23T17:20:00',
    'Ethan Kim',
    'Kale',
    2,
    40,
    32100,
    'Pickup',
    'completed',
  ],
  [
    'EA-0875-0789',
    'September 24, 10:55PM',
    '2024-09-24T22:55:00',
    'Hakeem Peters',
    'Organic baby spinach leaves',
    1,
    56,
    27300,
    'Car',
    'declined',
  ],
  [
    'EA-0876-0102',
    'September 18, 8:05AM',
    '2024-09-18T08:05:00',
    'Ngozi Eze',
    'Yellow maize',
    5,
    50,
    18500,
    'Car',
    'completed',
  ],
  [
    'EA-0877-0115',
    'September 17, 2:40PM',
    '2024-09-17T14:40:00',
    'Tunde Bakare',
    'Honey (raw)',
    2,
    6,
    12000,
    'Motorbike',
    'completed',
  ],
  [
    'EA-0878-0130',
    'September 17, 9:12AM',
    '2024-09-17T09:12:00',
    'Blessing Okafor',
    'Cassava flour',
    3,
    30,
    9900,
    'Pickup',
    'completed',
  ],
  [
    'EA-0879-0144',
    'September 16, 6:50PM',
    '2024-09-16T18:50:00',
    'Chidi Nwosu',
    'Palm oil',
    4,
    20,
    26000,
    'Car',
    'completed',
  ],
  [
    'EA-0880-0158',
    'September 16, 11:30AM',
    '2024-09-16T11:30:00',
    'Fatima Bello',
    'Ginger',
    2,
    10,
    7400,
    'Motorbike',
    'completed',
  ],
  [
    'EA-0881-0167',
    'September 15, 4:15PM',
    '2024-09-15T16:15:00',
    'Emeka Obi',
    'Plantain',
    6,
    60,
    21000,
    'Pickup',
    'completed',
  ],
  [
    'EA-0882-0173',
    'September 15, 10:05AM',
    '2024-09-15T10:05:00',
    'Grace Adeyemi',
    'Scotch bonnet peppers',
    1,
    8,
    6800,
    'Motorbike',
    'completed',
  ],
  [
    'EA-0883-0188',
    'September 14, 7:45PM',
    '2024-09-14T19:45:00',
    'Ibrahim Musa',
    'Groundnuts',
    3,
    36,
    14200,
    'Car',
    'completed',
  ],
  [
    'EA-0884-0191',
    'September 14, 1:20PM',
    '2024-09-14T13:20:00',
    'Kemi Alabi',
    'Cocoa beans',
    2,
    24,
    48000,
    'Pickup',
    'cancelled',
  ],
  [
    'EA-0885-0204',
    'September 13, 9:00AM',
    '2024-09-13T09:00:00',
    'David Okoro',
    'Fresh catfish',
    2,
    14,
    16500,
    'Motorbike',
    'completed',
  ],
  [
    'EA-0886-0217',
    'September 12, 5:35PM',
    '2024-09-12T17:35:00',
    'Aisha Lawal',
    'Sesame seeds',
    4,
    32,
    19800,
    'Car',
    'completed',
  ],
  [
    'EA-0887-0226',
    'September 12, 8:10AM',
    '2024-09-12T08:10:00',
    'Samuel Eze',
    'Cashew nuts',
    1,
    12,
    23000,
    'Pickup',
    'processing',
  ],
  [
    'EA-0888-0239',
    'September 11, 3:55PM',
    '2024-09-11T15:55:00',
    'Rita Umeh',
    'Sweet corn',
    5,
    40,
    11000,
    'Motorbike',
    'completed',
  ],
  [
    'EA-0889-0247',
    'September 10, 12:30PM',
    '2024-09-10T12:30:00',
    'Yusuf Danjuma',
    'Soybeans',
    3,
    45,
    17250,
    'Car',
    'completed',
  ],
  [
    'EA-0890-0251',
    'September 9, 6:05PM',
    '2024-09-09T18:05:00',
    'Chiamaka Nnaji',
    'Okra',
    2,
    10,
    5600,
    'Motorbike',
    'completed',
  ],
  [
    'EA-0891-0266',
    'September 8, 10:45AM',
    '2024-09-08T10:45:00',
    'Peter Ajayi',
    'Watermelon',
    4,
    64,
    13600,
    'Pickup',
    'completed',
  ],
  [
    'EA-0892-0273',
    'September 7, 2:25PM',
    '2024-09-07T14:25:00',
    'Halima Sani',
    'Dried hibiscus (zobo)',
    2,
    8,
    8200,
    'Car',
    'completed',
  ],
]

const COURIER: Record<DeliveryMethod, string> = {
  Motorbike: 'GIG Logistics, via Shipbubble',
  Car: 'Kwik Delivery, via Shipbubble',
  Pickup: 'Buyer collects from store',
}

export const orders: Order[] = seeds.map(
  ([id, placed, placedAt, buyer, title, qty, weightKg, price, method, status]) => {
    const words = title.split(' ')
    const sku =
      words
        .map((w) => w.slice(0, 3).toUpperCase())
        .slice(0, 2)
        .join('-') +
      '-' +
      weightKg / qty
    return {
      id,
      placed,
      placedAt,
      buyer: { name: buyer, since: 'Customer since August 2026', address: '5 Admiralty Way, Lekki Phase 1' },
      item: {
        title,
        sku,
        soldBy: 'Sold by basket',
        qty,
        weightKg,
        unit: `${weightKg / qty} kg/basket`,
        price,
        onSale: status === 'new',
        image: productThumb,
      },
      delivery: {
        method,
        courier: COURIER[method],
        address: '5 Admiralty Way, Lekki Phase 1',
        expected: 'Sep 25, 2024 · 10 AM–2 PM',
        amountPaid: method === 'Pickup' ? 0 : 4200,
      },
      payment: { subtotal: price, fee: method === 'Pickup' ? 0 : 2500, discount: 0 },
      note: status === 'new' ? 'Please select firm tomatoes and pack carefully for the trip.' : undefined,
      status,
    }
  },
)

export const findOrder = (id: string | undefined) => orders.find((o) => o.id === id)
