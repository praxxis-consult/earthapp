import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import exportIcon from '../../assets/icons/prod-export.svg'
import galleryAddIcon from '../../assets/icons/prod-gallery-add.svg'
import verifyIcon from '../../assets/icons/db-verify.svg'
import toggleIcon from '../../assets/icons/prod-toggle.svg'
import checkboxIcon from '../../assets/icons/prod-checkbox.svg'
import chevronDownIcon from '../../assets/icons/db-chevron-down.svg'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white flex flex-col gap-[16px] p-[20px] rounded-[20px] w-full">
      <div className="flex flex-col gap-[3px]">
        <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>{title}</p>
        {subtitle && <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>{subtitle}</p>}
      </div>
      <div className="bg-[#f7f7f7] h-px w-full" />
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px]" style={jakarta(500)}>{children}</p>
  )
}

function InputRow({ placeholder, right }: { placeholder: string; right?: React.ReactNode }) {
  return (
    <div className="bg-[#f7f7f7] flex h-[48px] items-center justify-between px-[16px] rounded-[30px] w-full">
      <p className="text-[#807e7e] text-[14px] leading-[24px] tracking-[-0.28px]" style={jakarta(400)}>{placeholder}</p>
      {right}
    </div>
  )
}

export default function AddProduct() {
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[48px]">
        {/* Header */}
        <div className="flex items-start justify-between w-full mb-[24px]">
          <div className="flex flex-col gap-[24px] max-w-[539px]">
            <button onClick={() => navigate(-1)} className="flex gap-[8px] items-center">
              <div className="flex items-center justify-center size-[16px]" style={{ transform: 'rotate(90deg)' }}>
                <img src={arrowDownIcon} alt="" className="size-[16px]" />
              </div>
              <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500)}>Back</p>
            </button>
            <div className="flex flex-col gap-[8px]">
              <p className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>Add product</p>
              <p className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
                Add accurate product details and photos so customers know exactly what they'll receive.
              </p>
            </div>
          </div>

          {/* Save draft + Publish */}
          <div className="flex items-center gap-[16px] pt-[8px]">
            <button className="bg-white flex h-[48px] items-center justify-center px-[28px] rounded-[30px] w-[168px]">
              <p className="text-[#101604] text-[14px] tracking-[-0.14px]" style={jakarta(500)}>Save draft</p>
            </button>
            <button
              className="flex h-[48px] items-center justify-center px-[24px] rounded-[30px] w-[168px]"
              style={{ backgroundImage: CTA_BG }}
            >
              <p className="text-[14px] tracking-[-0.14px] bg-clip-text text-transparent" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
                Publish
              </p>
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-[16px] items-start">
          {/* Left column: photos + product details + price */}
          <div className="flex flex-col gap-[16px] flex-1 min-w-0">

            {/* Product photos */}
            <div className="bg-white flex flex-col gap-[18px] p-[24px] rounded-[20px]">
              <div className="flex gap-[12px] items-center w-full">
                <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                  <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>Product photos</p>
                  <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                    Add up to 6 clear photos. The first photo will be your cover image.
                  </p>
                </div>
                <button className="flex gap-[7px] h-[38px] items-center justify-center px-[16px] rounded-[999px]">
                  <div className="relative shrink-0 size-[16px]">
                    <img src={exportIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                  </div>
                  <p className="text-[#007c53] text-[12px] whitespace-nowrap" style={jakarta(500)}>Upload photo</p>
                </button>
              </div>

              {/* Gallery grid */}
              <div className="h-[246px] relative w-full">
                {/* Large left placeholder (~74.5%) */}
                <div className="absolute bg-[#f7f7f7] inset-[0_25.5%_0_0] overflow-clip rounded-[20px] flex items-center justify-center">
                  <div className="relative size-[64px]">
                    <img src={galleryAddIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                  </div>
                </div>
                {/* Top-right */}
                <div className="absolute bg-[#f7f7f7] inset-[0_0_52.4%_76.5%] overflow-clip rounded-[20px] flex items-center justify-center">
                  <div className="relative size-[32px]">
                    <img src={galleryAddIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                  </div>
                </div>
                {/* Bottom-right */}
                <div className="absolute bg-[#f7f7f7] inset-[52.4%_0_0_76.5%] overflow-clip rounded-[20px] flex items-center justify-center">
                  <div className="relative size-[32px]">
                    <img src={galleryAddIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                  </div>
                </div>
              </div>

              <p className="text-[#807e7e] text-[11px]" style={jakarta(400)}>
                JPG or PNG · up to 10 MB each · 2 photos added
              </p>
            </div>

            {/* Product details */}
            <SectionCard
              title="Product details"
              subtitle="This information is shown to customers on the product page"
            >
              <div className="flex flex-col gap-[8px]">
                <FieldLabel>Product name</FieldLabel>
                <InputRow placeholder="Enter product name" />
                <p className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
                  Use a simple name customers can easily recognise
                </p>
              </div>
              <div className="flex flex-col gap-[8px]">
                <FieldLabel>Category</FieldLabel>
                <InputRow
                  placeholder="Select category"
                  right={
                    <div className="relative shrink-0 size-[24px]">
                      <img src={chevronDownIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                    </div>
                  }
                />
              </div>
              <div className="flex flex-col gap-[8px]">
                <FieldLabel>Product description</FieldLabel>
                <div className="bg-[#f7f7f7] flex h-[120px] items-start px-[16px] py-[8px] rounded-[15px] w-full">
                  <p className="text-[#807e7e] text-[14px] leading-[24px] tracking-[-0.28px] whitespace-nowrap" style={jakarta(400)}>
                    Start typing here
                  </p>
                </div>
                <p className="text-[#807e7e] text-[12px]" style={jakarta(400)}>500 characters</p>
              </div>
            </SectionCard>

            {/* Price & selling unit */}
            <SectionCard
              title="Price & selling unit"
              subtitle="Only you and your team can see this."
            >
              {/* Row 1: Price + Sold as */}
              <div className="flex gap-[16px] w-full">
                <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                  <FieldLabel>Price</FieldLabel>
                  <div className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center px-[16px] rounded-[30px] w-full">
                    <p className="text-[#807e7e] text-[14px] leading-[24px] tracking-[-0.28px] flex-1" style={jakarta(400)}>0</p>
                    <div className="flex gap-[4px] items-center">
                      <p className="text-[#101604] text-[12px] whitespace-nowrap" style={jakarta(600)}>NGN</p>
                      <div className="relative shrink-0 size-[24px]">
                        <img src={chevronDownIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                  <FieldLabel>Sold as</FieldLabel>
                  <InputRow placeholder="e. g. bag, basket, etc." />
                </div>
              </div>

              {/* Row 2: Approx weight + MOQ */}
              <div className="flex gap-[16px] w-full">
                <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                  <FieldLabel>Approx. weight per unit</FieldLabel>
                  <div className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center px-[16px] rounded-[30px] w-full">
                    <p className="text-[#807e7e] text-[14px] leading-[24px] tracking-[-0.28px] flex-1" style={jakarta(400)}>0</p>
                    <div className="flex gap-[4px] items-center">
                      <p className="text-[#101604] text-[12px] whitespace-nowrap" style={jakarta(600)}>Kg</p>
                      <div className="relative shrink-0 size-[24px]">
                        <img src={chevronDownIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                  <FieldLabel>MOQ</FieldLabel>
                  <div className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center px-[16px] rounded-[30px] w-full">
                    <p className="text-[#807e7e] text-[14px] leading-[24px] tracking-[-0.28px] flex-1" style={jakarta(400)}>0</p>
                    <div className="flex flex-col items-center w-[16px]">
                      {/* Up arrow */}
                      <div className="flex items-center justify-center w-full" style={{ transform: 'rotate(180deg)' }}>
                        <img src={arrowDownIcon} alt="" className="size-[16px]" />
                      </div>
                      {/* Down arrow */}
                      <img src={arrowDownIcon} alt="" className="size-[16px]" />
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Right column: checklist + inventory + pickup + seller info + actions */}
          <div className="flex flex-col gap-[16px] w-[400px] shrink-0">

            {/* Listing checklist */}
            <div className="bg-[#0c2310] flex flex-col gap-[24px] h-[196px] p-[20px] rounded-[20px] w-full">
              <div className="flex flex-col gap-[4px]">
                <p className="text-white text-[14px] leading-[20px]" style={jakarta(700)}>Listing checklist</p>
                <p className="text-[rgba(255,255,255,0.66)] text-[12px] leading-[20px]" style={jakarta(400)}>
                  All required details are complete.
                </p>
              </div>
              <div className="flex flex-col gap-[8px] w-full">
                {['Photos added', 'Product details complete', 'Price and stock set'].map((item) => (
                  <div key={item} className="flex gap-[8px] items-center w-full overflow-clip">
                    <div className="relative shrink-0 size-[24px]">
                      <img src={verifyIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                    </div>
                    <p className="text-white text-[12px] leading-[20px] flex-1 min-w-0" style={jakarta(400)}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory & availability */}
            <SectionCard
              title="Inventory & availability"
              subtitle="Control stock and customer visibility."
            >
              <div className="flex flex-col gap-[8px]">
                <FieldLabel>Available Quantity</FieldLabel>
                <div className="bg-[#f7f7f7] flex h-[48px] items-center justify-between px-[16px] rounded-[30px] w-full">
                  <p className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px]" style={jakarta(400)}>12 bags</p>
                  <div className="flex flex-col items-center w-[16px]">
                    <div className="flex items-center justify-center w-full" style={{ transform: 'rotate(180deg)' }}>
                      <img src={arrowDownIcon} alt="" className="size-[16px]" />
                    </div>
                    <img src={arrowDownIcon} alt="" className="size-[16px]" />
                  </div>
                </div>
              </div>
              <div className="flex gap-[12px] items-center w-full overflow-clip">
                <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                  <p className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>Available for sale</p>
                  <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                    Customers can find and order this product.
                  </p>
                </div>
                <div className="relative shrink-0 h-[24px] w-[42px]">
                  <img src={toggleIcon} alt="Toggle on" className="absolute block inset-0 max-w-none size-full" />
                </div>
              </div>
            </SectionCard>

            {/* Pickup details */}
            <SectionCard
              title="Pickup details"
              subtitle="Where and when orders are ready."
            >
              <div className="flex flex-col gap-[8px]">
                <FieldLabel>Pickup location</FieldLabel>
                <InputRow placeholder="Enter pickup location" />
                <div className="flex gap-[8px] items-start w-full">
                  <button className="relative shrink-0 size-[16px]">
                    <img src={checkboxIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                  </button>
                  <p className="text-[#101604] text-[12px]" style={jakarta(400)}>Same as business address</p>
                </div>
              </div>
              <div className="flex flex-col gap-[8px]">
                <FieldLabel>Pickup hours</FieldLabel>
                <InputRow
                  placeholder="Mon - Sat 8:00AM - 6:00PM"
                  right={
                    <div className="relative shrink-0 size-[24px]">
                      <img src={chevronDownIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                    </div>
                  }
                />
              </div>
            </SectionCard>

            {/* Seller-only information */}
            <SectionCard
              title="Seller-only information"
              subtitle="Only you and your team can see this."
            >
              <div className="flex flex-col gap-[8px]">
                <FieldLabel>SKU</FieldLabel>
                <InputRow placeholder="CAS-20KG-024" />
              </div>
              <div className="flex flex-col gap-[8px]">
                <FieldLabel>Note</FieldLabel>
                <InputRow placeholder="October harvest" />
              </div>
            </SectionCard>

            {/* Action buttons */}
            <button
              className="flex h-[48px] items-center justify-center px-[24px] rounded-[30px] w-full"
              style={{ backgroundImage: CTA_BG }}
            >
              <p className="text-[14px] tracking-[-0.14px] bg-clip-text text-transparent" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
                Publish listing
              </p>
            </button>
            <button className="bg-[#f5ebed] flex h-[48px] items-center justify-center px-[24px] rounded-[30px] w-full">
              <p className="text-[#d80027] text-[14px] tracking-[-0.14px]" style={jakarta(500)}>Delete</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
