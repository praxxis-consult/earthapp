import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Pager from '../../components/ui/Pager'
import Toast from '../../components/ui/Toast'
import emptyBg from '../../assets/icons/db-empty-bg.svg'
import emptyIllustration from '../../assets/icons/db-empty-illustration.svg'
import addIcon from '../../assets/icons/db-add.svg'
import productThumb from '../../assets/images/db-product-thumb.png'
import { describeError } from '../../services/earthApi'
import { useGetMyProductsQuery } from '../../feature/products/productsApiSlice'
import { LISTING_STYLE, listingStatus, naira, soldAsLabel } from '../../lib/productView'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

const PAGE_SIZE = 10

export interface ProductsToast {
  title: string
  body?: string
}

function AddProductButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex gap-[8px] h-[48px] items-center justify-center px-[24px] rounded-[30px] w-[168px] shrink-0"
      style={{ backgroundImage: CTA_BG }}
    >
      <div className="relative shrink-0 size-[24px]">
        <img src={addIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
      </div>
      <p
        className="text-[14px] tracking-[-0.14px] bg-clip-text text-transparent"
        style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}
      >
        Add product
      </p>
    </button>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white border border-[#f7f7f7] rounded-[20px] w-full h-[777px] relative overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-[24px] items-center w-[429px]">
        <div className="flex flex-col items-center relative shrink-0 w-full">
          <div className="relative size-[200px]">
            <div className="absolute h-[140px] left-[23.57px] top-[16.07px] w-[153.208px]">
              <img src={emptyBg} alt="" className="absolute block inset-0 max-w-none size-full" />
            </div>
            <div className="absolute flex h-[162.27px] items-center justify-center left-[31.56px] top-[21.67px] w-[137.713px]">
              <div style={{ transform: 'rotate(-20.53deg)' }}>
                <div className="h-[137.487px] relative w-[95.564px]">
                  <img src={emptyIllustration} alt="" className="block max-w-none size-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[8px] items-center text-center w-full">
            <p className="text-[#101604] text-[20px]" style={jakarta(600)}>
              No product listed yet
            </p>
            <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
              New products will appear here as soon as you start listing.
            </p>
          </div>
        </div>
        <AddProductButton onClick={onAdd} />
      </div>
    </div>
  )
}

const HEAD =
  'h-[44px] px-[24px] text-left text-[#807e7e] text-[12px] leading-[15px] tracking-[-0.06px] whitespace-nowrap'

/**
 * Figma products 462:6490: title block, table card (1px #f7f7f7 frame, radius 20; columns
 * 403/230/181/124/154; header 44 + 1px #807e7e rule; rows 72 + 1px #f7f7f7) and the pager, or the
 * empty state (467:11522) when the store has nothing listed. Rows come from GET /v1/products/me.
 */
