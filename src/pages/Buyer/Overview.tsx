import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import DataTable from '../../components/ui/DataTable'
import EmptyBlock from '../../components/ui/EmptyBlock'
import StatCard from '../../components/ui/StatCard'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import arrowRightIcon from '../../assets/icons/arrow-right.svg'
import { useAuth } from '../../feature/authentication/useAuth'
import { useUnreadChats } from '../../feature/chats/useUnreadChats'
import { EVERYWHERE, useListCatalogQuery } from '../../feature/marketplace/catalogApiSlice'
import { useListMyOrdersQuery } from '../../feature/orders/ordersApiSlice'
import { purchaseFromApi, purchaseStats } from '../../data/purchases'
import { describeError } from '../../services/earthApi'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'
import { orderColumns } from '../Dashboard/orderColumns'

/** The same column set as the seller's overview table, with the store in place of the buyer. */
const RECENT_COLUMNS = orderColumns({
  widths: { order: 206, buyer: 161, quantity: 110, price: 128, delivery: 160 },
  quantityAlign: 'left',
  status: false,
  party: 'seller',
})

/** How many of the newest listings the overview shows. */
const FRESH = 4

/**
 * The buyer's overview. There is no frame for it in the design file, so it follows the seller's
 * overview (459:1048) measure for measure: the greeting row with its 168px CTA, four 120px stat
 * cards, then the cards. What it holds is the buyer's: their latest orders and what is newest on
 * the marketplace, read from the same catalogue the marketplace shows.
 */
