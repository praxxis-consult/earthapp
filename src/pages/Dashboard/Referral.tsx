import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Pager from '../../components/ui/Pager'
import DataTable from '../../components/ui/DataTable'
import banner from '../../assets/images/referral-banner.jpg'
import giftIcon from '../../assets/icons/ref-gift.svg'
import linkIcon from '../../assets/icons/ref-link.svg'
import copyIcon from '../../assets/icons/ref-copy.svg'
import exportIcon from '../../assets/icons/ref-export.svg'
import { useAuth } from '../../feature/authentication/useAuth'
import { jakarta } from '../../utils/styles'

const PAGE_SIZE = 10

/** Figma referral 599:19337's Activities rows; local until the referrals API exists. */
const REFERRALS: { name: string; email: string; as: 'Buyer' | 'Seller'; date: string }[] = [
  ['Yemisi Adewale', 'aishaabdullahi85@yahoo.com', 'Buyer', 'Oct 25, 2023'],
  ['Onyeka Ibe', 'chinedueze79@gmail.com', 'Seller', 'Nov 30, 2023'],
  ['Ronke Ojo', 'emekanwosu77@gmail.com', 'Buyer', 'Jan 10, 2024'],
  ['Femi Olayemi', 'ogechiokafor88@yahoo.com', 'Buyer', 'Nov 1, 2023'],
  ['Morenike Adeyemi', 'tobiadeyemi99@gmail.com', 'Seller', 'Dec 1, 2023'],
  ['Kunle Adeyemi', 'chikaobi92@gmail.com', 'Buyer', 'Oct 10, 2023'],
  ['Olabisi Owolabi', 'fatimai123@yahoo.com', 'Buyer', 'Nov 5, 2023'],
  ['Sani Lawal', 'adaobiokoro87@yahoo.com', 'Seller', 'Dec 15, 2023'],
  ['Opeyemi Ogunbiyi', 'ngozionuoha80@yahoo.com', 'Buyer', 'Oct 15, 2023'],
  ['Khadija Abubakar', 'ibrahimsuleiman95@gmail.com', 'Buyer', 'Oct 5, 2023'],
  ['Tunde Bakare', 'tundeb@gmail.com', 'Seller', 'Sep 30, 2023'],
  ['Amaka Johnson', 'amakaj@yahoo.com', 'Buyer', 'Sep 22, 2023'],
].map(([name, email, as, date]) => ({ name, email, as: as as 'Buyer' | 'Seller', date }))

const ROLE_STYLE = {
  Buyer: { bg: 'rgba(138,88,255,0.1)', color: '#8a58ff' },
  Seller: { bg: 'rgba(0,124,83,0.05)', color: '#007c53' },
}


const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * Figma referral 599:19337: title, the photo banner with the link pill, copy and share buttons,
 * then Activities (490/283/319 columns) and the pager.
 */
export default function Referral() {
  const { account } = useAuth()
  const [page, setPage] = useState(1)
  const [copied, setCopied] = useState(false)
  const handle = slug(account ? `${account.firstName} ${account.lastName}` : 'akpolo-agro-mine')
  const link = `${window.location.origin}/r/${handle}`
  const pageCount = Math.max(1, Math.ceil(REFERRALS.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = REFERRALS.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

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
          <div className="relative flex flex-col gap-[24px] px-[24px] pt-[40px] max-w-[567px] max-md:px-[16px] max-md:py-[24px]">
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
                className="flex h-[48px] items-center gap-[8px] rounded-[30px] bg-[#aee74a] px-[24px] max-md:justify-center"
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
        </div>
      </div>
    </DashboardLayout>
  )
}
