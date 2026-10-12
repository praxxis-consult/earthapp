import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import addIcon from '../../assets/icons/db-add.svg'
import arrowLeftIcon from '../../assets/icons/mp-arrow-left.svg'
import arrowRightIcon from '../../assets/icons/mp-arrow-right.svg'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

// ─── Static sample data ──────────────────────────────────────────────────────
const PRODUCTS = [
  { id: '1', name: 'Freshly Harvested & Organic Tomatoes', category: 'Agriculture', status: 'Active',   price: '₦24,000.00', orderStatus: 'On sale' },
  { id: '2', name: 'Premium Grade Cassava Flour',          category: 'Agriculture', status: 'Active',   price: '₦8,500.00',  orderStatus: 'On sale' },
  { id: '3', name: 'Dried Hibiscus Flowers (Zobo)',        category: 'Agriculture', status: 'Inactive', price: '₦3,200.00',  orderStatus: 'Off sale' },
  { id: '4', name: 'Palm Oil — 25 Litre Drum',             category: 'Agriculture', status: 'Active',   price: '₦45,000.00', orderStatus: 'Out of stock' },
  { id: '5', name: 'Yam Tubers — Medium Grade',            category: 'Agriculture', status: 'Active',   price: '₦12,000.00', orderStatus: 'On sale' },
  { id: '6', name: 'Shea Butter (Raw Unrefined)',          category: 'Forestry',    status: 'Active',   price: '₦6,800.00',  orderStatus: 'On sale' },
  { id: '7', name: 'Groundnut (Shelled, 50 kg Bag)',       category: 'Agriculture', status: 'Active',   price: '₦18,500.00', orderStatus: 'On sale' },
  { id: '8', name: 'Fresh Plantain — Bunch',               category: 'Agriculture', status: 'Active',   price: '₦4,500.00',  orderStatus: 'Out of stock' },
  { id: '9', name: 'Timber — Iroko Plank (20mm)',          category: 'Forestry',    status: 'Inactive', price: '₦95,000.00', orderStatus: 'Off sale' },
  { id: '10',name: 'Soya Beans (50 kg Bag)',               category: 'Agriculture', status: 'Active',   price: '₦22,000.00', orderStatus: 'On sale' },
]

function OrderStatusChip({ status }: { status: string }) {
  let bg = '#f7f7f7'
  let color = '#101604'
  if (status === 'On sale')       { bg = 'rgba(0,124,83,0.08)'; color = '#007c53' }
  if (status === 'Off sale')      { bg = 'rgba(216,0,39,0.08)'; color = '#d80027' }
  if (status === 'Out of stock')  { bg = 'rgba(255,152,0,0.10)'; color = '#e65100' }

  return (
    <span
      className="inline-flex items-center justify-center px-[10px] py-[6px] rounded-[999px] text-[12px] whitespace-nowrap"
      style={{ ...jakarta(500), background: bg, color }}
    >
      {status}
    </span>
  )
}

export default function ProductsList() {
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[32px] flex flex-col gap-[16px]">
        {/* Heading row */}
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-[8px] max-w-[490px]">
            <p className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>Products</p>
            <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
              Accept orders and prepare them for pickup. We'll handle the rest.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/products/add')}
            className="flex gap-[8px] h-[48px] items-center justify-center px-[24px] rounded-[30px] shrink-0"
            style={{ backgroundImage: CTA_BG }}
          >
            <div className="relative shrink-0 size-[24px]">
              <img src={addIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
            </div>
            <p className="text-[14px] tracking-[-0.14px] bg-clip-text text-transparent" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
              Add product
            </p>
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white border border-[#f7f7f7] rounded-[20px] overflow-hidden">
          {/* Table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#f7f7f7]">
                <th className="text-left px-[16px] py-[14px] text-[#807e7e] text-[12px]" style={jakarta(500)}>Product name</th>
                <th className="text-left px-[16px] py-[14px] text-[#807e7e] text-[12px] w-[230px]" style={jakarta(500)}>Category</th>
                <th className="text-left px-[16px] py-[14px] text-[#807e7e] text-[12px] w-[181px]" style={jakarta(500)}>Status</th>
                <th className="text-left px-[16px] py-[14px] text-[#807e7e] text-[12px] w-[124px]" style={jakarta(500)}>Price</th>
                <th className="text-left px-[16px] py-[14px] text-[#807e7e] text-[12px] w-[154px]" style={jakarta(500)}>Order status</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/dashboard/products/${p.id}`)}
                  className="border-b border-[#f7f7f7] last:border-b-0 cursor-pointer hover:bg-[#f9f9f9] transition-colors"
                >
                  <td className="px-[16px] py-[20px] text-[#101604] text-[14px]" style={jakarta(500)}>
                    {p.name}
                  </td>
                  <td className="px-[16px] py-[20px] text-[#807e7e] text-[14px]" style={jakarta(400)}>
                    {p.category}
                  </td>
                  <td className="px-[16px] py-[20px]">
                    <span
                      className={`text-[13px] ${p.status === 'Active' ? 'text-[#007c53]' : 'text-[#807e7e]'}`}
                      style={jakarta(500)}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-[16px] py-[20px] text-[#101604] text-[14px]" style={jakarta(500)}>
                    {p.price}
                  </td>
                  <td className="px-[16px] py-[20px]">
                    <OrderStatusChip status={p.orderStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-[8px] px-[16px] py-[20px] border-t border-[#f7f7f7]">
            <button className="flex items-center justify-center size-[40px] rounded-full hover:bg-[#f7f7f7] transition-colors">
              <div className="relative shrink-0 size-[20px]">
                <img src={arrowLeftIcon} alt="Previous" className="absolute block inset-0 max-w-none size-full" />
              </div>
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`flex items-center justify-center size-[40px] rounded-full text-[13px] transition-colors ${
                  n === 1
                    ? 'bg-[#007c53] text-white'
                    : 'text-[#807e7e] hover:bg-[#f7f7f7]'
                }`}
                style={jakarta(500)}
              >
                {n}
              </button>
            ))}
            <span className="text-[#807e7e] text-[13px] px-[4px]" style={jakarta(400)}>...</span>
            <button className="flex items-center justify-center size-[40px] rounded-full text-[#807e7e] text-[13px] hover:bg-[#f7f7f7] transition-colors" style={jakarta(500)}>
              16
            </button>
            <button className="flex items-center justify-center size-[40px] rounded-full hover:bg-[#f7f7f7] transition-colors">
              <div className="relative shrink-0 size-[20px]">
                <img src={arrowRightIcon} alt="Next" className="absolute block inset-0 max-w-none size-full" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
