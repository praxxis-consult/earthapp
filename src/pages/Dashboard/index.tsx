import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import DataTable from '../../components/ui/DataTable'
import { useAuth } from '../../feature/authentication/useAuth'
import pinIcon from '../../assets/icons/db-pin.svg'
import pin1Icon from '../../assets/icons/db-pin1.svg'
import tooltipBgIcon from '../../assets/icons/db-tooltip-bg.svg'
import emptyBgIcon from '../../assets/icons/db-empty-bg.svg'
import emptyIllustrationIcon from '../../assets/icons/db-empty-illustration.svg'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import addIcon from '../../assets/icons/db-add.svg'
import LineChart, { type ChartPoint } from '../../components/ui/LineChart'
import { DAYS, DAY_X, overview, type ChartSeries } from '../../data/overview'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'
import { orderColumns } from './orderColumns'

/**
 * "Earned this week" (464:8211). The frame's gradient handles sit outside the 261×120 card
 * (start (-0.09,-0.72), end (0.39,0.81), width (-0.81,-0.58) in its normalized space), and its
 * colour bands run parallel to the width handle, which on a card this wide is only 5° off
 * horizontal. Solved into CSS that is 175.03° with the lime stop at -61.9% and the green stop
 * at 74.7% of the gradient line: the top-left corner is already half way to green and the
 * bottom edge is fully green. (Sampled against the frame's own export: within 1/255.)
 */
const EARNED_BG = 'linear-gradient(175.03deg, #aee74a -61.9%, #007c53 74.7%)'

/** Columns measured on the overview frame (464:8329): a 1041px table inside its 1px frame. */
const RECENT_COLUMNS = orderColumns({
  widths: { order: 206, buyer: 161, quantity: 110, price: 128, delivery: 160 },
  quantityAlign: 'left',
  status: false,
})

