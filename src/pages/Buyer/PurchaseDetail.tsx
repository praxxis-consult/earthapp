import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import OrderStatusBadge from '../../components/ui/OrderStatusBadge'
import Thumb from '../../components/ui/Thumb'
import OrderStatusDialog from '../../components/ui/OrderStatusDialog'
import ReceiptModal, { type ReceiptData } from '../../components/ui/ReceiptModal'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import smsIcon from '../../assets/icons/od-sms.svg'
import receiptIcon from '../../assets/icons/od-receipt.svg'
import cardPosIcon from '../../assets/icons/od-card-pos.svg'
import truckFastIcon from '../../assets/icons/od-truck-fast.svg'
import routingIcon from '../../assets/icons/rc-routing.svg'
import stepDoneIcon from '../../assets/icons/od-step-done.svg'
import stepTodoIcon from '../../assets/icons/od-step-todo.svg'
import truckTimeLg from '../../assets/icons/od-truck-time-lg.svg'
import truckTimeSm from '../../assets/icons/od-truck-time-sm.svg'
import bagHappyLg from '../../assets/icons/od-bag-happy-lg.svg'
import bagHappySm from '../../assets/icons/od-bag-happy-sm.svg'
import bagCrossLg from '../../assets/icons/od-bag-cross-lg.svg'
import bagCrossSm from '../../assets/icons/od-bag-cross-sm.svg'
import { useCancelOrderMutation, useConfirmPickupMutation, useGetOrderQuery, useGetReceiptQuery, useGetTimelineQuery, type OrderSummary, type Receipt } from '../../feature/orders/ordersApiSlice'
import { usePayment } from '../../feature/orders/usePayment'
import { usePostReviewMutation } from '../../feature/reviews/reviewsApiSlice'
import { purchaseFromApi } from '../../data/purchases'
import { awaitingPayment, buyerMoney, cancelMeaning, canCancel, isPaid, isSelfPickup, mmss, paymentExpired, paymentSecondsLeft, stepTime, trackingView } from '../../data/orderFlow'
import { initials, naira, type OrderStatus, shortOrderId } from '../../data/orders'
import { describeError, toApiError } from '../../services/earthApi'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

/** The seller page's seven steps, read from the buyer's side, with the timeline words that mark each as reached. */
const STEPS: { label: string; words: string[] }[] = [
  { label: 'Order placed', words: ['placed', 'created'] },
  { label: 'Payment confirmed', words: ['verified', 'paid'] },
  { label: 'Seller accepted', words: ['accept'] },
  { label: 'Packed and ready', words: ['ready'] },
  { label: 'On the way', words: ['dispatch', 'collected', 'transit'] },
  // The timeline records no delivery event; the carrier's delivery is on the booking (`fulfillmentDelivery.status`), read below
  { label: 'Delivered', words: ['deliver'] },
  { label: 'Completed', words: ['complet'] },
]
const REACHED: Record<OrderStatus, number> = { new: 2, processing: 3, ready: 4, dispatched: 5, completed: 7, cancelled: 0, declined: 0 }
/** A self-pickup order has no carrier: READY is followed by the buyer's own confirmation, which completes it. */
const PICKUP_STEPS: { label: string; words: string[] }[] = [STEPS[0], STEPS[1], STEPS[2], { label: 'Ready to collect', words: ['ready'] }, { label: 'Collected', words: ['complet', 'pickup'] }]
const PICKUP_REACHED: Record<OrderStatus, number> = { new: 2, processing: 3, ready: 4, dispatched: 4, completed: 5, cancelled: 0, declined: 0 }

