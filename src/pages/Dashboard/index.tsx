import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../feature/authentication/useAuth'
import salesEmptyGraph from '../../assets/images/db-graph-sales-empty.svg'
import viewsEmptyGraph from '../../assets/images/db-graph-views-empty.svg'
import salesGraph from '../../assets/images/db-graph-sales.svg'
import viewsGraph from '../../assets/images/db-graph-views.svg'
import pinIcon from '../../assets/icons/db-pin.svg'
import pin1Icon from '../../assets/icons/db-pin1.svg'
import tooltipBgIcon from '../../assets/icons/db-tooltip-bg.svg'
import emptyBgIcon from '../../assets/icons/db-empty-bg.svg'
import emptyIllustrationIcon from '../../assets/icons/db-empty-illustration.svg'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import arrowUpIcon from '../../assets/icons/db-arrow-up.svg'
import addIcon from '../../assets/icons/db-add.svg'
import productThumb from '../../assets/images/db-product-thumb.png'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

// Set to true to show the populated data state
const HAS_ORDERS = false

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']

function StatCard({ label, value, sub, gradient }: { label: string; value: string; sub?: string; gradient?: boolean }) {
  return (
    <div
      className="h-[120px] rounded-[20px] overflow-hidden px-[24px] pt-[16px] pb-[12px] flex flex-col justify-between"
      style={
        gradient
          ? { backgroundImage: 'linear-gradient(175.03deg, rgb(174, 231, 74) 61.818%, rgb(0, 124, 83) 74.686%)' }
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
          <p className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

function ChartCard({
  title,
  graphSrc,
  pinSrc,
  pinLabel,
  pinValue,
  pinValueSuffix,
}: {
  title: string
  graphSrc: string
  pinSrc: string
  pinLabel: string
  pinValue: string
  pinValueSuffix?: string
}) {
  return (
    <div className="bg-white rounded-[20px] h-[322px] flex-1 overflow-hidden relative">
      {/* Title */}
      <p
        className="absolute top-[24px] left-[24px] text-[#101604] text-[16px] leading-[24px] z-10"
        style={jakarta(600)}
      >
        {title}
      </p>

      {/* 7 days pill */}
      <div className="absolute top-[16px] right-[24px] bg-[#f7f7f7] flex gap-[8px] h-[40px] items-center justify-center px-[16px] rounded-[30px] z-10">
        <p className="text-[#101604] text-[13px]" style={jakarta(600)}>
          7 days
        </p>
        <div className="relative shrink-0 size-[16px]">
          <img src={arrowDownIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
        </div>
      </div>

      {/* Graph SVG fills card, leaving 52px at bottom for labels */}
      <div className="absolute inset-[0_0_52px_0]">
        <img src={graphSrc} alt="" className="absolute block inset-0 max-w-none size-full" />
      </div>

      {/* Tooltip pin overlay */}
      <div className="absolute z-10" style={{ bottom: '68px', left: '50%', transform: 'translateX(-17px)' }}>
        <div className="relative w-[134px] h-[62px]">
          {/* Pin dot */}
          <div className="absolute top-[10px] left-0 size-[10px]">
            <img src={pinSrc} alt="" className="block size-full" />
          </div>
          {/* Tooltip bubble bg */}
          <div className="absolute inset-[0_0_0_22px]">
            <img src={tooltipBgIcon} alt="" className="block size-full" />
          </div>
          {/* Day label */}
          <p
            className="absolute text-[#807e7e] text-[14px] leading-[21px] whitespace-nowrap"
            style={{ ...jakarta(400), top: 'calc(50% - 24px)', left: '44px' }}
          >
            {pinLabel}
          </p>
          {/* Value */}
          <p
            className="absolute text-[#101604] text-[16px] leading-none whitespace-nowrap"
            style={{ ...jakarta(700), top: 'calc(50% - 1px)', left: '44px' }}
          >
            {pinValue}
            {pinValueSuffix && (
              <span className="text-[#807e7e] text-[13px]" style={jakarta(500)}>
                {' '}
                {pinValueSuffix}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Day labels */}
      <div className="absolute bottom-0 left-[26px] right-[26px] h-[36px] flex items-center justify-between">
        {DAYS.map((day) => (
          <p key={day} className="text-[#807e7e] text-[12px] leading-[20px] whitespace-nowrap" style={jakarta(400)}>
            {day}
          </p>
        ))}
      </div>
    </div>
  )
}

function OrdersTable() {
  const rows = [
    {
      id: 'EA-0828-0229',
      date: 'September 24, 01:35AM',
      buyer: 'Adaora Amunike',
      item: 'Farm fresh plum tomatoes',
      qty: '1x (12 kg)',
      price: '₦24,000.00',
      delivery: 'Car',
    },
    {
      id: 'EA-0828-0229',
      date: 'September 19, 11:27PM',
      buyer: 'Mitchelle Obi',
      item: 'Sweet potatoes',
      qty: '2x (16 kg)',
      price: '₦15,000.00',
      delivery: 'Motorbike',
    },
  ]

  return (
    <div className="mt-[24px] w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#f7f7f7] border-b border-[#807e7e]">
            {['Order', 'Buyer', 'Items', 'Quantity', 'Price'].map((col) => (
              <th
                key={col}
                className="px-[24px] py-[12px] text-left text-[#807e7e] text-[12px] tracking-[-0.06px] whitespace-nowrap"
                style={jakarta(600)}
              >
                {col}
              </th>
            ))}
            <th
              className="px-[24px] py-[12px] text-center text-[#807e7e] text-[12px] tracking-[-0.06px] whitespace-nowrap"
              style={jakarta(600)}
            >
              Delivery
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#f7f7f7]">
              <td className="px-[24px] py-[16px]">
                <p className="text-[#101928] text-[14px] leading-[24px]" style={jakarta(600)}>
                  {row.id}
                </p>
                <p className="text-[#807e7e] text-[12px] leading-none overflow-hidden text-ellipsis whitespace-nowrap">
                  {row.date}
                </p>
              </td>
              <td className="px-[24px] py-[16px]">
                <p className="text-[#101928] text-[14px] leading-[24px]" style={jakarta(400)}>
                  {row.buyer}
                </p>
              </td>
              <td className="px-[24px] py-[16px]">
                <div className="flex gap-[12px] items-center">
                  <div className="size-[40px] rounded-full overflow-hidden border-[1.5px] border-white shrink-0">
                    <img src={productThumb} alt="" className="size-full object-cover" />
                  </div>
                  <p
                    className="text-[#101928] text-[14px] leading-[24px] capitalize whitespace-nowrap"
                    style={jakarta(400)}
                  >
                    {row.item}
                  </p>
                </div>
              </td>
              <td className="px-[24px] py-[16px]">
                <p className="text-[#101928] text-[14px] leading-[24px] whitespace-nowrap" style={jakarta(400)}>
                  {row.qty}
                </p>
              </td>
              <td className="px-[24px] py-[16px]">
                <p className="text-[#101928] text-[14px] leading-[24px] whitespace-nowrap" style={jakarta(400)}>
                  {row.price}
                </p>
              </td>
              <td className="px-[24px] py-[16px] text-center">
                <p className="text-[#101928] text-[14px] leading-[24px] whitespace-nowrap" style={jakarta(400)}>
                  {row.delivery}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DashboardOverview() {
  const navigate = useNavigate()
  const { account } = useAuth()
  const earned = HAS_ORDERS ? '₦16,178.75' : '₦0.00'
  const completed = HAS_ORDERS ? '3' : '0'
  const rating = HAS_ORDERS ? '4.8' : '0'
  const ratingReviews = HAS_ORDERS ? 'from 2 reviews' : undefined
  const salesSrc = HAS_ORDERS ? salesGraph : salesEmptyGraph
  const viewsSrc = HAS_ORDERS ? viewsGraph : viewsEmptyGraph
  const salesPinValue = HAS_ORDERS ? '₦4,700.05' : '₦0.00'
  const viewsPinValue = HAS_ORDERS ? '23' : '0'
  const viewsPinSuffix = HAS_ORDERS ? 'views' : undefined

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[36px] pb-[24px]">
        {/* Header row: greeting + Add product CTA */}
        <div className="flex items-center justify-between">
          <p className="text-[#101604] text-[32px] leading-[40px]" style={jakarta(700)}>
            Welcome, {account?.firstName ?? ''}
          </p>

          <button
            type="button"
            onClick={() => navigate('/dashboard/products/add')}
            className="flex gap-[8px] h-[48px] items-center justify-center px-[24px] rounded-[30px] w-[168px] shrink-0"
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
        <div className="mt-[20px] grid grid-cols-4 gap-[16px]">
          <StatCard label="Earned this week" value={earned} gradient />
          <StatCard label="Awaiting orders" value="0" />
          <StatCard label="Completed orders" value={completed} />
          <StatCard label="Rating" value={rating} sub={ratingReviews} />
        </div>

        {/* Charts row */}
        <div className="mt-[24px] flex gap-[16px]">
          <ChartCard
            title="Sales Activities"
            graphSrc={salesSrc}
            pinSrc={pinIcon}
            pinLabel="Wed."
            pinValue={salesPinValue}
          />
          <ChartCard
            title="Views"
            graphSrc={viewsSrc}
            pinSrc={pin1Icon}
            pinLabel="Tue."
            pinValue={viewsPinValue}
            pinValueSuffix={viewsPinSuffix}
          />
        </div>

        {/* New orders panel */}
        <div className="mt-[24px] bg-white rounded-[20px] overflow-hidden">
          {/* Panel header */}
          <div className="flex items-start justify-between px-[24px] pt-[24px]">
            <div className="flex flex-col gap-[8px]">
              <p className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
                New orders
              </p>
              <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                Accept orders and prepare them for pickup. We&apos;ll handle the rest.
              </p>
            </div>
            {HAS_ORDERS && (
              <button type="button" onClick={() => navigate('/dashboard/orders')} className="flex gap-[8px] items-center">
                <p className="text-[#007c53] text-[14px] leading-[24px]" style={jakarta(500)}>
                  View all
                </p>
                <div className="relative size-[16px]">
                  <img
                    src={arrowUpIcon}
                    alt=""
                    className="absolute block inset-0 max-w-none size-full"
                    style={{ transform: 'rotate(90deg)' }}
                  />
                </div>
              </button>
            )}
          </div>

          {/* Panel body */}
          {HAS_ORDERS ? (
            <OrdersTable />
          ) : (
            <div className="flex flex-col items-center pt-[40px] pb-[64px]">
              {/* Empty state illustration */}
              <div className="relative size-[200px]">
                <div
                  className="absolute"
                  style={{ left: '23.57px', top: '16.07px', width: '153.208px', height: '140px' }}
                >
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

              {/* Empty state text */}
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