function StatCard({ label, value, sub, gradient }: { label: string; value: string; sub?: string; gradient?: boolean }) {
  return (
    <div
      className="h-[120px] rounded-[20px] overflow-hidden px-[24px] pt-[16px] pb-[16px] flex flex-col justify-between"
      style={gradient ? { backgroundImage: EARNED_BG } : { background: 'white' }}
    >
      <p className="text-[14px] leading-[24px]" style={{ ...jakarta(500), color: gradient ? 'white' : '#807e7e' }}>
        {label}
      </p>
      <div className="flex items-start gap-[8px]">
        <p className="text-[32px] leading-[48px]" style={{ ...jakarta(700), color: gradient ? 'white' : '#101604' }}>
          {value}
        </p>
        {sub && (
          // The frame (464:8222) puts the caption 22px below the value's top, not on its baseline.
          <p className="text-[#807e7e] text-[12px] leading-[15px] mt-[22px]" style={jakarta(400)}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * The chart tooltip ("Pin", 464:8231): a 134×62.56 frame whose ringed dot (18×18.77, centred
 * on the data point) sits 10.43px down at the left and whose bubble starts 22px in. Both assets
 * are exported with their shadow margins (the dot in a 30×31 box offset 6/4, the bubble in
 * 183×133 offset 30.2/20.2), so they are drawn at their natural size and shifted back.
 */
function Pin({ point, series, icon }: { point: ChartPoint; series: ChartSeries; icon: string }) {
  const { value, suffix } = series.format(point.value)
  return (
    <div
      className="absolute z-10 w-[134px] h-[63px] pointer-events-none"
      style={{ left: point.x - 9, top: point.y - 19.8 }}
    >
      <img src={tooltipBgIcon} alt="" className="absolute block max-w-none w-[183px] h-[133px] -left-[8.17px] -top-[20.2px]" />
      <img src={icon} alt="" className="absolute block max-w-none w-[30px] h-[31px] -left-[6px] top-[6.43px]" />
      <p className="absolute left-[44px] top-[7.75px] text-[#807e7e] text-[14px] leading-[21px] whitespace-nowrap" style={jakarta(400)}>
        {DAYS[point.index]}.
      </p>
      <p className="absolute left-[44px] top-[30.69px] text-[#101604] text-[16px] leading-[20px] whitespace-nowrap" style={jakarta(700)}>
        {value}
        {suffix && (
          <span className="text-[#807e7e] text-[13px]" style={jakarta(500)}>
            {' '}
            {suffix}
          </span>
        )}
      </p>
    </div>
  )
}

/**
 * "Sales Activities" / "Views" (464:8224, 464:8290): a 322-tall white card; the graph fills
 * the top 270px, the title sits at 24/24, the "7 days" pill at 16 from the top and 24 from the
 * right, and the day labels run 26px in from each side on a line 286px down.
 */
function ChartCard({
  title,
  series,
  color,
  areaColor,
  pinIcon: icon,
}: {
  title: string
  series: ChartSeries
  color: string
  areaColor: string
  pinIcon: string
}) {
  return (
    <div className="bg-white rounded-[20px] h-[322px] flex-1 min-w-0 overflow-hidden relative max-lg:flex-none max-lg:w-full">
      <LineChart
        values={series.values}
        xs={DAY_X}
        color={color}
        areaColor={areaColor}
        highlight={series.highlight}
        pin={(point) => <Pin point={point} series={series} icon={icon} />}
        className="absolute left-0 top-0 w-full"
      />
      <p className="absolute top-[24px] left-[24px] text-[#101604] text-[16px] leading-[24px] z-10" style={jakarta(600)}>
        {title}
      </p>
      <button
        type="button"
        title="Only the last 7 days are available yet"
        className="absolute top-[16px] right-[24px] bg-[#f7f7f7] flex gap-[8px] h-[40px] items-center justify-center px-[16px] rounded-[30px] z-10 cursor-default"
      >
        <span className="text-[#101604] text-[13px] leading-[16px]" style={jakarta(600)}>
          7 days
        </span>
        <img src={arrowDownIcon} alt="" className="block size-[16px]" />
      </button>
      <div className="absolute left-[26px] right-[25px] flex items-center justify-between" style={{ top: 286 }}>
        {DAYS.map((day) => (
          <p key={day} className="text-[#807e7e] text-[12px] leading-[20px] whitespace-nowrap" style={jakarta(400)}>
            {day}
          </p>
        ))}
      </div>
    </div>
  )
}

/**
 * Dashboard overview (459:1048; the empty state 431:4736). Content starts 24px in and 36px
 * down: the greeting row (48 tall), the four 120px stat cards 20px below, the two chart cards
 * 24px below that, then the "New orders" card with its 24px padding.
 */
export default function DashboardOverview() {
  const navigate = useNavigate()
  const { account } = useAuth()
  const data = overview
  const hasOrders = data.recentOrders.length > 0

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[36px] pb-[24px] max-md:px-[16px] max-md:pt-[24px]">
        {/* Header row: greeting + Add product CTA */}
        <div className="flex items-center justify-between max-md:flex-col max-md:items-stretch max-md:gap-[16px]">
          <p className="text-[#101604] text-[32px] leading-[40px] max-md:text-[24px] max-md:leading-[32px]" style={jakarta(700)}>
            Welcome, {account?.firstName ?? ''}
          </p>

          <button
            type="button"
            onClick={() => navigate('/dashboard/products/add')}
            className="flex gap-[8px] h-[48px] items-center justify-center px-[24px] rounded-[30px] w-[168px] shrink-0 max-md:w-full"
            style={{ backgroundImage: CTA_BG }}
          >
            <div className="relative shrink-0 size-[24px]">
              <img src={addIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
            </div>
            <span
              className="bg-clip-text text-[14px] text-transparent text-center tracking-[-0.14px] whitespace-nowrap"
              style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}
            >
              Add product
            </span>
          </button>
        </div>

        {/* Stat cards */}
        <div className="mt-[20px] grid grid-cols-4 gap-[16px] max-xl:grid-cols-2 max-md:grid-cols-1">
          <StatCard label="Earned this week" value={data.earnedThisWeek} gradient />
          <StatCard label="Awaiting orders" value={String(data.awaitingOrders)} />
          <StatCard label="Completed orders" value={String(data.completedOrders)} />
          <StatCard label="Rating" value={data.rating} sub={data.reviews ? `from ${data.reviews} reviews` : undefined} />
        </div>

        {/* Charts row */}
        <div className="mt-[24px] flex gap-[16px] max-lg:flex-col">
          {/* Line and fade colours from the frame's vectors: sales #007c53 over #3ad384, views #3dbbe2 over itself */}
          <ChartCard title="Sales Activities" series={data.sales} color="#007c53" areaColor="#3ad384" pinIcon={pinIcon} />
          <ChartCard title="Views" series={data.views} color="#3dbbe2" areaColor="#3dbbe2" pinIcon={pin1Icon} />
        </div>

        {/* New orders card (464:8253): 24px padding, the header row 57 tall, the table 24px below it */}
        <div className="mt-[24px] bg-white rounded-[20px] p-[24px] max-md:p-[16px]">
          <div className="flex items-center justify-between gap-[24px] max-md:flex-col max-md:items-start max-md:gap-[12px]">
            <div className="flex flex-col gap-[8px]">
              <p className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
                New orders
              </p>
              <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                Accept orders and prepare them for pickup. We&apos;ll handle the rest.
              </p>
            </div>
            {hasOrders && (
              <button type="button" onClick={() => navigate('/dashboard/orders')} className="flex gap-[8px] items-center shrink-0">
                <span className="text-[#007c53] text-[14px] leading-[24px]" style={jakarta(500)}>
                  View all
                </span>
                <img src={arrowDownIcon} alt="" className="block size-[16px] -rotate-90" />
              </button>
            )}
          </div>

          {hasOrders ? (
            <DataTable
              rows={data.recentOrders}
              rowKey={(o) => o.id}
              onRowClick={(o) => navigate(`/dashboard/orders/${o.id}`)}
              rowLabel={(o) => `Order ${o.id}, ${o.buyer.name}`}
              head="tinted"
              radius={10}
              designWidth={1041}
              className="mt-[24px] max-md:mt-[16px]"
              columns={RECENT_COLUMNS}
            />
          ) : (
            <div className="flex flex-col items-center pt-[40px] pb-[40px] max-md:pb-[24px]">
              {/* Empty state illustration (431:4736) */}
              <div className="relative size-[200px]">
                <div className="absolute" style={{ left: '23.57px', top: '16.07px', width: '153.208px', height: '140px' }}>
                  <img src={emptyBgIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                </div>
                <div
                  className="absolute flex items-center justify-center"
                  style={{ left: '31.56px', top: '21.67px', width: '137.713px', height: '162.27px' }}
                >
                  <div style={{ transform: 'rotate(-20.53deg)' }}>
                    <img src={emptyIllustrationIcon} alt="" style={{ width: '95.564px', height: '137.487px' }} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-[8px] items-center text-center">
                <p className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
                  No new order yet
                </p>
                <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                  New orders will appear here as soon as customers place them.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
