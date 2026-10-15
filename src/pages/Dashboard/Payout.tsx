import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Pager from '../../components/ui/Pager'
import DataTable from '../../components/ui/DataTable'
import EmptyBlock from '../../components/ui/EmptyBlock'
import { naira } from '../../data/orders'
import { orderLimit, paid, payouts, pending, received, type Payout } from '../../data/payouts'
import { jakarta } from '../../utils/styles'

const PAGE_SIZE = 10

/**
 * Figma payout 592:15295: title, Paid (gradient) and Pending cards, the order-limit card with its
 * progress bar and tiers, then the transactions table (240/179/168/168/169/168) and pager.
 * Figures are local until the payouts API exists.
 */
export default function Payout() {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(payouts.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = payouts.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const left = orderLimit.current - orderLimit.inProgress
  const pct = Math.min(100, (orderLimit.inProgress / orderLimit.current) * 100)
  const short = (n: number) => '₦' + n.toLocaleString('en-NG')

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[47px] pb-[24px] flex flex-col gap-[24px] max-md:px-[16px] max-md:pt-[24px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Payouts
          </h1>
          <p className="text-[#807e7e] text-[16px] leading-[24px] max-w-[800px]" style={jakarta(400)}>
            Your share of every order goes straight to your bank account the moment the buyer receives their package.
          </p>
        </div>

        {/* Paid / Pending (594:15599, 594:15603): 136 tall, radius 20, label 14/24, figure 32/48 Bold, note 12/15 */}
        <div className="flex gap-[16px] max-md:flex-col">
          <div
            className="flex-1 h-[136px] rounded-[20px] pl-[25px] pr-[24px] pt-[24px] flex flex-col gap-[16px]"
            // Solved from the frame's gradient handles (594:15599, 539×136; bands parallel to the width handle)
            style={{ backgroundImage: 'linear-gradient(177.27deg, #aee74a -61.8%, #007c53 74.7%)' }}
          >
            <p className="text-white text-[14px] leading-[24px]" style={jakarta(500)}>
              Paid
            </p>
            <div className="flex items-start gap-[16px]">
              <p className="text-white text-[32px] leading-[48px]" style={jakarta(700)}>
                {naira(paid)}
              </p>
              <p className="text-[12px] leading-[15px] mt-[22px]" style={{ ...jakarta(400), color: 'rgba(255,255,255,0.75)' }}>
                all time
              </p>
            </div>
          </div>
          <div className="flex-1 h-[136px] rounded-[20px] bg-white pl-[25px] pr-[24px] pt-[24px] flex flex-col gap-[16px]">
            <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(500)}>
              Pending
            </p>
            <div className="flex items-start gap-[16px]">
              <p className="text-[#101604] text-[32px] leading-[48px]" style={jakarta(700)}>
                {naira(pending)}
              </p>
              <p className="text-[#807e7e] text-[12px] leading-[15px] mt-[22px]" style={jakarta(400)}>
                awaiting clearance
              </p>
            </div>
          </div>
        </div>

        {/* Order limit (594:15620): radius 20, padding 20, gap 16 */}
        <section className="bg-white rounded-[20px] p-[20px] flex flex-col gap-[16px]">
          <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-[12px]">
            <div className="flex flex-col gap-[3px] max-w-[310px]">
              <h2 className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
                Your order limit
              </h2>
              <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                New stores start with a limit on orders in progress. It grows as you complete orders without problems.
              </p>
            </div>
            <div className="flex flex-col items-end gap-[8px] max-sm:flex-row max-sm:items-center">
              <p className="text-[#807e7e] text-[10px] leading-[13px]" style={jakarta(500)}>
                Current limit:
              </p>
              <span
                className="rounded-[30px] bg-[#f2f8f6] px-[10px] py-[6px] text-[#177b4d] text-[10px] leading-[13px]"
                style={jakarta(700)}
              >
                {short(orderLimit.current)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-[8px]">
            <div
              className="h-[8px] w-full rounded-[30px] bg-[#f7f7f7] overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-[30px] bg-[#007c53]" style={{ width: `${pct}%` }} />
            </div>
            <div
              className="flex items-center justify-between text-[#807e7e] text-[10px] leading-[13px]"
              style={jakarta(500)}
            >
              <span>{short(orderLimit.inProgress)} in progress</span>
              <span>{short(left)} left</span>
            </div>
          </div>
          <div className="h-px w-full bg-[#f7f7f7]" />
          {orderLimit.tiers.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between h-[18px]">
              <span className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                {label}
              </span>
              <span className="text-[#101604] text-[14px] leading-[18px]" style={jakarta(700)}>
                {typeof value === 'number' ? naira(value) : value}
              </span>
            </div>
          ))}
          <p className="text-[#101604] text-[12px] leading-[15px]" style={jakarta(500)}>
            You have {orderLimit.goodOrders} good orders from {orderLimit.buyers} different buyers.
          </p>
        </section>

        {/* Transactions (599:18298): 32px below the limit card */}
        <div className="mt-[8px] flex flex-col gap-[16px]">
          <h2 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Transactions
          </h2>
          {payouts.length === 0 ? (
            <div className="bg-white border border-[#f7f7f7] rounded-[20px] flex items-center justify-center py-[64px] max-md:py-[40px]">
              <EmptyBlock
                title="No payouts yet"
                copy="Your share of each completed order will show here as soon as it is paid out."
              />
            </div>
          ) : (
            <>
              <DataTable
                rows={rows}
                rowKey={(p) => p.orderId}
                columns={[
                  {
                    key: 'order',
                    header: 'Order',
                    card: 'title',
                    cell: (p) => (
                      <div className="flex flex-col min-w-0">
                        <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(600)}>
                          {p.orderId}
                        </p>
                        <p className="text-[#807e7e] text-[14px] leading-[20px] truncate" style={jakarta(400)}>
                          {p.buyer}, {p.date}
                        </p>
                      </div>
                    ),
                  },
                  ...(
                    [
                      ['amount', 'Amount', 179, (p: Payout) => p.amount],
                      ['commission', 'Commission', 168, (p: Payout) => -p.commission],
                      ['vat', 'VAT', 168, (p: Payout) => -p.vat],
                      ['deliveryFee', 'Delivery fee', 169, (p: Payout) => p.deliveryFee],
                    ] as const
                  ).map(([key, header, width, value]) => ({
                    key,
                    header,
                    width,
                    align: 'right' as const,
                    cell: (p: Payout) => {
                      const v = value(p)
                      return (
                        <p className="text-[#101604] text-[14px] leading-[24px] whitespace-nowrap" style={jakarta(400)}>
                          {v < 0 ? `−${naira(-v)}` : naira(v)}
                        </p>
                      )
                    },
                  })),
                  {
                    key: 'received',
                    header: 'You receive',
                    width: 168,
                    align: 'right',
                    card: 'footer',
                    cell: (p) => (
                      <p className="text-[#007c53] text-[14px] leading-[24px] whitespace-nowrap max-md:text-[16px] max-md:leading-[20px]" style={jakarta(600)}>
                        {naira(received(p))}
                      </p>
                    ),
                  },
                ]}
              />
              <Pager page={current} pageCount={pageCount} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
