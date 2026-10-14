import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import OrderStatusBadge from '../../components/ui/OrderStatusBadge'
import OrderStatusDialog from '../../components/ui/OrderStatusDialog'
import TrackDeliveryModal, { type TrackingStep } from '../../components/ui/TrackDeliveryModal'
import routingIcon from '../../assets/icons/rc-routing.svg'
import { useStore } from '../../feature/stores/useStore'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import receiptIcon from '../../assets/icons/od-receipt.svg'
import smsIcon from '../../assets/icons/od-sms.svg'
import checksIcon from '../../assets/icons/od-checks.svg'
import truckIcon from '../../assets/icons/od-truck.svg'
import truckTickIcon from '../../assets/icons/od-truck-tick.svg'
import noteIcon from '../../assets/icons/od-note.svg'
import locationIcon from '../../assets/icons/od-location.svg'
import truckFastIcon from '../../assets/icons/od-truck-fast.svg'
import calendarIcon from '../../assets/icons/od-calendar.svg'
import cardPosIcon from '../../assets/icons/od-card-pos.svg'
import stepDoneIcon from '../../assets/icons/od-step-done.svg'
import stepTodoIcon from '../../assets/icons/od-step-todo.svg'
import truckTimeLg from '../../assets/icons/od-truck-time-lg.svg'
import truckTimeSm from '../../assets/icons/od-truck-time-sm.svg'
import bagHappyLg from '../../assets/icons/od-bag-happy-lg.svg'
import bagHappySm from '../../assets/icons/od-bag-happy-sm.svg'
import bagCrossLg from '../../assets/icons/od-bag-cross-lg.svg'
import bagCrossSm from '../../assets/icons/od-bag-cross-sm.svg'
import { findOrder, initials, naira, orderTotal, type Order, type OrderStatus } from '../../data/orders'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

/** The seven steps on the timeline card; a status sits at an index on it. */
const STEPS = [
  'Order placed',
  'Payment confirmed',
  'Order accepted',
  'Packed and ready',
  'On the way',
  'Delivered',
  'Completed',
]
const REACHED: Record<OrderStatus, number> = {
  new: 2,
  processing: 3,
  ready: 4,
  dispatched: 5,
  completed: 7,
  cancelled: 0,
  declined: 0,
}

const fmt = (d: Date) =>
  `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .replace(' ', '')}`

/** Step times: the order's own timestamp, then the later steps spaced out the way the design shows. */
function stepTimes(o: Order): string[] {
  const base = new Date(o.placedAt).getTime()
  const offsets = [0, 0, 4.6, 6.2, 7.2, 30, 31].map((h) => h * 3_600_000)
  return offsets.map((ms) => fmt(new Date(base + ms)))
}

/** The rider on the frames (639:22896); the logistics API will supply the real one per order. */
const RIDER = { name: 'Samuel Boniface', vehicle: 'Car · APP 905 GH' }

/** Figma 639:22820's five rows; which have happened follows the order status. */
function trackingSteps(status: OrderStatus, storeName: string): TrackingStep[] {
  const first = RIDER.name.split(' ')[0]
  const times = status === 'completed' ? ['08:13 AM', '08:48 AM', '09:01 AM', '09:40 AM', '09:52 AM'] : ['08:13 AM', '08:48 AM', '09:01 AM', null, null]
  return [
    { title: 'Rider assigned', detail: `${RIDER.name} accepted the delivery`, at: times[0] },
    { title: 'Rider at the store', detail: `${first} reached ${storeName}`, at: times[1] },
    { title: 'Order picked up', detail: `${first} picked up the package`, at: times[2] },
    { title: 'Rider arrived', detail: `${first} arrived at buyer’s location`, at: times[3] },
    { title: 'Order delivered', detail: 'Buyer has gotten the package', at: times[4] },
  ]
}

const firstName = (name: string) => name.split(' ')[0]

interface Banner {
  title: string
  body: string
  height?: number
  actions?: { label: string; icon: string; onClick: () => void; secondary?: { label: string; onClick: () => void } }
  art?: [string, string]
}

