import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import DataTable from '../../components/ui/DataTable'
import StatCard from '../../components/ui/StatCard'
import bannerPhoto from '../../assets/images/bo-banner.jpg'
import arrowRightIcon from '../../assets/icons/bo-arrow-right.svg'
import emptyTrack from '../../assets/icons/bo-empty-track.svg'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import { useAuth } from '../../feature/authentication/useAuth'
import { EVERYWHERE, useListCatalogQuery } from '../../feature/marketplace/catalogApiSlice'
import { useListMyOrdersQuery } from '../../feature/orders/ordersApiSlice'
import { amountSpent, purchaseFromApi, purchaseStats } from '../../data/purchases'
import { naira } from '../../data/orders'
import { useSaved } from '../../lib/saved'
import { describeError } from '../../services/earthApi'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'
import { orderColumns } from '../Dashboard/orderColumns'

/** The seller overview's column set, with the store in place of the buyer. */
const RECENT_COLUMNS = orderColumns({
  widths: { order: 206, buyer: 161, quantity: 110, price: 128, delivery: 160 },
  quantityAlign: 'left',
  status: false,
  party: 'seller',
})

/**
 * The buyer's overview (806:7584 before the first order, 807:8678 after): the 1093×248 photo
 * banner with the greeting and the Browse marketplace button, four 120px stat cards (active,
 * completed, saved, amount spent) 24px below, and the Track orders panel 40px under them, with
 * the frame's empty block or the latest orders. The banner's line is real: the newest listing on
 * the marketplace, in place of the frame's sample price note.
 */
export default function BuyerOverview() {
  const navigate = useNavigate()
  const { account } = useAuth()
  const orders = useListMyOrdersQuery()
  const purchases = (orders.data ?? []).map(purchaseFromApi)
  const stats = purchaseStats(purchases)
  const spent = amountSpent(orders.data ?? [])
  const recent = purchases.slice(0, 5)
  const saved = useSaved(account?.id)
  const fresh = useListCatalogQuery(EVERYWHERE)
  const newest = fresh.data?.[0]

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[24px] max-md:px-[16px] max-md:pt-[24px]">
        {/* Banner (806:8382): the photo under a 50% #0c0b09 wash, radius 25; copy at 24/40, button 24 below it */}
        <section className="relative h-[248px] overflow-hidden rounded-[25px] max-md:h-auto">
          <img
            src={bannerPhoto}
            alt=""
            className="absolute inset-0 size-full object-cover"
            // The frame crops the 1095×615 photo 278px from its top; the same band on every width.
            style={{ objectPosition: '50% 75.7%' }}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(12,11,9,0.5)' }} />
          <div className="relative flex flex-col gap-[24px] px-[24px] pt-[40px] pb-[40px] max-md:px-[16px] max-md:pt-[24px] max-md:pb-[16px]">
            <div className="flex w-[515px] max-w-full flex-col gap-[8px]">
              <p className="text-white text-[32px] leading-[40px] max-md:text-[24px] max-md:leading-[32px]" style={jakarta(700)}>
                Hello, {account?.firstName ?? ''}
              </p>
              <p className="text-[16px] leading-[24px] max-md:text-[14px] max-md:leading-[20px]" style={{ ...jakarta(400), color: 'rgba(255,255,255,0.75)' }}>
                {newest
                  ? `${newest.title} is the newest listing on the marketplace: ${newest.price} per ${newest.unit} from ${newest.store.storeName} in ${newest.location}.`
                  : fresh.isLoading
                    ? 'Looking at what the farms, mines and stores listed this week…'
                    : 'Everything that grows from the land, from the people who grow it.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/marketplace')}
              className="flex h-[48px] w-[211px] shrink-0 items-center justify-center gap-[8px] rounded-[30px] bg-[#aee74a] px-[24px] max-md:w-full"
            >
              <span className="text-[#0c2310] text-[14px] leading-[18px] tracking-[-0.14px] whitespace-nowrap" style={jakarta(500)}>
                Browse marketplace
              </span>
              <img src={arrowRightIcon} alt="" className="block size-[24px]" />
            </button>
          </div>
        </section>

        {/* Stat cards (806:8381): four 261×120 cards, 16 apart, 24 under the banner */}
        <div className="mt-[24px] grid grid-cols-4 gap-[16px] max-xl:grid-cols-2 max-md:grid-cols-1">
          <StatCard label="Active orders" value={String(stats.awaiting + stats.inProgress)} gradient />
          <StatCard label="Completed orders" value={String(stats.completed)} />
          <StatCard label="Saved products" value={String(saved.list.length)} />
          <StatCard label="Amount spent" value={naira(spent)} />
        </div>

        {/* Track orders (806:7643): 518 tall, radius 20, padding 24; heading 20/25 + 14/24 */}
        <section className="mt-[40px] flex min-h-[518px] flex-col rounded-[20px] bg-white p-[24px] max-md:min-h-0 max-md:p-[16px]">
          <div className="flex items-start justify-between gap-[24px] max-md:flex-col max-md:gap-[12px]">
            <div className="flex w-[429px] max-w-full flex-col gap-[8px]">
              <p className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
                Track orders
              </p>
              <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                Follow every order here, from the seller’s hands to your door.
              </p>
            </div>
            {recent.length > 0 && (
              <button type="button" onClick={() => navigate('/dashboard/purchases')} className="flex shrink-0 items-center gap-[8px]">
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
              designWidth={1043}
              className="mt-[24px] max-md:mt-[16px]"
              columns={RECENT_COLUMNS}
            />
          ) : (
            /* Empty block (806:8488): the 200px illustration, title and copy in a 429px column, the 181×48 button 16 below */
            <div className="mt-[40px] flex flex-col items-center gap-[16px] max-md:mt-[24px]" aria-busy={orders.isLoading}>
              <div className="flex w-[429px] max-w-full flex-col items-center">
                <img src={emptyTrack} alt="" className="size-[200px]" />
                <div className="flex flex-col items-center gap-[8px] text-center">
                  <p className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
                    {orders.isLoading ? 'Loading your orders…' : 'No order on the way'}
                  </p>
                  <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                    When you pay for something, you can follow it here, from the farm to your door.
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => navigate('/marketplace')} className="flex h-[48px] w-[181px] items-center justify-center rounded-[30px] px-[24px]" style={{ backgroundImage: CTA_BG }}>
                <span className="bg-clip-text text-[14px] leading-[18px] tracking-[-0.14px] text-transparent whitespace-nowrap" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
                  Browse marketplace
                </span>
              </button>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