export default function Products() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data, error: loadError } = useGetMyProductsQuery()
  const [searchParams, setSearchParams] = useSearchParams()
  // The topbar search lands here with ?q=; it matches the name, SKU and category.
  const q = searchParams.get('q')?.trim().toLowerCase() ?? ''
  const items = useMemo(() => {
    if (!data) return null
    const sorted = [...data].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    return q ? sorted.filter((p) => [p.productName, p.sku, p.categoryId].some((v) => v?.toLowerCase().includes(q))) : sorted
  }, [data, q])
  const error = loadError ? describeError(loadError) : ''
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<ProductsToast | null>(
    () => (location.state as { toast?: ProductsToast } | null)?.toast ?? null,
  )

  useEffect(() => {
    if ((location.state as { toast?: ProductsToast } | null)?.toast)
      navigate(location.pathname, { replace: true, state: null })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount = Math.max(1, Math.ceil((items?.length ?? 0) / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = useMemo(() => (items ?? []).slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE), [items, current])

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  return (
    <DashboardLayout>
      <div className="relative px-[24px] pt-[40px] pb-[32px] flex flex-col gap-[24px]">
        {toast && <Toast title={toast.title} body={toast.body} onDone={() => setToast(null)} />}
        {q && (
          <p className="mt-[16px] text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
            Results for “{searchParams.get('q')}”{' '}
            <button type="button" onClick={() => setSearchParams({})} className="text-[#007c53]" style={jakarta(500)}>
              Clear
            </button>
          </p>
        )}

        {/* Page heading */}
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-[8px] max-w-[490px]">
            <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
              Products
            </h1>
            <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
              Accept orders and prepare them for pickup. We'll handle the rest.
            </p>
          </div>
          <AddProductButton onClick={() => navigate('/dashboard/products/add')} />
        </div>

        {error ? (
          <p role="alert" className="text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
            {error}
          </p>
        ) : items === null ? (
          <div className="bg-white border border-[#f7f7f7] rounded-[20px] w-full h-[777px]" aria-busy="true" />
        ) : items.length === 0 ? (
          <EmptyState onAdd={() => navigate('/dashboard/products/add')} />
        ) : (
          <div className="flex flex-col gap-[16px]">
            <div className="rounded-[20px] border border-[#f7f7f7] bg-white overflow-hidden">
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col />
                  <col style={{ width: 230 }} />
                  <col style={{ width: 181 }} />
                  <col style={{ width: 124 }} />
                  <col style={{ width: 154 }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-[#807e7e]">
                    <th className={HEAD} style={jakarta(600)}>
                      Product
                    </th>
                    <th className={HEAD} style={jakarta(600)}>
                      Sold as
                    </th>
                    <th className={HEAD} style={jakarta(600)}>
                      Price
                    </th>
                    <th className={HEAD} style={jakarta(600)}>
                      In Stock
                    </th>
                    <th className={`${HEAD} text-center`} style={jakarta(600)}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => {
                    const status = listingStatus(p)
                    const style = LISTING_STYLE[status]
                    const image = p.images?.find((i) => i.isPrimary)?.url ?? p.images?.[0]?.url ?? productThumb
                    const open = () => navigate(`/dashboard/products/${p.id}`)
                    return (
                      <tr
                        key={p.id}
                        onClick={open}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') open()
                        }}
                        tabIndex={0}
                        className="border-b border-[#f7f7f7] last:border-b-0 cursor-pointer hover:bg-[#fbfbfb] focus-visible:outline-2 focus-visible:outline-[#007c53] focus-visible:-outline-offset-2"
                      >
                        <td className="p-0">
                          <div className="h-[72px] px-[24px] flex items-center gap-[12px] min-w-0">
                            {/* Figma "Form Control": 20px, radius 3.33, 1.25px #d0d5dd */}
                            <input
                              type="checkbox"
                              checked={selected.has(p.id)}
                              onChange={() => toggle(p.id)}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Select ${p.productName ?? 'product'}`}
                              className="size-[20px] shrink-0 appearance-none rounded-[3.33px] border-[1.25px] border-[#d0d5dd] bg-white checked:bg-[#007c53] checked:border-[#007c53] cursor-pointer"
                            />
                            <span className="relative size-[40px] shrink-0 rounded-full overflow-hidden ring-[1.5px] ring-white bg-[#e4baca]">
                              <img src={image} alt="" className="size-full object-cover" />
                            </span>
                            <p className="text-[#101928] text-[14px] leading-[24px] truncate" style={jakarta(600)}>
                              {p.productName || 'Untitled product'}
                            </p>
                          </div>
                        </td>
                        <td className="p-0">
                          <div className="h-[72px] px-[24px] flex items-center">
                            <p className="text-[#101928] text-[14px] leading-[24px] truncate" style={jakarta(500)}>
                              {soldAsLabel(p)}
                            </p>
                          </div>
                        </td>
                        <td className="p-0">
                          <div className="h-[72px] px-[24px] flex items-center">
                            <p
                              className="text-[#101928] text-[14px] leading-[24px] whitespace-nowrap"
                              style={jakarta(400)}
                            >
                              {p.price ? naira(p.price) : '-'}
                            </p>
                          </div>
                        </td>
                        <td className="p-0">
                          <div className="h-[72px] px-[24px] flex items-center">
                            <p className="text-[#101928] text-[14px] leading-[24px]" style={jakarta(400)}>
                              {p.status === 'DRAFT' && p.availableQuantity == null ? '-' : (p.availableQuantity ?? 0)}
                            </p>
                          </div>
                        </td>
                        <td className="p-0">
                          <div className="h-[72px] flex items-center justify-center">
                            <span
                              className="inline-flex items-center justify-center rounded-[30px] px-[10px] py-[6px] text-[11px] leading-[14px] whitespace-nowrap"
                              style={{ ...jakarta(600), background: style.bg, color: style.color }}
                            >
                              {status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pager, as on the orders page */}
            <Pager page={current} pageCount={pageCount} onChange={setPage} />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