/** Figma "Fulfillment detail": 36px icon disc #f2f8f6, label 11/13.86, value 12/20 Medium. */
function Detail({
  icon,
  label,
  value,
  swap,
  text,
}: {
  icon?: string
  text?: string
  label: string
  value: string
  swap?: boolean
}) {
  return (
    <div className="flex items-center gap-[12px] w-full">
      <div className="flex items-center justify-center size-[36px] rounded-full bg-[#f2f8f6] shrink-0">
        {text ? (
          <span className="text-[#007c53] text-[12px] leading-[20px]" style={jakarta(700)}>
            {text}
          </span>
        ) : (
          <img src={icon} alt="" className="size-[16px]" />
        )}
      </div>
      <div className="flex flex-col gap-[2px] min-w-0">
        {swap ? (
          <>
            <p className="text-[#101604] text-[12px] leading-[20px] truncate" style={jakarta(500)}>
              {value}
            </p>
            <p className="text-[#807e7e] text-[11px] leading-[14px] truncate" style={jakarta(400)}>
              {label}
            </p>
          </>
        ) : (
          <>
            <p className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(400)}>
              {label}
            </p>
            <p className="text-[#101604] text-[12px] leading-[20px] truncate" style={jakarta(500)}>
              {value}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function Card({ title, action, children, className = '' }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-[20px] p-[20px] flex flex-col gap-[16px] ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
          {title}
        </h2>
        {action}
      </div>
      <div className="h-px w-full bg-[#f7f7f7]" />
      {children}
    </section>
  )
}

function MessageButton({ name, className = '' }: { name: string; className?: string }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate('/dashboard/messages')}
      className={`flex h-[48px] items-center justify-center gap-[8px] rounded-[30px] px-[24px] ${className}`}
      style={{ backgroundImage: CTA_BG }}
    >
      <img src={smsIcon} alt="" className="size-[20px]" />
      <span
        className="text-[14px] leading-[18px] bg-clip-text text-transparent whitespace-nowrap"
        style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}
      >
        Message {name}
      </span>
    </button>
  )
}

/**
 * Figma "order details - new/processing/ready for pickup/dispatched/completed/cancelled/declined"
 * (561:5317 and siblings): header with the status badge and two buttons, a 1093×126 banner whose
 * copy, buttons and illustration follow the status, the seven-step timeline (not shown once an
 * order is cancelled or declined), then items + payment on the left and buyer + delivery on the
 * right. Status changes are local until the orders API exists.
 */
