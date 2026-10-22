import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ListingCard from '../../components/marketplace/ListingCard'
import EmptyBlock from '../../components/ui/EmptyBlock'
import { useAuth } from '../../feature/authentication/useAuth'
import { useSaved } from '../../lib/saved'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

/**
 * Saved products (857:33452): the 24/32 title with its 16/24 intro (507 wide, 8 apart), then the
 * marketplace's 354×502 cards straight on the page background, 16 apart sideways and 24 apart
 * down, each with Remove and Place order. The list lives in this browser until the API holds it;
 * the empty state follows the dashboard's other lists.
 */
export default function Saved() {
  const navigate = useNavigate()
  const { account } = useAuth()
  const saved = useSaved(account?.id)

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[24px] flex flex-col gap-[24px] md:min-h-full max-md:px-[16px] max-md:pt-[24px]">
        <div className="flex flex-col gap-[8px] w-[507px] max-lg:w-full">
          <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Saved products
          </h1>
          <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
            View, manage, and quickly order items you’ve bookmarked for later.
          </p>
        </div>

        {saved.list.length === 0 ? (
          <div className="bg-white rounded-[20px] p-[24px] flex flex-col md:flex-1 max-md:p-[16px]">
            <EmptyBlock
              className="justify-center md:flex-1 py-[40px] max-md:py-[24px]"
              title="Nothing saved yet"
              copy="Open a listing on the marketplace and choose Save Product; it will wait for you here, on this device."
              action={
                <Link to="/dashboard/marketplace" className="flex h-[48px] items-center justify-center rounded-[30px] px-[24px]" style={{ backgroundImage: CTA_BG }}>
                  <span className="bg-clip-text text-[14px] leading-[18px] text-transparent" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
                    Browse marketplace
                  </span>
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="grid grid-cols-3 gap-x-[16px] gap-y-[24px] max-xl:grid-cols-2 max-md:grid-cols-1">
            {saved.list.map((p) => (
              <ListingCard
                key={p.id}
                listing={{ id: p.id, title: p.title, price: p.price, unit: p.unit, description: p.description ?? '', image: p.image, location: p.location, soldAs: p.soldAs ?? '', listed: p.listed ?? '' }}
                secondary={{ label: 'Remove', onClick: () => saved.remove(p.id) }}
                primary={{ label: 'Place order', onClick: () => navigate(`/dashboard/marketplace/${p.id}?order=1`) }}
              />
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  )
}
