import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import OrderStatusBadge from '../../components/ui/OrderStatusBadge'
import OrderStatusDialog from '../../components/ui/OrderStatusDialog'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import smsIcon from '../../assets/icons/od-sms.svg'
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
import { useCancelOrderMutation, useGetOrderQuery } from '../../feature/orders/ordersApiSlice'
import { canCancel, purchaseFromApi } from '../../data/purchases'
import { initials, naira, type OrderStatus } from '../../data/orders'
import { describeError, toApiError } from '../../services/earthApi'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

/** The seller page's seven steps, read from the buyer's side. */
const STEPS = ['Order placed', 'Payment confirmed', 'Seller accepted', 'Packed and ready', 'On the way', 'Delivered', 'Completed']
const REACHED: Record<OrderStatus, number> = { new: 2, processing: 3, ready: 4, dispatched: 5, completed: 7, cancelled: 0, declined: 0 }

interface Banner {
  title: string
  body: string
  art?: [string, string]
}

/** The order page's detail row (Figma "Fulfillment detail"): 36px icon disc, label 11/14, value 12/20 Medium. */
function Detail({ icon, text, label, value }: { icon?: string; text?: string; label: string; value: string }) {
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
        <p className="text-[#101604] text-[12px] leading-[20px] truncate" style={jakarta(500)}>
          {value}
        </p>
      </div>
    </div>
  )
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-[20px] p-[20px] flex flex-col gap-[16px] ${className}`}>
      <h2 className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
        {title}
      </h2>
      <div className="h-px w-full bg-[#f7f7f7]" />
      {children}
    </section>
  )
}

/**
 * One of the buyer's orders, on the seller's order-detail layout (561:5317 and siblings): the
 * header with the status badge, the status banner, the seven-step timeline, items and payment on
 * the left, the seller and the delivery on the right. The order comes from `GET /orders/{id}`;
 * the only write a buyer has is to cancel before the seller starts on it.
 */
export default function PurchaseDetail() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const order = useGetOrderQuery(id, { skip: !id })
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation()
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState('')

  if (order.isLoading) {
    return (
      <DashboardLayout>
        <div className="px-[24px] pt-[40px]" aria-busy="true" />
      </DashboardLayout>
    )
  }
  if (!order.data) {
    const missing = order.error && toApiError(order.error).status === 404
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

  const o = purchaseFromApi(order.data)
  const store = o.item.soldBy
  const status = o.status
  const reached = REACHED[status]
  const closed = status === 'cancelled' || status === 'declined'
  const placed = new Date(o.placedAt)
  const subtotal = o.item.price * o.item.qty
  const total = o.payment.subtotal
  const delivery = Math.max(0, total - subtotal)

  const banners: Record<OrderStatus, Banner> = {
    new: { title: `Waiting for ${store} to accept`, body: 'Your payment is confirmed. The seller reviews the order next, and you will hear as soon as it is accepted. You can still cancel until then.' },
    processing: { title: `${store} is preparing your order`, body: 'The seller accepted and is packing it. A carrier is booked as soon as it is ready.' },
    ready: { title: 'Packed and waiting for the carrier', body: 'The seller has it ready for pickup. You will be told the moment it is on the way.' },
    dispatched: { title: 'On its way to you', body: 'The carrier has the package. Keep your phone close for the delivery.', art: [truckTimeLg, truckTimeSm] },
    completed: { title: 'Delivered', body: 'This order is complete. If something is not right, message the seller from here.', art: [bagHappyLg, bagHappySm] },
    cancelled: { title: 'Order cancelled', body: 'This order was cancelled and the refund is being processed.', art: [bagCrossLg, bagCrossSm] },
    declined: { title: 'The seller declined this order', body: 'You were refunded automatically. The listing may be out of stock; try another store.', art: [bagCrossLg, bagCrossSm] },
  }
  const banner = banners[status]

  async function cancel() {
    setConfirm(false)
    setError('')
    try {
      await cancelOrder({ id, expectedVersion: order.data!.version }).unwrap()
    } catch (e) {
      setError(describeError(e))
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
                  Order {o.id}
                </h1>
                <OrderStatusBadge status={status} />
              </div>
              <p className="text-[#807e7e] text-[13px] leading-[16px]" style={jakarta(400)}>
                Placed {placed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                {placed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · {order.data.itemCount} {order.data.itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-[16px] pt-[56px] max-lg:pt-0 max-md:w-full max-md:gap-[12px]">
            {canCancel(status) && (
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

        {error && (
          <p role="alert" className="text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
            {error}
          </p>
        )}

        {/* Banner, as the seller's (561:6611): lime-to-green, radius 20, copy at 24/24, art at the right */}
        <div
          className="relative mt-[16px] overflow-hidden rounded-[20px] px-[24px] py-[24px] flex items-center justify-between lg:h-[126px] max-lg:min-h-[126px] max-md:px-[16px]"
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
          {banner.art && (
            <>
              <img src={banner.art[0]} alt="" className="absolute pointer-events-none max-md:hidden" style={{ right: -20, top: -27, width: 181, height: 181 }} />
              <img src={banner.art[1]} alt="" className="absolute pointer-events-none max-md:hidden" style={{ right: 61, top: -5, width: 136, height: 136 }} />
            </>
          )}
        </div>

        {!closed && (
          <div className="relative bg-white rounded-[20px] h-[155px] px-[24px] pt-[24px] max-md:h-auto max-md:px-[16px] max-md:py-[16px]">
            <ol className="relative flex items-start justify-between before:absolute before:left-[49px] before:right-[50px] before:top-[16px] before:h-[2px] before:rounded-full before:bg-[rgba(0,124,83,0.1)] before:content-[''] max-md:flex-col max-md:gap-[16px] max-md:before:hidden">
              {STEPS.map((label, i) => {
                const done = i < reached
                const next = i === reached
                return (
                  <li key={label} className="relative flex w-[87px] flex-col items-center gap-[16px] max-md:w-full max-md:flex-row max-md:gap-[12px]">
                    <img src={done ? stepDoneIcon : stepTodoIcon} alt={done ? 'Done' : next ? 'Next' : 'Not yet'} className="size-[32px] shrink-0" />
                    <div className="flex flex-col items-center gap-[4px] text-center max-md:flex-1 max-md:flex-row max-md:items-center max-md:justify-between max-md:text-left">
                      <p className="text-[#101604] text-[13px] leading-[20px]" style={jakarta(600)}>
                        {label}
                      </p>
                      <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                        {done ? 'Done' : next ? 'Next' : 'Not yet'}
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
                  <img src={o.item.image} alt="" className="size-[76px] rounded-[12px] object-cover shrink-0" />
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
                    Total paid
                  </span>
                  <span className="text-[#101604] text-[16px] leading-[20px]" style={jakarta(700)}>
                    {naira(total)}
                  </span>
                </div>
                <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                  Payment {order.data.paymentStatus.toLowerCase()}{order.data.paidAt ? ` on ${new Date(order.data.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}.
                </p>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-[24px] w-[400px] shrink-0 max-lg:w-full">
            <Card title="Seller">
              <Detail text={initials(store)} label="Store" value={store} />
            </Card>
            <Card title="Delivery">
              <Detail icon={truckFastIcon} label="Method" value={o.delivery.method} />
              <Detail icon={cardPosIcon} label="Amount paid" value={naira(total)} />
            </Card>
          </div>
        </div>
      </div>

      {confirm && <OrderStatusDialog kind="cancel" onClose={() => setConfirm(false)} onConfirm={cancel} />}
    </DashboardLayout>
  )
}
