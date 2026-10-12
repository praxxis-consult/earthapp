import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import trashIcon from '../../assets/icons/prod-trash.svg'
import editIcon from '../../assets/icons/prod-edit.svg'
import galleryAddIcon from '../../assets/icons/prod-gallery-add.svg'
import starIcon from '../../assets/icons/prod-star.svg'
import bagIcon from '../../assets/icons/prod-bag.svg'
import shopIcon from '../../assets/icons/db-products.svg'
import statusDotIcon from '../../assets/icons/prod-status-dot.svg'
import eyeIcon from '../../assets/icons/prod-eye.svg'
import locationIcon from '../../assets/icons/prod-location.svg'
import clockIcon from '../../assets/icons/prod-clock.svg'
import calendarIcon from '../../assets/icons/prod-calendar.svg'
import photo1 from '../../assets/images/prod-photo-1.png'
import photo2 from '../../assets/images/prod-photo-2.png'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between overflow-clip w-full">
      <p className="text-[#807e7e] text-[14px] leading-[24px] whitespace-nowrap" style={jakarta(400)}>{label}</p>
      <div>{children}</div>
    </div>
  )
}

function FulfillmentCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="border border-[#f7f7f7] flex gap-[12px] items-center p-[16px] rounded-[16px] w-full">
      <div className="bg-[#f2f8f6] flex items-center justify-center rounded-full shrink-0 size-[36px]">
        <div className="relative shrink-0 size-[16px]">
          <img src={icon} alt="" className="absolute block inset-0 max-w-none size-full" />
        </div>
      </div>
      <div className="flex flex-col gap-[2px] flex-1 min-w-0">
        <p className="text-[#807e7e] text-[11px]" style={jakarta(400)}>{label}</p>
        <p className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>{value}</p>
        {sub && <p className="text-[#807e7e] text-[11px]" style={jakarta(400)}>{sub}</p>}
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[40px] flex flex-col gap-[24px]">

        {/* Back + title row */}
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-[24px] max-w-[490px]">
            <button
              onClick={() => navigate(-1)}
              className="flex gap-[8px] items-center"
            >
              <div className="flex items-center justify-center size-[16px]" style={{ transform: 'rotate(90deg)' }}>
                <img src={arrowDownIcon} alt="" className="size-[16px]" />
              </div>
              <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500)}>Back</p>
            </button>
            <p className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>Product Details</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-[16px] pt-[8px]">
            <button className="bg-[#f5ebed] flex gap-[8px] h-[48px] items-center justify-center px-[28px] rounded-[30px] w-[168px]">
              <div className="relative shrink-0 size-[20px]">
                <img src={trashIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
              </div>
              <p className="text-[#d80027] text-[14px] tracking-[-0.14px] whitespace-nowrap" style={jakarta(500)}>Delete</p>
            </button>
            <button
              onClick={() => navigate('/dashboard/products/add')}
              className="flex gap-[8px] h-[48px] items-center justify-center px-[24px] rounded-[30px] w-[168px]"
              style={{ backgroundImage: CTA_BG }}
            >
              <div className="relative shrink-0 size-[20px]">
                <img src={editIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
              </div>
              <p className="text-[14px] tracking-[-0.14px] bg-clip-text text-transparent" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
                Edit product
              </p>
            </button>
          </div>
        </div>

        {/* Photo + info card */}
        <div className="bg-white flex items-center justify-between p-[24px] rounded-[20px] w-full overflow-hidden">
          {/* Photo gallery */}
          <div className="h-[390px] relative shrink-0 w-[515px]">
            {/* Main large photo (left ~68%) */}
            <div className="absolute bg-[#ededed] inset-[0_31.72%_0_0] overflow-clip rounded-[15px]">
              <img src={photo1} alt="Product" className="absolute inset-0 max-w-none object-cover size-full" />
            </div>
            {/* Top-right photo */}
            <div className="absolute bg-[#ededed] inset-[0_0.26%_51.03%_69.83%] overflow-clip rounded-[15px]">
              <img src={photo2} alt="Product" className="absolute inset-0 max-w-none object-cover size-full" />
            </div>
            {/* Bottom-right gallery-add placeholder */}
            <div className="absolute bg-[#f7f7f7] inset-[51.03%_0.26%_0_69.83%] overflow-clip rounded-[15px] flex items-center justify-center">
              <div className="relative size-[40px]">
                <img src={galleryAddIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-[24px] items-start w-[514px]">
            {/* Category badge */}
            <div className="bg-[#aee74a] flex items-center justify-center overflow-clip px-[12px] py-[6px] rounded-[999px]">
              <p className="text-[#101604] text-[12px] leading-[20px] whitespace-nowrap" style={jakarta(600)}>Agriculture</p>
            </div>

            <div className="flex flex-col gap-[16px] w-full">
              {/* Name */}
              <p className="text-[#101604] text-[24px] leading-[32px] tracking-[-0.48px]" style={jakarta(600)}>
                Freshly Harvested &amp; Organic Tomatoes
              </p>

              {/* Description */}
              <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(500)}>
                Fresh, naturally grown tomatoes harvested at peak ripeness. Firm, flavourful and ideal for stews, sauces and everyday cooking{'   '}
                <span className="text-[#007c53]">Show more</span>
              </p>

              {/* Divider */}
              <div className="bg-[#f7f7f7] h-px w-full" />

              <div className="flex flex-col gap-[24px] w-full">
                {/* Price section */}
                <div className="flex flex-col gap-[8px]">
                  <div className="flex flex-col gap-[8px]">
                    <p className="text-[#807e7e] text-[11px] whitespace-nowrap" style={jakarta(500)}>Price per basket</p>
                    <div className="flex gap-[16px] items-center">
                      <p className="text-[#0c2310] text-[28px]" style={jakarta(700)}>₦24,000.00</p>
                      <div className="bg-[rgba(0,124,83,0.05)] flex items-center overflow-clip px-[8px] py-[5px] rounded-[999px]">
                        <p className="text-[#007c53] text-[11px] whitespace-nowrap" style={jakarta(500)}>8 baskets available</p>
                      </div>
                    </div>
                  </div>
                  {/* Rating */}
                  <div className="flex gap-[8px] items-center">
                    <div className="flex gap-[4px] items-center">
                      <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>4.5</p>
                      <div className="relative shrink-0 size-[16px]">
                        <img src={starIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                      </div>
                    </div>
                    <p className="text-[#007c53] text-[14px] leading-[24px]" style={jakarta(600)}>View reviews</p>
                  </div>
                </div>

                {/* Product facts */}
                <div className="flex flex-col gap-[16px] w-full">
                  {/* Selling unit */}
                  <div className="flex gap-[12px] items-center w-full overflow-clip">
                    <div className="bg-[#f2f8f6] flex items-center justify-center rounded-full shrink-0 size-[36px]">
                      <div className="relative shrink-0 size-[16px]">
                        <img src={bagIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                      <p className="text-[#807e7e] text-[13px]" style={jakarta(400)}>Selling unit</p>
                      <p className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>Basket - up to 25 kg</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex gap-[12px] items-center w-full overflow-clip">
                    <div className="bg-[#f2f8f6] flex items-center justify-center rounded-full shrink-0 size-[36px]">
                      <div className="relative shrink-0 size-[16px]">
                        <img src={shopIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                      <p className="text-[#807e7e] text-[13px]" style={jakarta(400)}>Customer visibility/Status</p>
                      <p className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>On Sale</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom two cards */}
        <div className="flex gap-[16px] w-full">
          {/* Inventory & Visibility */}
          <div className="bg-white flex flex-col gap-[16px] p-[20px] rounded-[20px] flex-1 overflow-hidden">
            <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>Inventory &amp; Visibility</p>
            <div className="bg-[#f7f7f7] h-px w-full" />

            <div className="flex flex-col gap-[24px] w-full">
              <div className="flex flex-col gap-[16px] w-full">
                <DetailRow label="Listing status">
                  <div className="flex gap-[6px] items-center">
                    <div className="relative shrink-0 size-[7px]">
                      <img src={statusDotIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                    </div>
                    <p className="text-[#007c53] text-[16px] leading-[24px] whitespace-nowrap" style={jakarta(600)}>On sale</p>
                  </div>
                </DetailRow>
                <DetailRow label="Customer visibility">
                  <div className="flex gap-[6px] items-center">
                    <div className="relative shrink-0 size-[7px]">
                      <img src={statusDotIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                    </div>
                    <p className="text-[#007c53] text-[16px] leading-[24px] whitespace-nowrap" style={jakarta(600)}>Available</p>
                  </div>
                </DetailRow>
                <DetailRow label="Quantity in stock">
                  <p className="text-[#101604] text-[16px] leading-[24px] whitespace-nowrap" style={jakarta(600)}>8 baskets</p>
                </DetailRow>
                <DetailRow label="Track quantity">
                  <div className="flex gap-[6px] items-center">
                    <div className="relative shrink-0 size-[7px]">
                      <img src={statusDotIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                    </div>
                    <p className="text-[#007c53] text-[16px] leading-[24px] whitespace-nowrap" style={jakarta(600)}>On</p>
                  </div>
                </DetailRow>
              </div>

              {/* Seller-only info footer */}
              <div className="flex gap-[12px] items-center py-[16px] rounded-[16px] w-full">
                <div className="flex flex-1 gap-[12px] items-center min-w-0">
                  <div className="bg-[#f2f8f6] flex items-center justify-center rounded-full shrink-0 size-[40px]">
                    <div className="relative shrink-0 size-[16px]">
                      <img src={eyeIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                    <p className="text-[#101604] text-[14px]" style={jakarta(500)}>Seller-only information</p>
                    <p className="text-[#807e7e] text-[11px] leading-[20px]" style={jakarta(400)}>
                      These settings are only visible to you and your store team.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-[2px] items-end shrink-0 whitespace-nowrap">
                  <p className="text-[#807e7e] text-[11px] leading-[20px]" style={jakarta(400)}>Last updated</p>
                  <p className="text-[#101604] text-[12px] leading-[20px]" style={jakarta(600)}>Today at 10:24 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup & Availability */}
          <div className="bg-white flex flex-col gap-[16px] p-[20px] rounded-[20px] flex-1 overflow-hidden">
            <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>Pickup &amp; Availability</p>
            <div className="bg-[#f7f7f7] h-px w-full" />

            <div className="flex flex-col gap-[12px] w-full">
              <FulfillmentCard
                icon={locationIcon}
                label="Pickup location"
                value="Akpolo Agro & Mine · Okitipupa, Ondo"
              />
              <FulfillmentCard
                icon={clockIcon}
                label="Preparation time"
                value="Ready within 2 hours"
              />
              <FulfillmentCard
                icon={calendarIcon}
                label="Pickup hours"
                value="Monday–Saturday"
                sub="8:00 AM–6:00 PM"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