export default function OrderDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const base = findOrder(id)
  // Local until the orders API exists: a change made here is kept per order id.
  const [override, setOverride] = useState<{ id: string; status: OrderStatus } | null>(null)
  const status: OrderStatus = override?.id === id ? override.status : (base?.status ?? 'new')
  const setStatus = (next: OrderStatus) => setOverride({ id: id ?? '', status: next })
  const [dialog, setDialog] = useState<'evidence' | 'ready' | 'dispatched' | 'decline' | null>(null)
  const [tracking, setTracking] = useState(false)
  const { store } = useStore()

  if (!base) {
    return (
      <DashboardLayout>
        <div className="px-[24px] pt-[40px]">
          <p className="text-[#b13b3b] text-[14px]" style={jakarta(400)}>
            We could not find that order.
          </p>
        </div>
      </DashboardLayout>
    )
  }
  const o: Order = { ...base, status }
  const buyer = firstName(o.buyer.name)
  const times = stepTimes(o)
  const reached = REACHED[status]
  const closed = status === 'cancelled' || status === 'declined'
  const placed = new Date(o.placedAt)

  const banners: Record<OrderStatus, Banner> = {
    new: {
      title: 'Accept this order',
      body: `Payment received from ${buyer}. Review the details and accept the order to proceed.`,
      actions: {
        label: 'Accept order',
        icon: checksIcon,
        onClick: () => setStatus('processing'),
        secondary: { label: 'Decline', onClick: () => setDialog('decline') },
      },
    },
    processing: {
      title: 'Pack the order and get it ready for pickup',
      body: "When you're done, we initiate the delivery straight away. Label the package with the order ID and take a photo of the package.",
      actions: { label: 'Mark as ready', icon: truckIcon, onClick: () => setDialog('evidence') },
    },
    ready: {
      title: 'Dispatch on the way for pickup',
      body: `${o.delivery.method === 'Pickup' ? 'The buyer' : `${o.delivery.method} with ${o.delivery.courier.split(',')[0]}, via Shipbubble`} is coming to collect it. Keep the order ready and show the driver ${o.id.slice(0, 7)}.`,
      actions: {
        label: 'Mark as dispatched',
        icon: truckTickIcon,
        onClick: () => {
          setStatus('dispatched')
          setDialog('dispatched')
        },
      },
    },
    dispatched: {
      title: `On its way to ${buyer}`,
      body: 'The package is now on its way to the buyer, you will be notified once the delivery is complete and the buyer receives their items.',
      art: [truckTimeLg, truckTimeSm],
    },
    completed: {
      title: 'Order delivered successfully',
      body: `${buyer} has received the package. The payment has been settled into your payout account.`,
      art: [bagHappyLg, bagHappySm],
    },
    cancelled: {
      title: 'Order canceled',
      body: 'This order was canceled by the buyer and refund is being processed. You can view the details below.',
      art: [bagCrossLg, bagCrossSm],
    },
    declined: {
      title: 'Order declined',
      body: `You declined this order and ${buyer} was refunded automatically.`,
      height: 106,
      art: [bagCrossLg, bagCrossSm],
    },
  }
  const banner = banners[status]

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[40px] flex flex-col gap-[24px] max-md:px-[16px] max-md:pt-[24px]">
        {/* Header (561:6370 / 561:6375) */}
        <div className="flex items-start justify-between max-lg:flex-col max-lg:gap-[16px]">
          <div className="flex flex-col gap-[24px] max-w-[490px]">
            <button
              type="button"
              onClick={() => navigate('/dashboard/orders')}
              className="flex items-center gap-[8px] w-fit"
            >
              <img src={arrowDownIcon} alt="" className="size-[16px]" style={{ transform: 'rotate(90deg)' }} />
              <span className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500)}>
                Back
              </span>
            </button>
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[8px] max-md:flex-wrap">
                <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
                  Order {o.id}
                </h1>
                <OrderStatusBadge status={status} />
              </div>
              <p className="text-[#807e7e] text-[13px] leading-[16px]" style={jakarta(400)}>
                Placed {placed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                {placed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · 1 item
              </p>
            </div>
          </div>
          <div className="flex items-center gap-[16px] pt-[56px] max-lg:pt-0 max-md:w-full max-md:gap-[12px]">
            {!closed && (
              <button
                type="button"
                onClick={() => window.print()}
                className="flex h-[48px] w-[168px] items-center justify-center gap-[8px] rounded-[30px] bg-white max-md:w-auto max-md:flex-1"
              >
                <img src={receiptIcon} alt="" className="size-[20px]" />
                <span className="text-[#101604] text-[14px] leading-[18px]" style={jakarta(500)}>
                  Packing slip
                </span>
              </button>
            )}
            <MessageButton name={buyer} className="w-[168px] max-md:w-auto max-md:flex-1" />
          </div>
        </div>

        {/* Banner (561:6611): gradient #aee74a → #007c53, radius 20, copy at 24/24, art or buttons at the right */}
        <div
          className="relative mt-[16px] overflow-hidden rounded-[20px] px-[24px] py-[24px] flex items-center justify-between lg:h-(--banner-h) max-lg:min-h-(--banner-h) max-md:flex-col max-md:items-stretch max-md:gap-[16px] max-md:px-[16px]"
          style={{
            // BUILDER: the frame fixes the banner height; below lg it is a minimum so the copy and buttons can stack.
            ['--banner-h' as string]: `${banner.height ?? 126}px`,
            backgroundImage: 'linear-gradient(100deg, #aee74a -20%, #007c53 72%)',
          }}
        >
          <div className="flex flex-col gap-[8px] max-w-[515px]">
            <p className="text-white text-[24px] leading-[30px]" style={jakarta(700)}>
              {banner.title}
            </p>
            <p className="text-[14px] leading-[20px]" style={{ ...jakarta(400), color: 'rgba(255,255,255,0.75)' }}>
              {banner.body}
            </p>
          </div>
          {banner.actions && (
            <div className="flex items-center gap-[16px] shrink-0 max-md:gap-[12px]">
              <button
                type="button"
                onClick={banner.actions.onClick}
                className="flex h-[48px] items-center justify-center gap-[8px] rounded-[30px] bg-[#aee74a] px-[24px] whitespace-nowrap max-md:flex-1 max-md:px-[16px]"
                style={{ minWidth: 168 }}
              >
                <img src={banner.actions.icon} alt="" className="size-[20px]" />
                <span className="text-[#0c2310] text-[14px] leading-[18px]" style={jakarta(500)}>
                  {banner.actions.label}
                </span>
              </button>
              {banner.actions.secondary && (
                <button
                  type="button"
                  onClick={banner.actions.secondary.onClick}
                  className="flex h-[48px] items-center justify-center rounded-[30px] px-[32px] border max-md:flex-1 max-md:px-[16px]"
                  style={{ background: 'rgba(64,68,56,0.5)', borderColor: 'rgba(248,246,241,0.4)' }}
                >
                  <span className="text-white text-[14px] leading-[18px]" style={jakarta(500)}>
                    {banner.actions.secondary.label}
                  </span>
                </button>
              )}
            </div>
          )}
          {banner.art && (
            <>
              {/* Two layered glyphs, as placed in the frame (the large one at 7% sits behind). */}
              <img
                src={banner.art[0]}
                alt=""
                className="absolute pointer-events-none max-md:hidden"
                style={{ right: -20, top: -27, width: 181, height: 181 }}
              />
              <img
                src={banner.art[1]}
                alt=""
                className="absolute pointer-events-none max-md:hidden"
                style={{ right: 61, top: -5, width: 136, height: 136 }}
              />
            </>
          )}
        </div>

        {/* Timeline (567:6652): 155 tall, seven 87px columns, 2px rule behind the 32px badges */}
        {!closed && (
          <div className="relative bg-white rounded-[20px] h-[155px] px-[24px] pt-[24px] max-md:h-auto max-md:px-[16px] max-md:py-[16px]">
            {/* The rule behind the badges: 49px in from the list's edges, through the 32px badges' centres; below md the list is a column and the rule goes. */}
            <ol className="relative flex items-start justify-between before:absolute before:left-[49px] before:right-[50px] before:top-[16px] before:h-[2px] before:rounded-full before:bg-[rgba(0,124,83,0.1)] before:content-[''] max-md:flex-col max-md:gap-[16px] max-md:before:hidden">
              {STEPS.map((label, i) => {
                const done = i < reached
                const next = i === reached
                return (
                  <li key={label} className="relative flex w-[87px] flex-col items-center gap-[16px] max-md:w-full max-md:flex-row max-md:gap-[12px]">
                    <img
                      src={done ? stepDoneIcon : stepTodoIcon}
                      alt={done ? 'Done' : next ? 'Next' : 'Not yet'}
                      className="size-[32px] shrink-0"
                    />
                    <div className="flex flex-col items-center gap-[4px] text-center max-md:flex-1 max-md:flex-row max-md:items-center max-md:justify-between max-md:text-left">
                      <p className="text-[#101604] text-[13px] leading-[20px]" style={jakarta(600)}>
                        {label}
                      </p>
                      <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                        {done ? times[i] : next ? 'Next' : 'Not yet'}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        {/* Two columns: 677 + 16 + 400 */}
        <div className="flex items-start gap-[16px] max-lg:flex-col max-lg:items-stretch">
          <div className="flex flex-col gap-[24px] flex-1 min-w-0">
            <Card title="Items in this order">
              <div className="flex flex-col gap-[24px]">
                <div className="flex items-center gap-[14px]">
                  <img src={o.item.image} alt="" className="size-[76px] rounded-[12px] object-cover shrink-0" />
                  <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                    <p className="text-[#101604] text-[16px] leading-[24px] capitalize truncate max-md:whitespace-normal max-md:line-clamp-2" style={jakarta(600)}>
                      {o.item.title}
                    </p>
                    <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                      SKU {o.item.sku} · {o.item.soldBy}
                    </p>
                    <div
                      className="flex items-center gap-[8px] text-[#807e7e] text-[12px] leading-[20px]"
                      style={jakarta(400)}
                    >
                      <span>{o.item.qty}</span>
                      <span className="size-[3px] rounded-full bg-[#a2a2a2]" />
                      <span>{o.item.unit}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-[4px] shrink-0">
                    <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(700)}>
                      {naira(o.item.price)}
                    </p>
                    <span
                      className="rounded-[30px] px-[10px] py-[6px] text-[10px] leading-[13px]"
                      style={{ ...jakarta(600), background: '#f2f8f6', color: '#177b4d' }}
                    >
                      On Sale
                    </span>
                  </div>
                </div>
                {o.note && (
                  <div
                    className="flex flex-col gap-[12px] rounded-[12px] px-[16px] py-[12px]"
                    style={{ background: 'rgba(0,124,83,0.05)' }}
                  >
                    <div className="flex items-center gap-[8px]">
                      <img src={noteIcon} alt="" className="size-[24px]" />
                      <p className="text-[#007c53] text-[14px] leading-[24px]" style={jakarta(600)}>
                        Buyer’s note
                      </p>
                    </div>
                    <p className="text-[#007c53] text-[12px] leading-[24px] italic" style={jakarta(400)}>
                      “{o.note}”
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Payment summary" className="min-h-[261px]">
              <div className="flex flex-col gap-[16px]">
                {[
                  ['Items subtotal', naira(o.payment.subtotal)],
                  ['Delivery fee', naira(o.payment.fee)],
                  ['Discount', naira(o.payment.discount)],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[#807e7e] text-[13px] leading-[16px]" style={jakarta(400)}>
                      {k}
                    </span>
                    <span className="text-[#101604] text-[13px] leading-[16px]" style={jakarta(500)}>
                      {v}
                    </span>
                  </div>
                ))}
                <div className="h-px w-full bg-[#f7f7f7]" />
                <div className="flex items-center justify-between">
                  <span className="text-[#807e7e] text-[13px] leading-[16px]" style={jakarta(400)}>
                    Total paid
                  </span>
                  <span className="text-[#101604] text-[16px] leading-[20px]" style={jakarta(700)}>
                    {naira(orderTotal(o))}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-[24px] w-[400px] shrink-0 max-lg:w-full">
            <Card title="Buyer">
              <Detail text={initials(o.buyer.name)} label={o.buyer.since} value={o.buyer.name} swap />
              <Detail icon={locationIcon} label="Address" value={o.buyer.address} />
              <MessageButton name={buyer} className="w-full" />
            </Card>

            <Card
              title="Delivery"
              action={
                /* Figma 687:7623: the "Track delivery" link once the package is on its way */
                (status === 'dispatched' || status === 'completed') && o.delivery.method !== 'Pickup' ? (
                  <button type="button" onClick={() => setTracking(true)} className="flex items-center gap-[8px] text-[#007c53] text-[12px] leading-[24px]" style={jakarta(500)}>
                    <img src={routingIcon} alt="" className="size-[16px]" />
                    Track delivery
                  </button>
                ) : null
              }
            >
              <Detail
                icon={truckFastIcon}
                label={o.delivery.courier}
                value={o.delivery.method === 'Motorbike' ? 'Motorcycle' : o.delivery.method}
                swap
              />
              <Detail icon={locationIcon} label="Delivery Address" value={o.delivery.address} />
              <Detail icon={calendarIcon} label="Expected delivery" value={o.delivery.expected} />
              <Detail
                icon={cardPosIcon}
                label="Amount paid"
                value={naira(o.delivery.amountPaid).replace(/\.00$/, '')}
              />
            </Card>
          </div>
        </div>
      </div>

      {tracking && (
        <TrackDeliveryModal
          orderId={o.id}
          rider={RIDER}
          pickup={store?.businessAddress.area ?? 'Store'}
          dropoff={o.delivery.address.split(',').pop()?.trim() ?? o.delivery.address}
          progress={status === 'completed' ? 1 : 0.37}
          steps={trackingSteps(status, store?.storeName ?? 'the store')}
          onClose={() => setTracking(false)}
        />
      )}
      {dialog === 'evidence' && (
        <OrderStatusDialog
          kind="evidence"
          onClose={() => setDialog(null)}
          onConfirm={() => {
            setStatus('ready')
            setDialog('ready')
          }}
        />
      )}
      {dialog === 'ready' && (
        <OrderStatusDialog kind="ready" onClose={() => setDialog(null)} onConfirm={() => setDialog(null)} />
      )}
      {dialog === 'dispatched' && (
        <OrderStatusDialog kind="dispatched" onClose={() => setDialog(null)} onConfirm={() => setDialog(null)} />
      )}
      {dialog === 'decline' && (
        <OrderStatusDialog
          kind="decline"
          onClose={() => setDialog(null)}
          onConfirm={() => {
            setStatus('declined')
            setDialog(null)
          }}
        />
      )}
    </DashboardLayout>
  )
}
