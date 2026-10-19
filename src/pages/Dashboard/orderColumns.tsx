import type { DataColumn } from '../../components/ui/DataTable'
import OrderStatusBadge from '../../components/ui/OrderStatusBadge'
import Thumb from '../../components/ui/Thumb'
import { naira, shortOrderId, type Order } from '../../data/orders'
import { jakarta } from '../../utils/styles'

/** A table cell's text (orders 561:3325, overview 459:1048): 14/24 in #101928. */
export const CELL = 'text-[#101928] text-[14px] leading-[24px]'

interface OrderColumnOptions {
  /** Column widths in the frame the table was measured in (the Items column takes the rest). */
  widths: { order: number; buyer: number; quantity: number; price: number; delivery: number; status?: number }
  /** The orders page centres quantities; the overview starts them at the cell's 24px like the other text. */
  quantityAlign?: 'left' | 'center'
  /** The overview's recent-orders table has no status column. */
  status?: boolean
  /** Whose table it is: the seller's shows the buyer, the buyer's shows the store it bought from. */
  party?: 'buyer' | 'seller'
}

/**
 * The columns the dashboard's order tables share: order id with the placed time beneath it,
 * the other party (buyer or seller), item with its 40px thumbnail, quantity, price (left-aligned, as every price in the
 * frames), delivery method (centred) and, where the frame has it, the status badge.
 */
export function orderColumns({ widths, quantityAlign = 'center', status = true, party = 'buyer' }: OrderColumnOptions): DataColumn<Order>[] {
  const columns: DataColumn<Order>[] = [
    {
      key: 'order',
      header: 'Order',
      width: widths.order,
      card: 'title',
      cell: (o) => (
        <div className="flex flex-col min-w-0">
          <p className={`${CELL} whitespace-nowrap`} style={jakarta(600)} title={o.id}>
            {shortOrderId(o.id)}
          </p>
          <p className="text-[#807e7e] text-[12px] leading-[17px] truncate" style={jakarta(400)}>
            {o.placed}
          </p>
        </div>
      ),
    },
    {
      key: party,
      header: party === 'buyer' ? 'Buyer' : 'Seller',
      width: widths.buyer,
      cell: (o) => (
        <p className={`${CELL} truncate`} style={jakarta(400)}>
          {party === 'buyer' ? o.buyer.name : o.item.soldBy}
        </p>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      cell: (o) => (
        <div className="flex items-center gap-[12px] min-w-0">
          <span className="relative size-[40px] shrink-0 rounded-full overflow-hidden ring-[1.5px] ring-white">
            <Thumb src={o.item.image} className="size-full" />
          </span>
          <p className={`${CELL} capitalize truncate`} style={jakarta(400)}>
            {o.item.title}
          </p>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      width: widths.quantity,
      align: quantityAlign,
      cell: (o) => (
        <p className={`${CELL} whitespace-nowrap`} style={jakarta(400)}>
          {o.item.qty}x ({o.item.weightKg} kg)
        </p>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      width: widths.price,
      align: 'left',
      cell: (o) => (
        <p className={`${CELL} whitespace-nowrap`} style={jakarta(400)}>
          {naira(o.item.price)}
        </p>
      ),
    },
    {
      key: 'delivery',
      header: 'Delivery',
      width: widths.delivery,
      align: 'center',
      cell: (o) => (
        <p className={CELL} style={jakarta(400)}>
          {o.delivery.method}
        </p>
      ),
    },
  ]
  if (status) {
    columns.push({
      key: 'status',
      header: 'Status',
      width: widths.status,
      align: 'center',
      card: 'badge',
      cell: (o) => <OrderStatusBadge status={o.status} maxWidth={92} />,
    })
  }
  return columns
}