const when = (iso: string | null) =>
  iso ? `${new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'Done'

interface Banner {
  title: string
  body: string
  art?: [string, string]
  action?: { label: string; onClick: () => void; busy?: boolean }
}

/** The order page's detail row (Figma "Fulfillment detail"): 36px icon disc, label 11/14, value 12/20 Medium. */
function Detail({ icon, text, label, value, href }: { icon?: string; text?: string; label: string; value: string; href?: string }) {
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
        <p className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(400)}>
          {label}
        </p>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="text-[#007c53] text-[12px] leading-[20px] truncate underline" style={jakarta(500)}>
            {value}
          </a>
        ) : (
          <p className="text-[#101604] text-[12px] leading-[20px] truncate" style={jakarta(500)}>
            {value}
          </p>
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

/** A second-by-second clock, only while something on the page counts down. */
function useTicking(on: boolean): number {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (!on) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [on])
  return now
}

const clock = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '')
const addressLine = (a: OrderSummary['address']) => (a ? `${a.street}, ${a.area}, ${a.region}` : '')

/** The receipt dialog's rows, from the order and the frozen receipt record (`GET /orders/{id}/receipt`). */
function receiptData(o: OrderSummary, receipt: Receipt | undefined, status: OrderStatus): ReceiptData {
  const money = buyerMoney(o.pricing, o.total)
  const pickup = isSelfPickup(o)
  const etaBy: Record<OrderStatus, string> = {
    new: o.delivery?.estimate ? `${o.delivery.estimate} once accepted` : 'Once the seller accepts',
    processing: 'Being packed',
    ready: pickup ? 'Ready to collect' : 'Awaiting the carrier',
    dispatched: o.delivery?.estimate ?? 'With the carrier',
    completed: pickup ? 'Collected' : 'Delivered',
    cancelled: 'Cancelled',
    declined: 'Declined',
  }
  return {
    invoiceNumber: receipt?.invoiceNumber ?? o.id,
    receiptNumber: receipt?.providerTransactionId ?? o.id,
    paidAt: o.paidAt ? when(o.paidAt) : '',
    amount: receipt ? Number(receipt.amount) / 100 : money.total,
    product: { title: o.item.name, detail: `${o.item.quantity} × ${naira(Number(o.item.priceMinor) / 100)} · ${o.storeName}`, image: o.item.thumbnail ?? '' },
    paidWith: receipt?.provider ? `${receipt.provider[0]}${receipt.provider.slice(1).toLowerCase()}${receipt.environment === 'test' ? ' (test)' : ''}` : 'Paystack',
    reference: receipt?.paymentReference ?? o.id,
    deliveryTitle: pickup ? 'Collected from the seller' : o.delivery?.carrier ? `${o.delivery.carrier} delivery` : status === 'completed' ? 'Delivered' : 'Delivery',
    deliveryEta: etaBy[status],
    nextSteps: pickup
      ? ['The seller accepts and packs the order.', `Once it is marked ready, collect it from ${o.pickup ? addressLine(o.pickup) : 'the seller'}.`, 'Confirm the collection here; then you can review the goods.']
      : ['The seller accepts and packs the order.', 'A carrier is booked once it is ready; you will see the tracking here.', 'Once delivered, you can review the goods.'],
  }
}

/**
 * One of the buyer's orders, on the seller's order-detail layout (561:5317 and siblings): the
 * header with the status badge, the status banner, the seven-step timeline, items and payment on
 * the left, the seller and the delivery on the right. The order comes from `GET /orders/{id}`.
 * An unpaid order can be paid within its fifteen minutes; a paid one can be cancelled until the
 * carrier has collected it, and reviewed once delivered.
 */
export default function PurchaseDetail() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const order = useGetOrderQuery(id, { skip: !id })
  const summary = order.data
  const closed = summary ? ['CANCELLED', 'DECLINED'].includes(summary.status) : true
  const timeline = useGetTimelineQuery(id, { skip: !id || !summary || closed })
  const [receiptOpen, setReceiptOpen] = useState(false)
  const receipt = useGetReceiptQuery(id, { skip: !receiptOpen || !summary || !isPaid(summary) })
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation()
  const [confirmPickup, { isLoading: collecting }] = useConfirmPickupMutation()
  const payment = usePayment()
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState('')
  const [postReview, { isLoading: reviewing }] = usePostReviewMutation()
  const [review, setReview] = useState({ rating: 0, text: '', done: false, error: '' })
  const unpaid = summary ? awaitingPayment(summary) : false
  const now = useTicking(unpaid)

  if (order.isLoading) {
    return (
      <DashboardLayout>
        <div className="px-[24px] pt-[40px]" aria-busy="true" />
      </DashboardLayout>
    )
  }
  if (!summary) {
    const missing = order.error && [400, 404].includes(toApiError(order.error).status)
    return (
      <DashboardLayout>
        <div className="px-[24px] pt-[40px] flex flex-col gap-[16px]">
          <p className="text-[#b13b3b] text-[14px]" style={jakarta(400)}>
            {missing || !order.error ? 'We could not find that order.' : describeError(order.error)}
          </p>
          <button type="button" onClick={() => navigate('/dashboard/purchases')} className="text-[#007c53] text-[14px] text-left" style={jakarta(500)}>
            Back to my orders
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const o = purchaseFromApi(summary)
  const store = o.item.soldBy
  const status = o.status
  const paid = isPaid(summary)
  const pickup = isSelfPickup(summary)
  const steps = pickup ? PICKUP_STEPS : STEPS
  const expired = paymentExpired(summary, now)
  const reached = paid ? (pickup ? PICKUP_REACHED : REACHED)[status] : 1
  const collectFrom = summary.pickup ? addressLine(summary.pickup) : 'the seller'
  const placed = new Date(o.placedAt)
  const money = buyerMoney(summary.pricing, summary.total)
  const subtotal = money.goods || o.item.price * o.item.qty
  const delivery = money.delivery
  const total = money.total
  const tracking = trackingView(summary.fulfillmentDelivery)
  const events = timeline.data ?? summary.timeline?.items ?? []
  const acceptBy = summary.acceptanceDeadline ? clock(summary.acceptanceDeadline) : ''
  const productId = summary.items?.find((i) => typeof i.productId === 'string')?.productId
  const paying = payment.state.phase === 'preparing' || payment.state.phase === 'redirecting'

  const banners: Record<OrderStatus, Banner> = {
    new: { title: `Waiting for ${store} to accept`, body: `Your payment is verified. The seller has until ${acceptBy || 'the acceptance deadline'} to accept, and you will hear as soon as they do. You can still cancel until then.` },
    processing: { title: `${store} is preparing your order`, body: pickup ? `The seller accepted and is packing it. You collect it from ${collectFrom} as soon as it is marked ready.` : 'The seller accepted and is packing it. A carrier is booked as soon as it is marked ready.' },
    ready: pickup
      ? { title: 'Ready for you to collect', body: `Collect it from ${collectFrom}. Once you have it, confirm here and the order completes.`, action: { label: collecting ? 'Confirming…' : 'I have collected it', onClick: () => void collected(), busy: collecting } }
      : { title: 'Packed and waiting for the carrier', body: 'The seller has it ready. The carrier is booked and collects it next; you will see the tracking here.' },
    dispatched: { title: 'On its way to you', body: 'The carrier has collected the package. Keep your phone close for the delivery.', art: [truckTimeLg, truckTimeSm] },
    completed: { title: pickup ? 'Collected' : 'Delivered', body: 'This order is complete. If something is not right, message the seller from here.', art: [bagHappyLg, bagHappySm] },
    cancelled: { title: 'Order cancelled', body: summary.refundRequired ? 'This order was cancelled and the refund is being processed.' : 'This order was cancelled.', art: [bagCrossLg, bagCrossSm] },
    declined: { title: 'The seller declined this order', body: 'Your payment is refunded. The listing may be out of stock; try another store.', art: [bagCrossLg, bagCrossSm] },
  }
  let banner = banners[status]
  if (!paid && !closed) {
    banner = expired
      ? { title: 'This order expired before payment', body: 'An order has fifteen minutes to be paid. Nothing was charged; place it again from the listing to buy.', art: [bagCrossLg, bagCrossSm] }
      : {
          title: 'Finish paying for this order',
          body: `${summary.expiresAt ? `${mmss(paymentSecondsLeft(summary, now))} left to pay. ` : ''}Paystack’s secure page opens when you continue; the seller is told once the payment is confirmed.`,
          action: { label: paying ? 'Opening payment…' : 'Pay now', onClick: () => void payment.pay(id), busy: paying },
        }
  } else if (summary.cancellationRequested && !closed) {
    banner = { title: 'Cancellation requested', body: 'The carrier is being asked to cancel the pickup. The order closes and the refund follows once the carrier confirms.' }
  }

  /** The buyer has the goods in hand: the order completes on their word (`POST /orders/{id}/pickup/confirm`). */
  async function collected() {
    setError('')
    try {
      await confirmPickup({ id, expectedVersion: summary!.version }).unwrap()
    } catch (e) {
      const problem = toApiError(e)
      setError(problem.status === 409 ? 'This order changed just now. Reload the page and try again.' : describeError(e))
    }
  }

  async function cancel() {
    setConfirm(false)
    setError('')
    try {
      await cancelOrder({ id, expectedVersion: summary!.version }).unwrap()
    } catch (e) {
      const problem = toApiError(e)
      setError(problem.status === 409 ? 'This order changed just now. Reload the page and try again.' : describeError(e))
    }
  }

  async function submitReview() {
    if (!productId) return
    if (!review.rating) return setReview((r) => ({ ...r, error: 'Pick a star rating.' }))
    setReview((r) => ({ ...r, error: '' }))
    try {
      await postReview({ productId, orderId: id, rating: review.rating, text: review.text.trim() }).unwrap()
      setReview((r) => ({ ...r, done: true }))
    } catch (e) {
      const problem = toApiError(e)
      setReview((r) => ({ ...r, error: problem.status === 409 ? 'You have already reviewed this purchase.' : describeError(e) }))
    }
  }

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[40px] flex flex-col gap-[24px] max-md:px-[16px] max-md:pt-[24px]">
        <div className="flex items-start justify-between max-lg:flex-col max-lg:gap-[16px]">
          <div className="flex flex-col gap-[24px] max-w-[490px]">
            <button type="button" onClick={() => navigate('/dashboard/purchases')} className="flex items-center gap-[8px] w-fit">
              <img src={arrowDownIcon} alt="" className="size-[16px]" style={{ transform: 'rotate(90deg)' }} />
              <span className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500)}>
                Back
              </span>
            </button>
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[8px] max-md:flex-wrap">
                <h1 className="text-[#101604] text-[24px] leading-[32px] truncate" style={jakarta(600)}>
                  Order {shortOrderId(o.id)}
                </h1>
                <OrderStatusBadge status={status} />
              </div>
              <p className="text-[#807e7e] text-[13px] leading-[16px]" style={jakarta(400)}>
                Placed {placed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                {placed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}
              </p>
              <p className="text-[#807e7e] text-[11px] leading-[14px] select-all" style={jakarta(400)}>
                Reference {o.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-[16px] pt-[56px] max-lg:pt-0 max-md:w-full max-md:gap-[12px]">
            {paid && (
              <button type="button" onClick={() => setReceiptOpen(true)} className="flex h-[48px] w-[168px] items-center justify-center gap-[8px] rounded-[30px] bg-white max-md:w-auto max-md:flex-1">
                <img src={receiptIcon} alt="" className="size-[20px]" />
                <span className="text-[#101604] text-[14px] leading-[18px]" style={jakarta(500)}>
                  Receipt
                </span>
              </button>
            )}
            {paid && canCancel(status) && !summary.cancellationRequested && (
              <button
                type="button"
                onClick={() => setConfirm(true)}
                disabled={cancelling}
                className="flex h-[48px] w-[168px] items-center justify-center rounded-[30px] bg-white text-[#b13b3b] text-[14px] leading-[18px] disabled:opacity-60 max-md:w-auto max-md:flex-1"
                style={jakarta(500)}
              >
                {cancelling ? 'Cancelling…' : 'Cancel order'}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/dashboard/messages')}
              className="flex h-[48px] w-[168px] items-center justify-center gap-[8px] rounded-[30px] px-[24px] max-md:w-auto max-md:flex-1"
              style={{ backgroundImage: CTA_BG }}
            >
              <img src={smsIcon} alt="" className="size-[20px]" />
              <span className="text-[14px] leading-[18px] bg-clip-text text-transparent whitespace-nowrap" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
                Message seller
              </span>
            </button>
          </div>
        </div>

        {(error || payment.state.phase === 'error') && (
          <p role="alert" className="text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
            {error || (payment.state.phase === 'error' ? payment.state.message : '')}
          </p>
        )}

        {/* Banner, as the seller's (561:6611): lime-to-green, radius 20, copy at 24/24, art or the action at the right */}
        <div
          className="relative mt-[16px] overflow-hidden rounded-[20px] px-[24px] py-[24px] flex items-center justify-between lg:h-[126px] max-lg:min-h-[126px] max-md:flex-col max-md:items-stretch max-md:gap-[16px] max-md:px-[16px]"
          style={{ backgroundImage: 'linear-gradient(100deg, #aee74a -20%, #007c53 72%)' }}
        >
          <div className="flex flex-col gap-[8px] max-w-[515px]">
            <p className="text-white text-[24px] leading-[30px]" style={jakarta(700)}>
              {banner.title}
            </p>
            <p className="text-[14px] leading-[20px]" style={{ ...jakarta(400), color: 'rgba(255,255,255,0.75)' }}>
              {banner.body}
            </p>
          </div>
          {banner.action && (
            <button
              type="button"
              onClick={banner.action.onClick}
              disabled={banner.action.busy}
              className="flex h-[48px] shrink-0 items-center justify-center rounded-[30px] bg-[#aee74a] px-[24px] whitespace-nowrap disabled:opacity-70 max-md:px-[16px]"
              style={{ minWidth: 168 }}
            >
              <span className="text-[#0c2310] text-[14px] leading-[18px]" style={jakarta(500)}>
                {banner.action.label}
              </span>
            </button>
          )}
          {banner.art && !banner.action && (
            <>
              <img src={banner.art[0]} alt="" className="absolute pointer-events-none max-md:hidden" style={{ right: -20, top: -27, width: 181, height: 181 }} />
              <img src={banner.art[1]} alt="" className="absolute pointer-events-none max-md:hidden" style={{ right: 61, top: -5, width: 136, height: 136 }} />
            </>
          )}
        </div>

        {!closed && !expired && (
          <div className="relative bg-white rounded-[20px] h-[155px] px-[24px] pt-[24px] max-md:h-auto max-md:px-[16px] max-md:py-[16px]">
            <ol className="relative flex items-start justify-between before:absolute before:left-[49px] before:right-[50px] before:top-[16px] before:h-[2px] before:rounded-full before:bg-[rgba(0,124,83,0.1)] before:content-[''] max-md:flex-col max-md:gap-[16px] max-md:before:hidden">
              {steps.map(({ label, words }, i) => {
                const done = i < reached
                const next = i === reached
                const at = i === 0 ? o.placedAt : i === 1 ? summary.paidAt : !pickup && i === 5 ? (stepTime(events, ...words) ?? (summary.fulfillmentDelivery?.status === 'DELIVERED' ? (summary.fulfillmentDelivery.checkedAt ?? null) : null)) : stepTime(events, ...words)
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

        <div className="flex items-start gap-[16px] max-lg:flex-col max-lg:items-stretch">
          <div className="flex flex-col gap-[24px] flex-1 min-w-0">
            <Card title="Items in this order">
              <div className="flex items-center gap-[14px]">
                {o.item.image ? (
                  <Thumb src={o.item.image} className="size-[76px] rounded-[12px] shrink-0" />
                ) : (
                  <div className="size-[76px] rounded-[12px] bg-[#f7f7f7] shrink-0" />
                )}
                <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                  <p className="text-[#101604] text-[16px] leading-[24px] capitalize truncate max-md:whitespace-normal max-md:line-clamp-2" style={jakarta(600)}>
                    {o.item.title}
                  </p>
                  <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                    Sold by {store}
                  </p>
                  <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                    {o.item.qty} × {naira(o.item.price)} · {o.item.weightKg} kg
                  </p>
                </div>
                <p className="text-[#101604] text-[16px] leading-[24px] shrink-0" style={jakarta(700)}>
                  {naira(subtotal)}
                </p>
              </div>
              {summary.note && (
                <p className="text-[#007c53] text-[12px] leading-[24px] italic" style={jakarta(400)}>
                  Your note to the seller: “{summary.note}”
                </p>
              )}
            </Card>

            <Card title="Payment summary">
              <div className="flex flex-col gap-[16px]">
                {[
                  ['Items subtotal', naira(subtotal)],
                  ['Delivery', naira(delivery)],
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
                    {paid ? 'Total paid' : 'Total to pay'}
                  </span>
                  <span className="text-[#101604] text-[16px] leading-[20px]" style={jakarta(700)}>
                    {naira(total)}
                  </span>
                </div>
                <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                  Payment {String(summary.paymentStatus).toLowerCase().replace(/_/g, ' ')}
                  {summary.paidAt ? ` on ${when(summary.paidAt)}` : ''}
                  {summary.refundRequired ? ' · refund due' : ''}.
                </p>
              </div>
            </Card>

            {status === 'completed' && productId && (
              <Card title="Review your purchase">
                {review.done ? (
                  <p className="text-[#007c53] text-[14px] leading-[24px]" style={jakarta(500)}>
                    Thank you. Your review is on the listing.
                  </p>
                ) : (
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex items-center gap-[4px]" role="radiogroup" aria-label="Rating">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" role="radio" aria-checked={review.rating === n} aria-label={`${n} star${n === 1 ? '' : 's'}`} onClick={() => setReview((r) => ({ ...r, rating: n }))} className="text-[24px] leading-none" style={{ color: n <= review.rating ? '#f5b301' : '#e4dede' }}>
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={review.text}
                      maxLength={1000}
                      rows={3}
                      onChange={(e) => setReview((r) => ({ ...r, text: e.target.value }))}
                      placeholder="How were the goods and the delivery?"
                      className="w-full rounded-[20px] bg-[#f7f7f7] px-[16px] py-[12px] text-[14px] leading-[24px] text-[#101604] outline-none border border-transparent focus:border-[#007c53] placeholder:text-[#807e7e]"
                      style={jakarta(400)}
                    />
                    {review.error && (
                      <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
                        {review.error}
                      </p>
                    )}
                    <button type="button" onClick={submitReview} disabled={reviewing} className="flex h-[48px] w-[168px] items-center justify-center rounded-[30px] disabled:opacity-70 max-md:w-full" style={{ backgroundImage: CTA_BG }}>
                      <span className="text-[14px] leading-[18px] bg-clip-text text-transparent" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
                        {reviewing ? 'Sending…' : 'Post review'}
                      </span>
                    </button>
                  </div>
                )}
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-[24px] w-[400px] shrink-0 max-lg:w-full">
            <Card title="Seller">
              <Detail text={initials(store)} label="Store" value={store} />
              {summary.pickup && <Detail icon={truckFastIcon} label={pickup ? 'Collect from' : 'Ships from'} value={addressLine(summary.pickup)} />}
            </Card>
            <Card
              title={pickup ? 'Collection' : 'Delivery'}
              action={
                tracking?.url ? (
                  <a href={tracking.url} target="_blank" rel="noreferrer" className="flex items-center gap-[8px] text-[#007c53] text-[12px] leading-[24px]" style={jakarta(500)}>
                    <img src={routingIcon} alt="" className="size-[16px]" />
                    Track delivery
                  </a>
                ) : null
              }
            >
              {pickup ? (
                <Detail icon={routingIcon} label="You collect from the seller" value={collectFrom} />
              ) : (
                <Detail icon={truckFastIcon} label={summary.delivery?.estimate ? `Carrier · ${summary.delivery.estimate.toLowerCase()}` : 'Carrier'} value={tracking?.courier || summary.delivery?.carrier || o.delivery.method} />
              )}
              {summary.address && <Detail icon={routingIcon} label={`Delivering to ${summary.address.firstName} ${summary.address.lastName} · ${summary.address.phone}`} value={addressLine(summary.address)} />}
              {tracking?.number && <Detail icon={routingIcon} label="Tracking number" value={tracking.number} href={tracking.url || undefined} />}
              <Detail icon={cardPosIcon} label={paid ? 'Amount paid' : 'Amount due'} value={naira(total)} />
            </Card>
          </div>
        </div>
      </div>

      {confirm && <OrderStatusDialog kind="cancel" body={cancelMeaning(status) ?? undefined} onClose={() => setConfirm(false)} onConfirm={cancel} />}
      {receiptOpen && (
        <ReceiptModal
          receipt={receiptData(summary, receipt.data, status)}
          onViewOrder={() => setReceiptOpen(false)}
          onTrack={tracking?.url ? () => window.open(tracking.url, '_blank', 'noreferrer') : undefined}
          onClose={() => setReceiptOpen(false)}
        />
      )}
    </DashboardLayout>
  )
}
