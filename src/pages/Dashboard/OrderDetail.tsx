import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import OrderStatusBadge from '../../components/ui/OrderStatusBadge'
import OrderStatusDialog from '../../components/ui/OrderStatusDialog'
import routingIcon from '../../assets/icons/rc-routing.svg'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import receiptIcon from '../../assets/icons/od-receipt.svg'
import smsIcon from '../../assets/icons/od-sms.svg'
import checksIcon from '../../assets/icons/od-checks.svg'
import truckIcon from '../../assets/icons/od-truck.svg'
import truckTickIcon from '../../assets/icons/od-truck-tick.svg'
import noteIcon from '../../assets/icons/od-note.svg'
import locationIcon from '../../assets/icons/od-location.svg'
import truckFastIcon from '../../assets/icons/od-truck-fast.svg'
import cardPosIcon from '../../assets/icons/od-card-pos.svg'
import stepDoneIcon from '../../assets/icons/od-step-done.svg'
import stepTodoIcon from '../../assets/icons/od-step-todo.svg'
import truckTimeLg from '../../assets/icons/od-truck-time-lg.svg'
import truckTimeSm from '../../assets/icons/od-truck-time-sm.svg'
import bagHappyLg from '../../assets/icons/od-bag-happy-lg.svg'
import bagHappySm from '../../assets/icons/od-bag-happy-sm.svg'
import bagCrossLg from '../../assets/icons/od-bag-cross-lg.svg'
import bagCrossSm from '../../assets/icons/od-bag-cross-sm.svg'
import {
  useAcceptOrderMutation,
  useCompleteOrderMutation,
  useDeclineOrderMutation,
  useDispatchOrderMutation,
  useGetOrderQuery,
  useGetTimelineQuery,
  useReadyOrderMutation,
  type OrderSummary,
} from '../../feature/orders/ordersApiSlice'
import { orderFromOverview } from '../../data/overview'
import { isPaid, paymentExpired, stepTime, trackingView } from '../../data/orderFlow'
import { findOrder, initials, naira, orderTotal, type Order, type OrderStatus } from '../../data/orders'
import { describeError, toApiError } from '../../services/earthApi'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

