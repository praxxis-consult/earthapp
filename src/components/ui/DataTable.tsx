import type { KeyboardEvent, ReactNode } from 'react'
import { jakarta } from '../../utils/styles'

export interface DataColumn<Row> {
  key: string
  header: ReactNode
  /**
   * The column's width in the 1440 frame (the table is 1091 wide there); it is kept as a share of
   * the table so the columns scale together on a narrower screen. The first column takes the rest
   * when omitted.
   */
  width?: number
  align?: 'left' | 'center' | 'right'
  cell: (row: Row) => ReactNode
  /**
   * Where the cell goes on the phone card: `title` is the card's top-left (the row's identity),
   * `badge` sits top-right beside it, `field` (default) is a label/value pair underneath, and
   * `footer` is the card's bottom line under a rule (a total, an action).
   */
  card?: 'title' | 'badge' | 'field' | 'footer'
}

interface DataTableProps<Row> {
  columns: DataColumn<Row>[]
  rows: Row[]
  rowKey: (row: Row, index: number) => string
  onRowClick?: (row: Row) => void
  /** The accessible name of a clickable row ("Order EA-0828, Adaora N."). */
  rowLabel?: (row: Row) => string
  /** `plain`: a white 44px header (products 462:6490). `tinted`: the #f7f7f7 header of the orders tables. */
  head?: 'plain' | 'tinted'
  /** Desktop row height; the design's tables use 72. */
  rowHeight?: number
  /** Replaces the default 24px horizontal cell padding on the desktop table. */
  cellPadding?: number
  /** The table's own width (inside the 1px frame) in the frame the column widths were measured in. */
  designWidth?: number
  /** The frame's corner radius; the products and payout tables use 20, the orders table 10. */
  radius?: number
  /**
   * The table scrolls inside its own frame (give it a height through `className`), with the
   * header staying put, so a pager under it stays on screen.
   */
  scroll?: boolean
  className?: string
}

const HEAD =
  'h-[44px] text-[#807e7e] text-[12px] leading-[15px] tracking-[-0.06px] whitespace-nowrap'

/**
 * The dashboard's list tables (products 462:6490, orders 561:3325, payout, referrals): a 1px
 * #f7f7f7 frame, radius 20, a header rule in #807e7e and rows separated by #f7f7f7. The same
 * markup renders the desktop table from `md` up; below it each row becomes a card, with the
 * `title` cell and the `badge` cell on top and the other columns as label/value pairs, so no
 * table is ever wider than a phone.
 */
export default function DataTable<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  rowLabel,
  head = 'plain',
  rowHeight = 72,
  cellPadding = 24,
  designWidth = 1091,
  radius = 20,
  scroll = false,
  className = '',
}: DataTableProps<Row>) {
  const title = columns.find((c) => c.card === 'title') ?? columns[0]
  const badge = columns.find((c) => c.card === 'badge')
  const footer = columns.find((c) => c.card === 'footer')
  const fields = columns.filter((c) => c !== title && c !== badge && c !== footer)
  const interactive = Boolean(onRowClick)
  const rowClass = interactive
    ? 'cursor-pointer hover:bg-[#fbfbfb] focus-visible:outline-2 focus-visible:outline-[#007c53] focus-visible:-outline-offset-2'
    : ''
  const onKey = (row: Row) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onRowClick?.(row)
    }
  }
  const justify = (c: DataColumn<Row>) => (c.align === 'center' ? 'justify-center' : c.align === 'right' ? 'justify-end' : '')
  const textAlign = (c: DataColumn<Row>) => (c.align === 'center' ? 'text-center' : c.align === 'right' ? 'text-right' : 'text-left')

  return (
    <div
      className={`border border-[#f7f7f7] bg-white ${scroll ? 'overflow-y-auto' : 'overflow-hidden'} max-xl:overflow-x-auto ${className}`}
      style={{ borderRadius: radius, ['--design-w' as string]: `${designWidth}px` }}
    >
      {/* Between md and xl the columns would collide, so the table keeps its design width and the panel scrolls sideways */}
      <table className="w-full table-fixed border-collapse max-md:hidden max-xl:min-w-(--design-w)">
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={c.width ? { width: `${(c.width / designWidth) * 100}%` } : undefined} />
          ))}
        </colgroup>
        {/* While scrolling, the header stays put; collapsed borders do not travel with sticky cells, so its rule is an inset shadow on each cell */}
        <thead className={scroll ? 'sticky top-0 z-[1]' : undefined}>
          <tr className={`${scroll ? '' : 'border-b border-[#807e7e]'} ${head === 'tinted' ? 'bg-[#f7f7f7]' : 'bg-white'}`}>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`${HEAD} ${textAlign(c)} ${scroll ? 'shadow-[inset_0_-1px_0_#807e7e]' : ''}`}
                style={{ ...jakarta(600), paddingLeft: cellPadding, paddingRight: cellPadding }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={interactive ? onKey(row) : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive && rowLabel ? rowLabel(row) : undefined}
              className={`border-b border-[#f7f7f7] last:border-b-0 ${rowClass}`}
            >
              {columns.map((c) => (
                <td key={c.key} className="p-0">
                  <div
                    className={`flex items-center min-w-0 ${justify(c)}`}
                    style={{ height: rowHeight, paddingLeft: c.align === 'center' ? 0 : cellPadding, paddingRight: c.align === 'center' ? 0 : cellPadding }}
                  >
                    {c.cell(row)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="md:hidden flex flex-col">
        {rows.map((row, i) => (
          <li
            key={rowKey(row, i)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onKeyDown={interactive ? onKey(row) : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive && rowLabel ? rowLabel(row) : undefined}
            className={`flex flex-col gap-[12px] p-[16px] border-b border-[#f7f7f7] last:border-b-0 ${rowClass}`}
          >
            <div className="flex items-center justify-between gap-[12px] min-w-0">
              <div className="flex items-center min-w-0 flex-1">{title.cell(row)}</div>
              {badge && <div className="shrink-0">{badge.cell(row)}</div>}
            </div>
            {fields.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-[16px] gap-y-[8px]">
                {fields.map((c) => (
                  <div key={c.key} className="min-w-0">
                    <dt className="text-[#807e7e] text-[11px] leading-[16px]" style={jakarta(500)}>
                      {c.header}
                    </dt>
                    <dd className="flex items-center min-w-0 text-[#101928] text-[14px] leading-[24px]">{c.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {footer && (
              <div className="flex items-center justify-between gap-[12px] pt-[12px] border-t border-[#f7f7f7]">
                <span className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(500)}>
                  {footer.header}
                </span>
                <div className="flex items-center min-w-0">{footer.cell(row)}</div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
