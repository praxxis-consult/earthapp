import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { shortOrderId } from '../../data/orders'
import Pager from '../../components/ui/Pager'
import DataTable from '../../components/ui/DataTable'
import EmptyBlock from '../../components/ui/EmptyBlock'
import StatCard from '../../components/ui/StatCard'
import searchIcon from '../../assets/icons/db-search.svg'
import { useListMyOrdersQuery } from '../../feature/orders/ordersApiSlice'
import { PURCHASE_TABS, filterPurchases, purchaseFromApi, purchaseStats, purchaseTabMatches, type PurchaseTab } from '../../data/purchases'
import { describeError } from '../../services/earthApi'
import { orderColumns } from '../Dashboard/orderColumns'
import { jakarta, SCROLL_ROW } from '../../utils/styles'

const PAGE_SIZE = 7

const COLUMNS = orderColumns({ widths: { order: 192, buyer: 146, quantity: 105, price: 119, delivery: 104, status: 100 }, party: 'seller' })

/**
 * The buyer's orders. No frame exists for it; it is the seller's orders page (561:3325) with the
 * buyer's words and columns: the store they bought from instead of the buyer, tabs named from the
 * buyer's side, and the list read from `GET /orders/me`.
 */
export default function Purchases() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<PurchaseTab>('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const orders = useListMyOrdersQuery()
  const purchases = useMemo(() => (orders.data ?? []).map(purchaseFromApi), [orders.data])
  const stats = purchaseStats(purchases)

  const counts = useMemo(() => {
    const c = Object.fromEntries(PURCHASE_TABS.map((t) => [t.key, 0])) as Record<PurchaseTab, number>
    for (const t of PURCHASE_TABS) c[t.key] = purchases.filter((o) => purchaseTabMatches(t.key, o.status)).length
    return c
  }, [purchases])

  const filtered = useMemo(() => filterPurchases(purchases, tab, query), [purchases, tab, query])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const select = (next: PurchaseTab) => {
    setTab(next)
    setPage(1)
  }

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[24px] flex flex-col gap-[24px] md:min-h-full max-md:px-[16px] max-md:pt-[24px]">
        <div className="flex flex-col gap-[8px] max-w-[490px]">
          <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Orders
          </h1>
          <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
            Track everything you ordered, from the seller’s acceptance to the day it arrives.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-[16px] max-lg:grid-cols-2">
          <StatCard label="Orders placed" value={stats.total} sub="all time" gradient />
          <StatCard label="Awaiting seller" value={stats.awaiting} />
          <StatCard label="On the way" value={stats.inProgress} />
          <StatCard label="Delivered" value={stats.completed} />
        </div>

        <div className="relative bg-white rounded-[20px] p-[24px] flex flex-col md:flex-1 max-md:p-[16px]">
          <div className="flex flex-col gap-[8px] max-w-[429px]">
            <p className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
              All orders
            </p>
            <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
              Open an order to see where it is, message the seller, or cancel it before it is prepared.
            </p>
          </div>

          <div className={`mt-[16px] flex items-center gap-[12px] flex-wrap ${SCROLL_ROW}`} role="tablist" aria-label="Order status">
            {PURCHASE_TABS.map(({ key, label }) => {
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
                  <span className="text-[12px] leading-[15px] whitespace-nowrap" style={{ ...jakarta(active ? 600 : 500), color: active ? '#007c53' : '#807e7e' }}>
                    {label}
                  </span>
                  <span
                    className="flex items-center justify-center h-[15px] px-[6px] rounded-full text-[9px] leading-[11px]"
                    style={{ ...jakarta(700), background: active ? '#007c53' : '#f7f7f7', color: active ? '#ffffff' : '#807e7e' }}
                  >
                    {counts[key]}
                  </span>
                </button>
              )
            })}
          </div>

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
                placeholder="Search order, store, item ..."
                aria-label="Search your orders"
                className="flex-1 min-w-0 bg-transparent outline-none text-[13px] leading-[16px] text-[#101604] placeholder:text-[#807e7e]"
                style={jakarta(400)}
              />
            </label>
          </div>

          {orders.error ? (
            <p role="alert" className="mt-[24px] text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
              {describeError(orders.error)}
            </p>
          ) : filtered.length === 0 ? (
            <EmptyBlock
              className="justify-center md:flex-1 md:min-h-0 py-[16px] max-md:py-[48px] [@media(min-height:1100px)]:absolute [@media(min-height:1100px)]:inset-0 [@media(min-height:1100px)]:py-0"
              title={purchases.length === 0 ? 'No order yet' : 'Nothing here'}
              copy={purchases.length === 0 ? 'Your orders will appear here as soon as you place one on the marketplace.' : 'No order matches this tab and search.'}
              action={
                purchases.length === 0 ? (
                  <Link to="/marketplace" className="flex h-[48px] items-center justify-center rounded-[30px] bg-[#f7f7f7] px-[24px] text-[#101604] text-[14px]" style={jakarta(500)}>
                    Browse marketplace
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <>
              <DataTable
                rows={rows}
                rowKey={(o) => o.id}
                onRowClick={(o) => navigate(`/dashboard/purchases/${o.id}`)}
                rowLabel={(o) => `Order ${shortOrderId(o.id)}, ${o.item.soldBy}`}
                head="tinted"
                radius={10}
                designWidth={1043}
                className="mt-[24px] max-md:mt-[16px]"
                columns={COLUMNS}
              />
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