/** The seven steps on the timeline card, with the timeline words that mark each as reached; a status sits at an index on it. */
const STEPS: { label: string; words: string[] }[] = [
  { label: 'Order placed', words: ['placed', 'created'] },
  { label: 'Payment confirmed', words: ['paid', 'payment'] },
  { label: 'Order accepted', words: ['accept'] },
  { label: 'Packed and ready', words: ['ready'] },
  { label: 'On the way', words: ['dispatch', 'collected', 'transit'] },
  { label: 'Delivered', words: ['deliver'] },
  { label: 'Completed', words: ['complet'] },
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

const when = (iso: string | null) =>
  iso ? `${new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'Done'

const firstName = (name: string) => name.split(' ')[0]

interface Banner {
  title: string
  body: string
  height?: number
  actions?: { label: string; icon: string; onClick: () => void; busy?: boolean; secondary?: { label: string; onClick: () => void } }
  art?: [string, string]
}

/** Figma "Fulfillment detail": 36px icon disc #f2f8f6, label 11/13.86, value 12/20 Medium. */
function Detail({ icon, label, value, swap, text, href }: { icon?: string; text?: string; label: string; value: string; swap?: boolean; href?: string }) {
  const valueNode = href ? (
    <a href={href} target="_blank" rel="noreferrer" className="text-[#007c53] text-[12px] leading-[20px] truncate underline" style={jakarta(500)}>
      {value}
    </a>
  ) : (
    <p className="text-[#101604] text-[12px] leading-[20px] truncate" style={jakarta(500)}>
      {value}
    </p>
  )
  const labelNode = (
    <p className="text-[#807e7e] text-[11px] leading-[14px] truncate" style={jakarta(400)}>
      {label}
    </p>
  )
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
            {valueNode}
            {labelNode}
          </>
        ) : (
          <>
            {labelNode}
            {valueNode}
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
      <span className="text-[14px] leading-[18px] bg-clip-text text-transparent whitespace-nowrap truncate" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
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
 * right. The order is `GET /orders/{id}`; each step is its own write with the order's version:
 * accept or decline a paid order, ready (which books the carrier), dispatch once the carrier has
 * collected, complete once it has delivered. The sample rows stay behind the dev switch.
 */
export default function OrderDetail() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const sample = findOrder(id)
  const query = useGetOrderQuery(id, { skip: !id || Boolean(sample) })
  const summary: OrderSummary | undefined = query.data
  const closedApi = summary ? ['CANCELLED', 'DECLINED'].includes(summary.status) : false
  const timeline = useGetTimelineQuery(id, { skip: !summary || closedApi })
  const [accept, acceptState] = useAcceptOrderMutation()
  const [decline, declineState] = useDeclineOrderMutation()
  const [ready, readyState] = useReadyOrderMutation()
  const [dispatch, dispatchState] = useDispatchOrderMutation()
  const [complete, completeState] = useCompleteOrderMutation()
  const busy = acceptState.isLoading || declineState.isLoading || readyState.isLoading || dispatchState.isLoading || completeState.isLoading
  const [dialog, setDialog] = useState<'evidence' | 'ready' | 'dispatched' | 'decline' | null>(null)
  const [error, setError] = useState('')

  const base: Order | undefined = sample ?? (summary ? orderFromOverview(summary) : undefined)

  if (!base) {
    const missing = query.error && [400, 404].includes(toApiError(query.error).status)
    return (
      <DashboardLayout>
        <div className="px-[24px] pt-[40px]" aria-busy={query.isLoading}>
          {!query.isLoading && (
            <p className="text-[#b13b3b] text-[14px]" style={jakarta(400)}>
              {missing || !query.error ? 'We could not find that order.' : describeError(query.error)}
            </p>
          )}
        </div>
      </DashboardLayout>
    )
  }
  const o = base
  const status = o.status
  const buyer = firstName(o.buyer.name)
  const paid = summary ? isPaid(summary) : true
  const expired = summary ? paymentExpired(summary) : false
  const reached = paid ? REACHED[status] : 1
  const closed = status === 'cancelled' || status === 'declined'
  const placed = new Date(o.placedAt)
  const tracking = trackingView(summary?.fulfillmentDelivery)
  const events = timeline.data ?? []

  async function run(action: (a: { id: string; expectedVersion: number }) => { unwrap: () => Promise<unknown> }, after?: () => void) {
    if (!summary) return
    setError('')
    try {
      await action({ id, expectedVersion: summary.version }).unwrap()
      after?.()
    } catch (e) {
      const problem = toApiError(e)
      setError(
        problem.status === 409
          ? `${problem.detail || 'This order changed just now.'} Reload the page to see its latest state.`
          : problem.status === 422
            ? problem.detail || problem.title || 'The API refused this step.'
            : describeError(e),
      )
    }
  }

  const banners: Record<OrderStatus, Banner> = {
    new: paid
      ? {
          title: 'Accept this order',
          body: `Payment from ${buyer} is verified. Accept it to start packing, or decline and the buyer is refunded.`,
          actions: {
            label: 'Accept order',
            icon: checksIcon,
            busy,
            onClick: () => void run(accept),
            secondary: { label: 'Decline', onClick: () => setDialog('decline') },
          },
        }
      : expired
        ? { title: 'This order was never paid', body: 'The buyer’s fifteen-minute payment window closed. Nothing to do; the stock is released.', art: [bagCrossLg, bagCrossSm] }
        : { title: 'Waiting for the buyer to pay', body: 'The buyer has fifteen minutes to pay. There is nothing to do until the payment is verified; do not hand out goods for an unpaid order.' },
    processing: {
      title: 'Pack the order and mark it ready',
      body: 'Marking it ready books the carrier to collect from your pickup address. Label the package with the order ID and take a photo of it.',
      actions: { label: 'Mark as ready', icon: truckIcon, busy, onClick: () => setDialog('evidence') },
    },
    ready: {
      title: tracking ? 'The carrier is booked' : 'Booking the carrier',
      body: tracking
        ? `${tracking.courier || 'The carrier'} collects from your pickup address${tracking.number ? ` (tracking ${tracking.number})` : ''}. Mark the order dispatched once the carrier has collected the package.`
        : 'The delivery is being booked with the carrier now that the order is paid and ready; the tracking appears here. Mark it dispatched only once the carrier has collected the package.',
      actions: { label: 'Mark as dispatched', icon: truckTickIcon, busy, onClick: () => void run(dispatch, () => setDialog('dispatched')) },
    },
    dispatched: {
      title: `On its way to ${buyer}`,
      body: 'The carrier has the package. Once it has delivered, mark the order completed; the delivery record is checked.',
      actions: { label: 'Mark as completed', icon: checksIcon, busy, onClick: () => void run(complete) },
      art: [truckTimeLg, truckTimeSm],
    },
    completed: {
      title: 'Order delivered successfully',
      body: `${buyer} has received the package. Your share was split to your bank at payment; it lands on Paystack’s settlement schedule.`,
      art: [bagHappyLg, bagHappySm],
    },
    cancelled: {
      title: summary?.cancellationRequested && !closedApi ? 'Cancellation requested' : 'Order cancelled',
      body: summary?.refundRequired ? 'This order was cancelled by the buyer and the refund is being processed. You can view the details below.' : 'This order was cancelled. You can view the details below.',
      art: [bagCrossLg, bagCrossSm],
    },
    declined: {
      title: 'Order declined',
      body: `You declined this order and ${buyer} is refunded.`,
      height: 106,
      art: [bagCrossLg, bagCrossSm],
    },
  }
  const banner = banners[status]
  const deliveryRows = [
    o.delivery.courier || tracking?.courier ? { icon: truckFastIcon, label: tracking?.courier || o.delivery.courier, value: o.delivery.method === 'Motorbike' ? 'Motorcycle' : o.delivery.method, swap: true } : { icon: truckFastIcon, label: 'Method', value: o.delivery.method },
    o.delivery.address ? { icon: locationIcon, label: 'Delivery Address', value: o.delivery.address } : null,
    tracking?.number ? { icon: routingIcon, label: 'Tracking number', value: tracking.number, href: tracking.url || undefined } : null,
    { icon: cardPosIcon, label: paid ? 'Amount paid' : 'Amount due', value: naira(summary ? Number(summary.total) / 100 : o.delivery.amountPaid).replace(/\.00$/, '') },
  ]

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[40px] flex flex-col gap-[24px] max-md:px-[16px] max-md:pt-[24px]">
        {/* Header (561:6370 / 561:6375) */}
        <div className="flex items-start justify-between max-lg:flex-col max-lg:gap-[16px]">
          <div className="flex flex-col gap-[24px] max-w-[490px]">
            <button type="button" onClick={() => navigate('/dashboard/orders')} className="flex items-center gap-[8px] w-fit">
              <img src={arrowDownIcon} alt="" className="size-[16px]" style={{ transform: 'rotate(90deg)' }} />
              <span className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500)}>
                Back
              </span>
            </button>
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[8px] max-md:flex-wrap">
                <h1 className="text-[#101604] text-[24px] leading-[32px] truncate" style={jakarta(600)}>
                  Order {o.id}
                </h1>
                <OrderStatusBadge status={status} />
              </div>
              <p className="text-[#807e7e] text-[13px] leading-[16px]" style={jakarta(400)}>
                Placed {placed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                {placed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · {summary?.itemCount ?? 1} {(summary?.itemCount ?? 1) === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-[16px] pt-[56px] max-lg:pt-0 max-md:w-full max-md:gap-[12px]">
            {!closed && (
              <button type="button" onClick={() => window.print()} className="flex h-[48px] w-[168px] items-center justify-center gap-[8px] rounded-[30px] bg-white max-md:w-auto max-md:flex-1">
                <img src={receiptIcon} alt="" className="size-[20px]" />
                <span className="text-[#101604] text-[14px] leading-[18px]" style={jakarta(500)}>
                  Packing slip
                </span>
              </button>
            )}
            {/* The frame's 168px button; a long first name widens it rather than clipping, up to the header's room */}
          <MessageButton name={buyer} className="min-w-[168px] max-w-[260px] max-md:w-auto max-md:flex-1" />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
            {error}
          </p>
        )}

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
                disabled={banner.actions.busy}
                className="flex h-[48px] items-center justify-center gap-[8px] rounded-[30px] bg-[#aee74a] px-[24px] whitespace-nowrap disabled:opacity-70 max-md:flex-1 max-md:px-[16px]"
                style={{ minWidth: 168 }}
              >
                <img src={banner.actions.icon} alt="" className="size-[20px]" />
                <span className="text-[#0c2310] text-[14px] leading-[18px]" style={jakarta(500)}>
                  {banner.actions.busy ? 'Saving…' : banner.actions.label}
                </span>
              </button>
              {banner.actions.secondary && (
                <button
                  type="button"
                  onClick={banner.actions.secondary.onClick}
                  disabled={banner.actions.busy}
                  className="flex h-[48px] items-center justify-center rounded-[30px] px-[32px] border disabled:opacity-70 max-md:flex-1 max-md:px-[16px]"
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
              <img src={banner.art[0]} alt="" className="absolute pointer-events-none max-md:hidden" style={{ right: -20, top: -27, width: 181, height: 181 }} />
              <img src={banner.art[1]} alt="" className="absolute pointer-events-none max-md:hidden" style={{ right: 61, top: -5, width: 136, height: 136 }} />
            </>
          )}
        </div>

        {/* Timeline (567:6652): 155 tall, seven 87px columns, 2px rule behind the 32px badges */}
        {!closed && !expired && (
          <div className="relative bg-white rounded-[20px] h-[155px] px-[24px] pt-[24px] max-md:h-auto max-md:px-[16px] max-md:py-[16px]">
            {/* The rule behind the badges: 49px in from the list's edges, through the 32px badges' centres; below md the list is a column and the rule goes. */}
            <ol className="relative flex items-start justify-between before:absolute before:left-[49px] before:right-[50px] before:top-[16px] before:h-[2px] before:rounded-full before:bg-[rgba(0,124,83,0.1)] before:content-[''] max-md:flex-col max-md:gap-[16px] max-md:before:hidden">
              {STEPS.map(({ label, words }, i) => {
                const done = i < reached
                const next = i === reached
                const at = i === 0 ? o.placedAt : i === 1 ? (summary?.paidAt ?? null) : stepTime(events, ...words)
                return (
                  <li key={label} className="relative flex w-[87px] flex-col items-center gap-[16px] max-md:w-full max-md:flex-row max-md:gap-[12px]">
                    <img src={done ? stepDoneIcon : stepTodoIcon} alt={done ? 'Done' : next ? 'Next' : 'Not yet'} className="size-[32px] shrink-0" />
                    <div className="flex flex-col items-center gap-[4px] text-center max-md:flex-1 max-md:flex-row max-md:items-center max-md:justify-between max-md:text-left">
                      <p className="text-[#101604] text-[13px] leading-[20px]" style={jakarta(600)}>
                        {label}
                      </p>
                      <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                        {done ? when(at) : next ? 'Next' : 'Not yet'}
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
                  {o.item.image ? (
                    <img src={o.item.image} alt="" className="size-[76px] rounded-[12px] object-cover shrink-0" />
                  ) : (
                    <div className="size-[76px] rounded-[12px] bg-[#f7f7f7] shrink-0" />
                  )}
                  <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                    <p className="text-[#101604] text-[16px] leading-[24px] capitalize truncate max-md:whitespace-normal max-md:line-clamp-2" style={jakarta(600)}>
                      {o.item.title}
                    </p>
                    <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                      {o.item.sku ? `SKU ${o.item.sku} · ` : ''}
                      {o.item.soldBy}
                    </p>
                    <div className="flex items-center gap-[8px] text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                      <span>{o.item.qty}</span>
                      <span className="size-[3px] rounded-full bg-[#a2a2a2]" />
                      <span>{o.item.unit || `${o.item.weightKg} kg`}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-[4px] shrink-0">
                    <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(700)}>
                      {naira(o.item.price)}
                    </p>
                    {o.item.onSale && (
                      <span className="rounded-[30px] px-[10px] py-[6px] text-[10px] leading-[13px]" style={{ ...jakarta(600), background: '#f2f8f6', color: '#177b4d' }}>
                        On Sale
                      </span>
                    )}
                  </div>
                </div>
                {(o.note || summary?.note) && (
                  <div className="flex flex-col gap-[12px] rounded-[12px] px-[16px] py-[12px]" style={{ background: 'rgba(0,124,83,0.05)' }}>
                    <div className="flex items-center gap-[8px]">
                      <img src={noteIcon} alt="" className="size-[24px]" />
                      <p className="text-[#007c53] text-[14px] leading-[24px]" style={jakarta(600)}>
                        Buyer’s note
                      </p>
                    </div>
                    <p className="text-[#007c53] text-[12px] leading-[24px] italic" style={jakarta(400)}>
                      “{o.note || summary?.note}”
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Payment summary" className="min-h-[261px]">
              <div className="flex flex-col gap-[16px]">
                {[
                  ['Items subtotal', naira(summary ? (Number(summary.item.priceMinor) / 100) * summary.item.quantity : o.payment.subtotal)],
                  ['Delivery fee', naira(summary ? Math.max(0, Number(summary.total) / 100 - (Number(summary.item.priceMinor) / 100) * summary.item.quantity) : o.payment.fee)],
                  ...(summary ? [] : [['Discount', naira(o.payment.discount)]]),
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
                    {paid ? 'Total paid' : 'Total due'}
                  </span>
                  <span className="text-[#101604] text-[16px] leading-[20px]" style={jakarta(700)}>
                    {naira(summary ? Number(summary.total) / 100 : orderTotal(o))}
                  </span>
                </div>
                {summary && (
                  <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                    Payment {summary.paymentStatus.toLowerCase().replace(/_/g, ' ')}
                    {summary.paidAt ? ` on ${new Date(summary.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}. The buyer’s payment is split at source: your share goes to your bank, the commission and delivery to Earth.
                  </p>
                )}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-[24px] w-[400px] shrink-0 max-lg:w-full">
            <Card title="Buyer">
              <Detail text={initials(o.buyer.name)} label={o.buyer.since || 'Buyer'} value={o.buyer.name} swap />
              {o.buyer.address && <Detail icon={locationIcon} label="Address" value={o.buyer.address} />}
              <MessageButton name={buyer} className="w-full" />
            </Card>

            <Card
              title="Delivery"
              action={
                tracking?.url ? (
                  <a href={tracking.url} target="_blank" rel="noreferrer" className="flex items-center gap-[8px] text-[#007c53] text-[12px] leading-[24px]" style={jakarta(500)}>
                    <img src={routingIcon} alt="" className="size-[16px]" />
                    Track delivery
                  </a>
                ) : null
              }
            >
              {deliveryRows.map((row) => row && <Detail key={row.label} {...row} />)}
            </Card>
          </div>
        </div>
      </div>

      {dialog === 'evidence' && (
        <OrderStatusDialog
          kind="evidence"
          busy={busy}
          onClose={() => setDialog(null)}
          onConfirm={() =>
            void run(ready, () => setDialog('ready'))
          }
        />
      )}
      {dialog === 'ready' && <OrderStatusDialog kind="ready" onClose={() => setDialog(null)} onConfirm={() => setDialog(null)} />}
      {dialog === 'dispatched' && <OrderStatusDialog kind="dispatched" onClose={() => setDialog(null)} onConfirm={() => setDialog(null)} />}
      {dialog === 'decline' && (
        <OrderStatusDialog
          kind="decline"
          busy={busy}
          onClose={() => setDialog(null)}
          onConfirm={() => void run(decline, () => setDialog(null))}
        />
      )}
    </DashboardLayout>
  )
}
