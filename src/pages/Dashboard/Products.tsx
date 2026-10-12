import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import emptyBg from '../../assets/icons/db-empty-bg.svg'
import emptyIllustration from '../../assets/icons/db-empty-illustration.svg'
import addIcon from '../../assets/icons/db-add.svg'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

export default function Products() {
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[32px] flex flex-col gap-[16px]">
        {/* Page heading */}
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

        {/* Empty state card */}
        <div className="bg-white border border-[#f7f7f7] rounded-[20px] w-full h-[777px] relative overflow-hidden">
          {/* Centred empty state */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-[24px] items-center w-[429px]">
            {/* Illustration */}
            <div className="flex flex-col items-center relative shrink-0 w-full">
              <div className="relative size-[200px]">
                {/* Background blob */}
                <div className="absolute h-[140px] left-[23.57px] top-[16.07px] w-[153.208px]">
                  <img src={emptyBg} alt="" className="absolute block inset-0 max-w-none size-full" />
                </div>
                {/* Rotated illustration */}
                <div className="absolute flex h-[162.27px] items-center justify-center left-[31.56px] top-[21.67px] w-[137.713px]">
                  <div style={{ transform: 'rotate(-20.53deg)' }}>
                    <div className="h-[137.487px] relative w-[95.564px]">
                      <img src={emptyIllustration} alt="" className="block max-w-none size-full" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Text */}
              <div className="flex flex-col gap-[8px] items-center text-center w-full">
                <p className="text-[#101604] text-[20px]" style={jakarta(600)}>No product listed yet</p>
                <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                  New products will appear here as soon as you start listing.
                </p>
              </div>
            </div>

            {/* Add product button */}
            <button
              onClick={() => navigate('/dashboard/products/add')}
              className="flex gap-[8px] h-[48px] items-center justify-center px-[24px] rounded-[30px] w-[168px]"
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
        </div>
      </div>
    </DashboardLayout>
  )
}
