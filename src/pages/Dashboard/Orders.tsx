import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Pager from '../../components/ui/Pager'
import OrderStatusBadge from '../../components/ui/OrderStatusBadge'
import searchIcon from '../../assets/icons/db-search.svg'
import calendarIcon from '../../assets/icons/db-calendar.svg'
import filterIcon from '../../assets/icons/db-filter.svg'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import emptyBg from '../../assets/icons/db-empty-bg.svg'
import emptyIllustration from '../../assets/icons/db-empty-illustration.svg'
import { orders, naira, type Order, type OrderStatus } from '../../data/orders'
import { jakarta } from '../../utils/styles'

const PAGE_SIZE = 7

type Tab = 'all' | OrderStatus
const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'processing', label: 'Processing' },
  { key: 'ready', label: 'Ready for pickup' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

// The design has no "Declined" tab; declined orders sit with the cancelled ones.
const tabMatches = (tab: Tab, status: OrderStatus) =>
  tab === 'all' || status === tab || (tab === 'cancelled' && status === 'declined')

const RANGES = ['Last 7 days', 'Last 30 days', 'This month', 'All time'] as const
type Range = (typeof RANGES)[number]
const NOW = new Date('2024-09-25T00:00:00')
const inRange = (o: Order, range: Range) => {
  const d = new Date(o.placedAt)
  const days = (NOW.getTime() - d.getTime()) / 86_400_000
  if (range === 'Last 7 days') return days <= 7
  if (range === 'Last 30 days') return days <= 30
  if (range === 'This month') return d.getMonth() === NOW.getMonth() && d.getFullYear() === NOW.getFullYear()
  return true
}

// Figma 561:3444 etc.: 120 tall, radius 20, label 14/24 Medium, figure 32/48 Bold, note 12/15 Regular.
function StatCard({ label, value, sub, gradient }: { label: string; value: number; sub?: string; gradient?: boolean }) {
  return (
    <div
      className="h-[120px] rounded-[20px] overflow-hidden pl-[25px] pr-[24px] pt-[16px] pb-[16px] flex flex-col gap-[16px]"
      style={
        gradient
          ? // BUILDER: Figma gradient handles for the 261×120 card, converted to a CSS angle + stop offsets.
            { backgroundImage: 'linear-gradient(145.26deg, #aee74a -34.3%, #007c53 56.1%)' }
          : { background: 'white' }
      }
    >
      <p className="text-[14px] leading-[24px]" style={{ ...jakarta(500), color: gradient ? 'white' : '#807e7e' }}>
        {label}
      </p>
      <div className="flex items-baseline gap-[8px]">
        <p className="text-[32px] leading-[48px]" style={{ ...jakarta(700), color: gradient ? 'white' : '#101604' }}>
          {value}
        </p>
        {sub && (
          <p
            className="text-[12px] leading-[15px]"
            style={{ ...jakarta(400), color: gradient ? 'rgba(255,255,255,0.75)' : '#807e7e' }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

const HEAD = 'text-[#807e7e] text-[12px] leading-[15px] tracking-[-0.06px] whitespace-nowrap'
const CELL = 'text-[#101928] text-[14px] leading-[24px]'

export default function Orders() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [range, setRange] = useState<Range>('Last 7 days')
  const [rangeOpen, setRangeOpen] = useState(false)
  const [page, setPage] = useState(1)

  const counts = useMemo(() => {
    const c: Record<Tab, number> = {
      all: 0,
      new: 0,
      processing: 0,
      ready: 0,
      dispatched: 0,
      completed: 0,
      cancelled: 0,
      declined: 0,
    }
    for (const o of orders) {
      c.all += 1
      c[o.status] += 1
    }
    c.cancelled += c.declined
    return c
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter(
      (o) =>
        tabMatches(tab, o.status) &&
        inRange(o, range) &&
        (!q ||
          o.id.toLowerCase().includes(q) ||
          o.buyer.name.toLowerCase().includes(q) ||
          o.item.title.toLowerCase().includes(q)),
    )
  }, [tab, query, range])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const select = (next: Tab) => {
    setTab(next)
    setPage(1)
  }

  const thisMonth = orders.filter((o) => o.status === 'completed' && inRange(o, 'This month')).length
  const inProgress = orders.filter(
    (o) => o.status === 'processing' || o.status === 'ready' || o.status === 'dispatched',
  ).length

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[24px] flex flex-col gap-[24px]">
        {/* Heading (561:3641): title 24/32 SemiBold, intro 16/24 Regular, gap 8 */}
        <div className="flex flex-col gap-[8px] max-w-[490px]">
          <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Orders
          </h1>
          <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
            View, track and manage every customer order in one place.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-[16px]">
          <StatCard label="Total Orders" value={orders.length} sub="all time" gradient />
          <StatCard label="Awaiting orders" value={counts.new} />
          <StatCard label="In progress" value={inProgress} />
          <StatCard label="Completed orders" value={thisMonth} sub="this month" />
        </div>

        {/* All orders panel (561:3651): white, radius 20, padding 24 */}
        <div className="bg-white rounded-[20px] p-[24px] flex flex-col">
          <div className="flex flex-col gap-[8px] max-w-[429px]">
            <p className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
              All orders
            </p>
            <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
              Accept orders and prepare them for pickup. We’ll handle the rest.
            </p>
          </div>

          {/* Status tabs (561:3935): pills pad 10/12 radius 30, gap 12; count pill pad 2/6, 9px Bold */}
          <div className="mt-[16px] flex items-center gap-[12px] flex-wrap" role="tablist" aria-label="Order status">
            {TABS.map(({ key, label }) => {
              const active = key === tab
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => select(key)}
                  className="flex items-center gap-[7px] h-[35px] px-[12px] rounded-[30px] transition-colors"
                  style={{ background: active ? '#f2f8f6' : '#f7f7f7' }}
                >
                  <span
                    className="text-[12px] leading-[15px] whitespace-nowrap"
                    style={{ ...jakarta(active ? 600 : 500), color: active ? '#007c53' : '#807e7e' }}
                  >
                    {label}
                  </span>
                  <span
                    className="flex items-center justify-center h-[15px] px-[6px] rounded-full text-[9px] leading-[11px]"
                    style={{
                      ...jakarta(700),
                      background: active ? '#007c53' : '#f7f7f7',
                      color: active ? '#ffffff' : '#807e7e',
                    }}
                  >
                    {counts[key]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search + range + filters (561:4005) */}
          <div className="mt-[16px] flex items-center justify-between gap-[16px]">
            <label className="flex items-center gap-[8px] h-[48px] w-[588px] max-w-full px-[16px] rounded-[30px] bg-[#f7f7f7]">
              <img src={searchIcon} alt="" className="size-[20px] shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search order, buyer, item ..."
                aria-label="Search orders"
                className="flex-1 min-w-0 bg-transparent outline-none text-[13px] leading-[16px] text-[#101604] placeholder:text-[#807e7e]"
                style={jakarta(400)}
              />
            </label>
            <div className="flex items-center gap-[16px] shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRangeOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={rangeOpen}
                  className="flex items-center justify-center gap-[8px] h-[48px] px-[16px] rounded-[30px] bg-[#f7f7f7]"
                >
                  <img src={calendarIcon} alt="" className="size-[20px]" />
                  <span className="text-[#101604] text-[13px] leading-[16px] whitespace-nowrap" style={jakarta(600)}>
                    {range}
                  </span>
                  <img src={arrowDownIcon} alt="" className="size-[16px]" />
                </button>
                {rangeOpen && (
                  <ul
                    role="listbox"
                    className="absolute right-0 top-[56px] z-20 w-[180px] bg-white rounded-[15px] p-[8px] shadow-[0_12px_32px_rgba(16,22,4,0.12)]"
                  >
                    {RANGES.map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={r === range}
                          onClick={() => {
                            setRange(r)
                            setRangeOpen(false)
                            setPage(1)
                          }}
                          className="w-full text-left h-[40px] px-[12px] rounded-[10px] text-[13px] hover:bg-[#f7f7f7]"
                          style={{ ...jakarta(r === range ? 600 : 500), color: r === range ? '#007c53' : '#101604' }}
                        >
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                className="flex items-center justify-center gap-[8px] h-[48px] px-[16px] rounded-[30px] bg-[#f7f7f7]"
              >
                <img src={filterIcon} alt="" className="size-[20px]" />
                <span className="text-[#101604] text-[13px] leading-[16px]" style={jakarta(600)}>
                  Filters
                </span>
                <img src={arrowDownIcon} alt="" className="size-[16px]" />
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            /* Empty state (orders 561:3689): illustration 200, title 20/25 SemiBold, copy 14/24 */
            <div className="flex flex-col items-center py-[64px]">
              <div className="relative size-[200px]">
                <div className="absolute h-[140px] left-[23.57px] top-[16.07px] w-[153.208px]">
                  <img src={emptyBg} alt="" className="absolute block inset-0 max-w-none size-full" />
                </div>
                <div className="absolute flex h-[162.27px] items-center justify-center left-[31.56px] top-[21.67px] w-[137.713px]">
                  <div style={{ transform: 'rotate(-20.53deg)' }}>
                    <img
                      src={emptyIllustration}
                      alt=""
                      className="block max-w-none"
                      style={{ width: '95.564px', height: '137.487px' }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-[8px] items-center text-center w-[429px] max-w-full">
                <p className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
                  No order yet
                </p>
                <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                  New orders will appear here as soon as customers place them.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Table (561:4221): 1px #f7f7f7 frame, radius 10; header 44 + 1px #807e7e rule; rows 72 + 1px #f7f7f7 */}
              <div className="mt-[24px] rounded-[10px] border border-[#f7f7f7] overflow-hidden">
                <table className="w-full table-fixed border-collapse">
                  <colgroup>
                    <col style={{ width: 192 }} />
                    <col style={{ width: 146 }} />
                    <col />
                    <col style={{ width: 105 }} />
                    <col style={{ width: 119 }} />
                    <col style={{ width: 104 }} />
                    <col style={{ width: 100 }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-[#f7f7f7] border-b border-[#807e7e]">
                      <th className={`h-[44px] px-[24px] text-left ${HEAD}`} style={jakarta(600)}>
                        Order
                      </th>
                      <th className={`h-[44px] px-[24px] text-left ${HEAD}`} style={jakarta(600)}>
                        Buyer
                      </th>
                      <th className={`h-[44px] px-[24px] text-left ${HEAD}`} style={jakarta(600)}>
                        Items
                      </th>
                      <th className={`h-[44px] px-[24px] text-center ${HEAD}`} style={jakarta(600)}>
                        Quantity
                      </th>
                      <th className={`h-[44px] px-[24px] text-right ${HEAD}`} style={jakarta(600)}>
                        Price
                      </th>
                      <th className={`h-[44px] px-[24px] text-center ${HEAD}`} style={jakarta(600)}>
                        Delivery
                      </th>
                      <th className={`h-[44px] px-[24px] text-center ${HEAD}`} style={jakarta(600)}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => navigate(`/dashboard/orders/${o.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            navigate(`/dashboard/orders/${o.id}`)
                          }
                        }}
                        tabIndex={0}
                        className="bg-white border-b border-[#f7f7f7] last:border-b-0 cursor-pointer hover:bg-[#fbfbfb] focus-visible:outline-2 focus-visible:outline-[#007c53] focus-visible:-outline-offset-2"
                      >
                        <td className="p-0">
                          <div className="h-[72px] px-[24px] flex flex-col justify-center">
                            <p className={CELL} style={jakarta(600)}>
                              {o.id}
                            </p>
                            <p className="text-[#807e7e] text-[12px] leading-[17px] truncate" style={jakarta(400)}>
                              {o.placed}
                            </p>
                          </div>
                        </td>
                        <td className="p-0">
                          <div className="h-[72px] px-[24px] flex flex-col justify-center">
                            <p className={CELL} style={jakarta(400)}>
                              {o.buyer.name}
                            </p>
                          </div>
                        </td>
                        <td className="p-0">
                          <div className="h-[72px] px-[24px] flex flex-col justify-center">
                            <div className="flex items-center gap-[12px] min-w-0">
                              <span className="relative size-[40px] shrink-0 rounded-full overflow-hidden ring-[1.5px] ring-white">
                                <img src={o.item.image} alt="" className="size-full object-cover" />
                              </span>
                              <p className={`${CELL} capitalize truncate`} style={jakarta(400)}>
                                {o.item.title}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-0 text-center">
                          <div className="h-[72px] px-[24px] flex flex-col justify-center">
                            <p className={`${CELL} whitespace-nowrap`} style={jakarta(400)}>
                              {o.item.qty}x ({o.item.weightKg} kg)
                            </p>
                          </div>
                        </td>
                        <td className="p-0 text-right">
                          <div className="h-[72px] px-[24px] flex flex-col justify-center">
                            <p className={`${CELL} whitespace-nowrap`} style={jakarta(400)}>
                              {naira(o.item.price)}
                            </p>
                          </div>
                        </td>
                        <td className="p-0 text-center">
                          <div className="h-[72px] px-[24px] flex flex-col justify-center">
                            <p className={CELL} style={jakarta(400)}>
                              {o.delivery.method}
                            </p>
                          </div>
                        </td>
                        <td className="p-0">
                          <div className="h-[72px] flex items-center justify-center">
                            <OrderStatusBadge status={o.status} maxWidth={92} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination (561:5295): 74 tall, padding 16/64, gap 16, 1px #f7f7f7 frame, radius 20 */}
              <Pager page={current} pageCount={pageCount} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
