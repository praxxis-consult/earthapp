import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import BrowseControls from '../../components/marketplace/BrowseControls'
import ListingCard from '../../components/marketplace/ListingCard'
import Pager from '../../components/ui/Pager'
import Skeleton, { LoadingRegion } from '../../components/ui/Skeleton'
import { useBrowse } from '../../feature/marketplace/useBrowse'
import { soldAsLabel } from '../../lib/productView'
import searchIcon from '../../assets/icons/bm-search.svg'
import locationIcon from '../../assets/icons/bm-location.svg'
import sortIcon from '../../assets/icons/bm-sort.svg'
import arrowDown from '../../assets/icons/bm-arrow-down.svg'
import { jakarta } from '../../utils/styles'

/** The frame's grid (818:10584) is three rows of three 354×502 cards. */
const ITEMS_PER_PAGE = 9
const ICONS = { search: searchIcon, location: locationIcon, sort: sortIcon, arrowDown }

/**
 * The buyer's marketplace inside the dashboard (816:9128): the 24/32 title with its 16/24 intro
 * (490 wide, 8 apart), the white 1093×160 controls card (radius 20, 24 padding, rows 24 apart),
 * then 354×502 cards 16 apart sideways and 24 apart down, and the 74px pager card. The cards
 * and controls are the public marketplace's, on this frame's measurements.
 */
export default function BuyerMarketplace() {
  const navigate = useNavigate()
  const b = useBrowse(ITEMS_PER_PAGE)
  const { storeId, store, loading, listings, emptyText, failed } = b

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[24px] flex flex-col gap-[24px] max-md:px-[16px] max-md:pt-[24px]">
        {/* 817:9372: title and intro, 8 apart, 490 wide */}
        <div className="flex flex-col gap-[8px] w-[490px] max-lg:w-full">
          <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Marketplace
          </h1>
          {/* The frame's intro speaks of food, Lagos and riders; Earth lists every kind of produce and resource from stores
              across Nigeria, and the buyer picks a carrier, so the intro says that in the frame's shape. */}
          <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
            Produce and natural resources from verified stores. Pay online, choose your carrier, and follow your order to the door.
          </p>
        </div>

        {storeId && !loading && (
          <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
            {store ? (
              <>
                Showing listings from <span className="text-[#0c2310]" style={jakarta(600)}>{store.storeName}</span>, {store.businessAddress.area}, {store.businessAddress.region}.{' '}
              </>
            ) : (
              <>That store is not on the marketplace. </>
            )}
            <button type="button" onClick={b.showEveryStore} className="text-[#007c53]" style={jakarta(500)}>
              See every store
            </button>
          </p>
        )}

        {/* 817:9376: the controls card */}
        <div className="bg-white rounded-[20px] p-[24px] max-md:p-[16px]">
          <BrowseControls browse={b} icons={ICONS} />
        </div>

        {/* 818:10584: three 354×502 cards per row, 16 apart; rows 24 apart */}
        {loading ? (
          <LoadingRegion label="Loading listings" className="grid grid-cols-3 gap-x-[16px] gap-y-[24px] max-xl:grid-cols-2 max-md:grid-cols-1">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-[502px] rounded-[30px]" />
            ))}
          </LoadingRegion>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-[20px] flex items-center justify-center py-[64px] px-[24px]">
            <p role={failed ? 'alert' : undefined} className="text-center text-[#807e7e] text-[16px]" style={jakarta(400)}>
              {emptyText}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-3 gap-x-[16px] gap-y-[24px] max-xl:grid-cols-2 max-md:grid-cols-1">
            {listings.map((p) => (
              <ListingCard
                key={p.id}
                listing={{ id: p.id, title: p.title, price: p.price, unit: p.unit, description: p.description, image: p.image, location: p.location, soldAs: soldAsLabel({ soldAs: p.unit, approximateWeightGrams: p.weightGrams || undefined }), listed: p.listed }}
                secondary={{ label: 'View details', to: `/dashboard/marketplace/${p.id}` }}
                primary={{ label: 'Place order', onClick: () => navigate(`/dashboard/marketplace/${p.id}?order=1`) }}
              />
            ))}
          </ul>
        )}

        {/* 818:10556: the 74px pager card */}
        {b.pageCount > 1 && <Pager variant="card" page={b.page} pageCount={b.pageCount} onChange={b.setPage} />}
      </div>
    </DashboardLayout>
  )
}
