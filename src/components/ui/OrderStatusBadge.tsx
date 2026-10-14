import { STATUS_LABEL, STATUS_STYLE, type OrderStatus } from '../../data/orders'
import { jakarta } from '../../utils/styles'

interface OrderStatusBadgeProps {
  status: OrderStatus
  /** Caps the pill, as the 100px status column on the orders table does; the label truncates. */
  maxWidth?: number
}

// Figma "Order status" (561:5240): padding 6/10, radius 30, label 11px/13.86 SemiBold.
export default function OrderStatusBadge({ status, maxWidth }: OrderStatusBadgeProps) {
  const { bg, color } = STATUS_STYLE[status]
  return (
    <span
      className="inline-flex items-center justify-center rounded-[30px] px-[10px] py-[6px] max-w-full"
      style={{ background: bg, maxWidth }}
      title={STATUS_LABEL[status]}
    >
      <span className="text-[11px] leading-[14px] whitespace-nowrap truncate" style={{ ...jakarta(600), color }}>
        {STATUS_LABEL[status]}
      </span>
    </span>
  )
}
