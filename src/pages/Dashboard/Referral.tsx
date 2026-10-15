import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Pager from '../../components/ui/Pager'
import DataTable from '../../components/ui/DataTable'
import banner from '../../assets/images/referral-banner.jpg'
import giftIcon from '../../assets/icons/ref-gift.svg'
import linkIcon from '../../assets/icons/ref-link.svg'
import copyIcon from '../../assets/icons/ref-copy.svg'
import exportIcon from '../../assets/icons/ref-export.svg'
import EmptyBlock from '../../components/ui/EmptyBlock'
import { useStore } from '../../feature/stores/useStore'
import { referralLink, referrals } from '../../data/referrals'
import { jakarta } from '../../utils/styles'

const PAGE_SIZE = 10

const ROLE_STYLE = {
  Buyer: { bg: 'rgba(138,88,255,0.1)', color: '#8a58ff' },
  Seller: { bg: 'rgba(0,124,83,0.05)', color: '#007c53' },
}


/**
 * Figma referral 599:19337: title, the photo banner with the link pill, copy and share buttons,
 * then Activities (490/283/319 columns) and the pager.
 */
export default function Referral() {
  const { store } = useStore()
  const [page, setPage] = useState(1)
  const [copied, setCopied] = useState(false)
  const link = referralLink(store?.storeName)
  const pageCount = Math.max(1, Math.ceil(referrals.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = referrals.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked */
    }
  }
  async function share() {
    const text = 'Join me on Earth, the marketplace for everything that is grown, mined and reared.'
    if (navigator.share) {
      try {
        await navigator.share({ text, url: link })
        return
      } catch {
        /* closed the sheet */
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`, '_blank', 'noopener')
  }

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[47px] pb-[24px] flex flex-col gap-[24px] max-md:px-[16px] max-md:pt-[24px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Refer family &amp; friends
          </h1>
          <p className="text-[#807e7e] text-[16px] leading-[24px] max-w-[620px]" style={jakarta(400)}>
            Share your link. Everyone who joins through it shows up here, from the day they join.
          </p>
        </div>

        {/* Banner (623:21036): 262 tall, radius 25, photo under a 50% #0c0b09 wash, copy at 24/40 */}
        <div
          className="relative h-[262px] rounded-[25px] overflow-hidden max-md:h-auto"
          style={{ backgroundImage: 'linear-gradient(100deg, #aee74a -20%, #007c53 84%)' }}
        >
          <img
            src={banner}
            alt=""
            className="absolute inset-0 size-full object-cover"
            style={{ objectPosition: '50% 40%' }}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(12,11,9,0.5)' }} />
          <div className="relative flex flex-col gap-[24px] px-[24px] pt-[40px] max-w-[591px] max-md:px-[16px] max-md:py-[24px]">
            <div className="flex flex-col gap-[16px]">
              <span
                className="inline-flex h-[32px] w-fit items-center gap-[8px] rounded-[30px] px-[12px]"
                style={{ background: 'rgba(64,68,56,0.5)' }}
              >
                <img src={giftIcon} alt="" className="size-[20px]" />
                <span className="text-white text-[14px] leading-[18px]" style={jakarta(500)}>
                  Your referral link
                </span>
              </span>
              <div className="flex flex-col gap-[8px]">
                <p className="text-white text-[24px] leading-[30px]" style={jakarta(700)}>
                  Invite family &amp; friends to Earth
                </p>
                <p className="text-[14px] leading-[24px]" style={{ ...jakarta(400), color: 'rgba(255,255,255,0.75)' }}>
                  Share it with anyone who would like to buy or sell on Earth.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-[16px] max-md:flex-col max-md:items-stretch max-md:gap-[12px]">
              <button
                type="button"
                onClick={copy}
                className="flex h-[48px] w-[399px] max-w-full items-center justify-between rounded-[30px] px-[16px] border max-md:w-full"
                style={{ background: 'rgba(64,68,56,0.5)', borderColor: 'rgba(248,246,241,0.4)' }}
                aria-label={copied ? 'Link copied' : 'Copy your referral link'}
              >
                <span className="flex items-center gap-[8px] min-w-0">
                  <img src={linkIcon} alt="" className="size-[24px] shrink-0" />
                  <span className="text-[#f7f7f7] text-[14px] leading-[18px] truncate" style={jakarta(500)}>
                    {copied ? 'Copied!' : link}
                  </span>
                </span>
                <img src={copyIcon} alt="" className="size-[24px] shrink-0" />
              </button>
              <button
                type="button"
                onClick={share}
                className="flex h-[48px] w-[128px] items-center justify-center gap-[8px] rounded-[30px] bg-[#aee74a] shrink-0 max-md:w-full"
              >
                <img src={exportIcon} alt="" className="size-[20px]" />
                <span className="text-[#0c2310] text-[14px] leading-[18px]" style={jakarta(500)}>
                  Share
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <h2 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Activities
          </h2>
          {referrals.length === 0 ? (
            <div className="bg-white border border-[#f7f7f7] rounded-[20px] flex items-center justify-center py-[64px] max-md:py-[40px]">
              <EmptyBlock
                title="No referrals yet"
                copy="Everyone who joins Earth through your link will appear here, from the day they join."
              />
            </div>
          ) : (
            <>
              <DataTable
                rows={rows}
                rowKey={(r) => r.email}
                columns={[
                  {
                    key: 'user',
                    header: 'User',
                    card: 'title',
                    cell: (r) => (
                      <div className="flex flex-col min-w-0">
                        <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(600)}>
                          {r.name}
                        </p>
                        <p className="text-[#807e7e] text-[14px] leading-[20px] truncate" style={jakarta(400)}>
                          {r.email}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: 'as',
                    header: 'Signed up as',
                    width: 283,
                    align: 'center',
                    card: 'badge',
                    cell: (r) => (
                      <span
                        className="inline-flex min-w-[74px] justify-center rounded-[30px] px-[10px] py-[6px] text-[11px] leading-[14px]"
                        style={{ ...jakarta(600), background: ROLE_STYLE[r.as].bg, color: ROLE_STYLE[r.as].color }}
                      >
                        {r.as}
                      </span>
                    ),
                  },
                  {
                    key: 'date',
                    header: 'Date',
                    width: 319,
                    align: 'right',
                    cell: (r) => (
                      <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(500)}>
                        {r.date}
                      </p>
                    ),
                  },
                ]}
              />
              <Pager page={current} pageCount={pageCount} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
