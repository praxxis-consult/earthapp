import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Pager from '../../components/ui/Pager'
import DataTable from '../../components/ui/DataTable'
import EmptyBlock from '../../components/ui/EmptyBlock'
import StatCard from '../../components/ui/StatCard'
import searchIcon from '../../assets/icons/db-search.svg'
import calendarIcon from '../../assets/icons/db-calendar.svg'
import filterIcon from '../../assets/icons/db-filter.svg'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import { orders, type Order, type OrderStatus } from '../../data/orders'
import { orderColumns } from './orderColumns'
import { jakarta, SCROLL_ROW } from '../../utils/styles'

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

const ORDER_COLUMNS = orderColumns({ widths: { order: 192, buyer: 146, quantity: 105, price: 119, delivery: 104, status: 100 } })

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
      {/* The page fills the dashboard viewport: the list scrolls inside its panel and the pager stays on screen */}
      <div className="px-[24px] pt-[40px] pb-[24px] flex flex-col gap-[24px] md:h-full max-md:px-[16px] max-md:pt-[24px]">
        {/* Heading (561:3641): title 24/32 SemiBold, intro 16/24 Regular, gap 8 */}
        <div className="flex flex-col gap-[8px] max-w-[490px]">
          <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Orders
          </h1>
          <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
            View, track and manage every customer order in one place.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-[16px] max-lg:grid-cols-2">
          <StatCard label="Total Orders" value={orders.length} sub="all time" gradient />
          <StatCard label="Awaiting orders" value={counts.new} />
          <StatCard label="In progress" value={inProgress} />
          <StatCard label="Completed orders" value={thisMonth} sub="this month" />
        </div>

        {/* All orders panel (561:3651): white, radius 20, padding 24 */}
        <div className="relative bg-white rounded-[20px] p-[24px] flex flex-col md:flex-1 md:min-h-0 max-md:p-[16px]">
          <div className="flex flex-col gap-[8px] max-w-[429px]">
            <p className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
              All orders
            </p>
            <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
              Accept orders and prepare them for pickup. We’ll handle the rest.
            </p>
          </div>

          {/* Status tabs (561:3935): pills pad 10/12 radius 30, gap 12; count pill pad 2/6, 9px Bold */}
          <div className={`mt-[16px] flex items-center gap-[12px] flex-wrap ${SCROLL_ROW}`} role="tablist" aria-label="Order status">
            {TABS.map(({ key, label }) => {
              const active = key === tab
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => select(key)}
                  className="flex items-center gap-[7px] h-[35px] px-[12px] rounded-[30px] transition-colors max-md:shrink-0"
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
          <div className="mt-[16px] flex items-center justify-between gap-[16px] max-md:flex-col max-md:items-stretch max-md:gap-[12px]">
            <label className="flex items-center gap-[8px] h-[48px] w-[588px] max-w-full px-[16px] rounded-[30px] bg-[#f7f7f7] max-md:w-full">
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
            <div className="flex items-center gap-[16px] shrink-0 max-md:gap-[12px]">
              <div className="relative max-md:flex-1">
                <button
                  type="button"
                  onClick={() => setRangeOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={rangeOpen}
                  className="flex items-center justify-center gap-[8px] h-[48px] px-[16px] rounded-[30px] bg-[#f7f7f7] max-md:w-full"
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
                className="flex items-center justify-center gap-[8px] h-[48px] px-[16px] rounded-[30px] bg-[#f7f7f7] max-md:flex-1"
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
            /* Empty state (orders 561:3689): illustration 200, title 20/25 SemiBold, copy 14/24. The frame centres it on the
               whole panel; on a screen tall enough for that it sits over the panel and centres there, otherwise it flows
               under the search row and centres in the space left, so it never overlaps the tabs. */
            <EmptyBlock
              className="justify-center md:flex-1 md:min-h-0 py-[16px] max-md:py-[48px] [@media(min-height:1100px)]:absolute [@media(min-height:1100px)]:inset-0 [@media(min-height:1100px)]:py-0"
              title="No order yet"
              copy="New orders will appear here as soon as customers place them."
            />
          ) : (
            <>
              {/* Table (561:4221): 1px #f7f7f7 frame, radius 10; header 44 + 1px #807e7e rule; rows 72 + 1px #f7f7f7 */}
              <DataTable
                rows={rows}
                rowKey={(o) => o.id}
                onRowClick={(o) => navigate(`/dashboard/orders/${o.id}`)}
                rowLabel={(o) => `Order ${o.id}, ${o.buyer.name}`}
                head="tinted"
                radius={10}
                designWidth={1043}
                scroll
                className="mt-[24px] md:min-h-0 md:flex-1 max-md:mt-[16px]"
                columns={ORDER_COLUMNS}
              />

              {/* Pagination (561:5295): 74 tall, padding 16/64, gap 16, 1px #f7f7f7 frame, radius 20 */}
              <div className="mt-[16px] max-md:mt-[16px]">
                <Pager page={current} pageCount={pageCount} onChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