export default function BuyerOverview() {
  const navigate = useNavigate()
  const { account } = useAuth()
  const unread = useUnreadChats()
  const orders = useListMyOrdersQuery()
  const purchases = (orders.data ?? []).map(purchaseFromApi)
  const stats = purchaseStats(purchases)
  const recent = purchases.slice(0, 5)
  const fresh = useListCatalogQuery(EVERYWHERE)
  const listings = (fresh.data ?? []).slice(0, FRESH)

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[36px] pb-[24px] max-md:px-[16px] max-md:pt-[24px]">
        {/* Header row: greeting + Browse marketplace CTA */}
        <div className="flex items-center justify-between max-md:flex-col max-md:items-stretch max-md:gap-[16px]">
          <div className="flex flex-col gap-[4px]">
            <p className="text-[#101604] text-[32px] leading-[40px] max-md:text-[24px] max-md:leading-[32px]" style={jakarta(700)}>
              Welcome, {account?.firstName ?? ''}
            </p>
            <p className="text-[#807e7e] text-[13px] leading-[20px]" style={jakarta(400)}>
              Everything you order on Earth is tracked here, from payment to delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="flex gap-[8px] h-[48px] items-center justify-center px-[24px] rounded-[30px] w-[200px] shrink-0 max-md:w-full"
            style={{ backgroundImage: CTA_BG }}
          >
            <span
              className="bg-clip-text text-[14px] text-transparent text-center tracking-[-0.14px] whitespace-nowrap"
              style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}
            >
              Browse marketplace
            </span>
            <img src={arrowRightIcon} alt="" className="block size-[16px]" />
          </button>
        </div>

        {/* Stat cards */}
        <div className="mt-[20px] grid grid-cols-4 gap-[16px] max-xl:grid-cols-2 max-md:grid-cols-1">
          <StatCard label="Orders placed" value={String(stats.total)} sub="all time" gradient />
          <StatCard label="Awaiting seller" value={String(stats.awaiting)} />
          <StatCard label="On the way" value={String(stats.inProgress)} />
          <StatCard label="Unread messages" value={String(unread)} />
        </div>

        {/* Recent orders card */}
        <div className="mt-[24px] bg-white rounded-[20px] p-[24px] max-md:p-[16px]">
          <div className="flex items-center justify-between gap-[24px] max-md:flex-col max-md:items-start max-md:gap-[12px]">
            <div className="flex flex-col gap-[8px]">
              <p className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
                Recent orders
              </p>
              <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                The seller prepares your order and a carrier brings it. You confirm when it arrives.
              </p>
            </div>
            {recent.length > 0 && (
              <button type="button" onClick={() => navigate('/dashboard/purchases')} className="flex gap-[8px] items-center shrink-0">
                <span className="text-[#007c53] text-[14px] leading-[24px]" style={jakarta(500)}>
                  View all
                </span>
                <img src={arrowDownIcon} alt="" className="block size-[16px] -rotate-90" />
              </button>
            )}
          </div>

          {orders.error ? (
            <p role="alert" className="mt-[24px] text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
              {describeError(orders.error)}
            </p>
          ) : recent.length > 0 ? (
            <DataTable
              rows={recent}
              rowKey={(o) => o.id}
              onRowClick={(o) => navigate(`/dashboard/purchases/${o.id}`)}
              rowLabel={(o) => `Order ${o.id}, ${o.item.soldBy}`}
              head="tinted"
              radius={10}
              designWidth={1041}
              className="mt-[24px] max-md:mt-[16px]"
              columns={RECENT_COLUMNS}
            />
          ) : (
            <EmptyBlock
              className="pt-[40px] pb-[40px] max-md:pb-[24px]"
              title="No order yet"
              copy="Your orders will appear here as soon as you place one on the marketplace."
              action={
                <Link to="/marketplace" className="flex h-[48px] items-center justify-center rounded-[30px] bg-[#f7f7f7] px-[24px] text-[#101604] text-[14px]" style={jakarta(500)}>
                  Browse marketplace
                </Link>
              }
            />
          )}
        </div>

        {/* Fresh on the marketplace: the newest published listings, as the marketplace orders them */}
        <div className="mt-[24px] bg-white rounded-[20px] p-[24px] max-md:p-[16px]">
          <div className="flex items-center justify-between gap-[24px] max-md:flex-col max-md:items-start max-md:gap-[12px]">
            <div className="flex flex-col gap-[8px]">
              <p className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
                Fresh on the marketplace
              </p>
              <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                The newest listings from farms, mines and stores on Earth.
              </p>
            </div>
            {listings.length > 0 && (
              <Link to="/marketplace" className="flex gap-[8px] items-center shrink-0">
                <span className="text-[#007c53] text-[14px] leading-[24px]" style={jakarta(500)}>
                  See all
                </span>
                <img src={arrowDownIcon} alt="" className="block size-[16px] -rotate-90" />
              </Link>
            )}
          </div>

          {fresh.isLoading ? (
            <div className="mt-[24px] grid grid-cols-4 gap-[16px] max-xl:grid-cols-2 max-md:grid-cols-1" aria-busy="true">
              {Array.from({ length: FRESH }, (_, i) => (
                <div key={i} className="h-[248px] rounded-[20px] bg-[#f7f7f7]" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <EmptyBlock
              className="pt-[40px] pb-[40px] max-md:pb-[24px]"
              title="Nothing listed yet"
              copy="Listings appear here the moment a store goes live. Check back soon."
            />
          ) : (
            <ul className="mt-[24px] grid grid-cols-4 gap-[16px] max-xl:grid-cols-2 max-md:grid-cols-1">
              {listings.map((p) => (
                <li key={p.id}>
                  <Link to={`/marketplace/${p.id}`} className="flex flex-col rounded-[20px] overflow-hidden shadow-[inset_0_0_0_1px_#f0f0f0] hover:shadow-[inset_0_0_0_1px_#e4dede]">
                    <div className="h-[160px] bg-[#eee] overflow-hidden shrink-0">
                      {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex flex-col gap-[4px] p-[16px]">
                      <p className="text-[#101604] text-[16px] leading-[24px] truncate" style={jakarta(600)}>
                        {p.title}
                      </p>
                      <p className="text-[#807e7e] text-[12px] leading-[20px] truncate" style={jakarta(400)}>
                        {p.store.storeName} · {p.location}
                      </p>
                      <p className="text-[#007c53] text-[14px] leading-[24px]" style={jakarta(700)}>
                        {p.price}
                        <span className="text-[#807e7e] text-[12px]" style={jakarta(500)}>
                          {' '}
                          / {p.unit}
                        </span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
