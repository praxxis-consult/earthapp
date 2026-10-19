import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import EmptyBlock from '../../components/ui/EmptyBlock'
import { useAuth } from '../../feature/authentication/useAuth'
import { useSaved } from '../../lib/saved'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

/**
 * The buyer's saved listings (the Saved products entry of the buyer menu, 806:7777). There is no
 * frame for the page, so it follows the dashboard's list pages: the 24/32 title and 16/24 intro,
 * then a card grid on the marketplace card's lines, or the shared empty block. The list lives in
 * this browser until the API holds it.
 */
export default function Saved() {
  const navigate = useNavigate()
  const { account } = useAuth()
  const saved = useSaved(account?.id)

  return (
    <DashboardLayout>
      {/* The page fills the dashboard viewport, as the orders page does: the panel reaches the bottom and its grid scrolls inside it */}
      <div className="px-[24px] pt-[40px] pb-[24px] flex flex-col gap-[24px] md:h-full max-md:px-[16px] max-md:pt-[24px]">
        <div className="flex flex-col gap-[8px] max-w-[600px]">
          <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Saved products
          </h1>
          <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
            Listings you want to come back to. They are kept on this device, so a listing saved here stays here.
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-[24px] flex flex-col md:flex-1 md:min-h-0 md:overflow-y-auto max-md:p-[16px]">
          {saved.list.length === 0 ? (
            <EmptyBlock
              className="justify-center md:flex-1 py-[40px] max-md:py-[24px]"
              title="Nothing saved yet"
              copy="Open a listing on the marketplace and choose Save for later; it will wait for you here."
              action={
                <Link to="/marketplace" className="flex h-[48px] items-center justify-center rounded-[30px] px-[24px]" style={{ backgroundImage: CTA_BG }}>
                  <span className="bg-clip-text text-[14px] leading-[18px] text-transparent" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
                    Browse marketplace
                  </span>
                </Link>
              }
            />
          ) : (
            <ul className="grid grid-cols-4 gap-[16px] max-xl:grid-cols-2 max-md:grid-cols-1">
              {saved.list.map((p) => (
                <li key={p.id} className="flex flex-col overflow-hidden rounded-[20px] shadow-[inset_0_0_0_1px_#f0f0f0]">
                  <button type="button" onClick={() => navigate(`/marketplace/${p.id}`)} className="h-[160px] w-full shrink-0 overflow-hidden bg-[#eee] text-left">
                    {p.image && <img src={p.image} alt="" className="size-full object-cover" />}
                  </button>
                  <div className="flex flex-col gap-[4px] p-[16px]">
                    <Link to={`/marketplace/${p.id}`} className="text-[#101604] text-[16px] leading-[24px] truncate" style={jakarta(600)}>
                      {p.title}
                    </Link>
                    <p className="text-[#807e7e] text-[12px] leading-[20px] truncate" style={jakarta(400)}>
                      {p.storeName} · {p.location}
                    </p>
                    <p className="text-[#007c53] text-[14px] leading-[24px]" style={jakarta(700)}>
                      {p.price}
                      <span className="text-[#807e7e] text-[12px]" style={jakarta(500)}>
                        {' '}
                        / {p.unit}
                      </span>
                    </p>
                    <div className="mt-[8px] flex items-center justify-between">
                      <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                        Saved {new Date(p.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <button type="button" onClick={() => saved.remove(p.id)} className="text-[#b13b3b] text-[12px] leading-[20px]" style={jakarta(500)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
