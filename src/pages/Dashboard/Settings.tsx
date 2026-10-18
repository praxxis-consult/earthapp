import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SuccessModal from '../../components/ui/SuccessModal'
import { ChangeBankDialog, EditPersonalDialog, EditStoreDialog } from '../../components/ui/SettingsDialogs'
import { to12h } from '../../lib/hours'
import DeliveryDialog from '../../components/ui/DeliveryDialog'
import { useGetShippingProfileQuery } from '../../feature/delivery/deliveryApiSlice'
import coverPhoto from '../../assets/images/store-cover.jpg'
import editIcon from '../../assets/icons/st-edit.svg'
import uploadIcon from '../../assets/icons/st-upload.svg'
import cameraIcon from '../../assets/icons/st-camera.svg'
import verifiedIcon from '../../assets/icons/st-verified.svg'
import bankIcon from '../../assets/icons/st-bank.svg'
import trashIcon from '../../assets/icons/st-trash.svg'
import checkIcon from '../../assets/icons/od-truck-fast.svg'
import exportIcon from '../../assets/icons/prod-export.svg'
import { useAuth } from '../../feature/authentication/useAuth'
import { useDeleteMeMutation, useGetNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } from '../../feature/authentication/authApiSlice'
import { describeError, type NotificationTopic, type OpeningHours } from '../../services/earthApi'
import { useGetCategoriesQuery } from '../../feature/stores/storesApiSlice'
import { useUploadImageMutation } from '../../feature/uploads/uploadsApiSlice'
import { useStore } from '../../feature/stores/useStore'
import { canSell } from '../../feature/authentication/role'
import { countryName } from '../../onboarding/draft'
import { initials } from '../../data/orders'
import { jakarta, CTA_BG, CTA_TEXT_BG, SCROLL_ROW } from '../../utils/styles'

type Tab = 'store' | 'personal' | 'payout' | 'notifications'
const TABS: { key: Tab; label: string }[] = [
  { key: 'store', label: 'Store details' },
  { key: 'personal', label: 'Personal details' },
  { key: 'payout', label: 'Payout account' },
  { key: 'notifications', label: 'Notifications' },
]
/** A buyer has no store and no payout account: only the person and their notification choices. */
const BUYER_TABS = TABS.filter((t) => t.key === 'personal' || t.key === 'notifications')

/** The cover photo has no API field yet and lives in the browser, under the account's own key so another sign-in never sees it. */
const localKey = (accountId: string) => `earth.settings.${accountId}`
interface Local {
  cover: string
  /** When the payout account last changed; a second change inside 48 hours is held (689:8948). */
  bankChangedAt?: number
}
const DEFAULT_LOCAL: Local = {
  cover: '',
}

/** The first interval of the first open day, in the design's 12-hour labels. */
const firstInterval = (h: OpeningHours | null | undefined) => {
  const i = h?.days?.[0]?.intervals?.[0]
  return i ? { opens: to12h(i.opens), closes: to12h(i.closes) } : null
}
const hoursLabel = (h: OpeningHours | null | undefined) => {
  const i = firstInterval(h)
  return i ? `${i.opens} to ${i.closes}` : 'Not set'
}

/** The notification table's rows (649:26248), each the API topic it switches. */
const TOPICS: { key: NotificationTopic; title: string; sub: string }[] = [
  { key: 'orderUpdates', title: 'Order updates', sub: 'Paid, accepted, on the way, delivered' },
  { key: 'chatMessages', title: 'New messages', sub: 'When a buyer writes you' },
  { key: 'marketing', title: 'Update from Earth', sub: 'New stores, product updates, etc' },
]
/** The API's channels are email and in-app; the frame's second column says WhatsApp, which the API does not send. */
const CHANNELS = [
  { key: 'email', label: 'Email' },
  { key: 'inApp', label: 'In-app' },
] as const
const readLocal = (accountId: string): Local => {
  try {
    return { ...DEFAULT_LOCAL, ...(JSON.parse(localStorage.getItem(localKey(accountId)) ?? 'null') ?? {}) }
  } catch {
    return DEFAULT_LOCAL
  }
}

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[8px] flex-1 min-w-0">
      <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
        {label}
      </p>
      {children ?? (
        <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(500)}>
          {value || '—'}
        </p>
      )}
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`bg-white rounded-[25px] p-[24px] max-md:p-[16px] ${className}`}>{children}</section>
}

function PrimaryButton({ label, onClick, icon = editIcon }: { label: string; onClick: () => void; icon?: string }) {
  return (
    <button type="button" onClick={onClick} className="flex h-[48px] items-center gap-[8px] rounded-[30px] px-[24px]" style={{ backgroundImage: CTA_BG }}>
      <img src={icon} alt="" className="size-[20px]" />
      <span className="text-[14px] leading-[18px] bg-clip-text text-transparent whitespace-nowrap" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
        {label}
      </span>
    </button>
  )
}

/** Figma "toggle button" (649:26934): 40×20 track, #007c53 on / #f7f7f7 off, 14px lime knob. */
function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className="relative h-[20px] w-[40px] rounded-[12.76px] transition-colors disabled:opacity-60"
      style={{ background: on ? '#007c53' : '#f7f7f7' }}
    >
      <span
        className="absolute top-[3px] size-[14px] rounded-full transition-transform"
        style={{ left: 3, transform: on ? 'translateX(20px)' : 'translateX(0)', background: on ? '#aee74a' : '#d0d5dd' }}
      />
    </button>
  )
}

/**
 * Figma "store settings" (604:20255 / 647:25081 / 649:25596 / 649:25922): one page, four tabs.
 * Store and payout details, the description and the opening hours read and write the onboarding
 * profile; personal details and the notification choices read and write the account; the cover
 * photo has no API field and stays on this device.
 */
export default function Settings() {
  const { account } = useAuth()
  const seller = canSell(account)
  const tabs = seller ? TABS : BUYER_TABS
  const [tab, setTab] = useState<Tab>(seller ? 'store' : 'personal')
  const { store, setStore } = useStore()
  const { data: categories = [] } = useGetCategoriesQuery()
  const [uploadImage] = useUploadImageMutation()
  const prefs = useGetNotificationPreferencesQuery(undefined, { skip: tab !== 'notifications' })
  const [updatePrefs] = useUpdateNotificationPreferencesMutation()
  const [local, setLocal] = useState<Local>(() => readLocal(account?.id ?? ''))
  const [dialog, setDialog] = useState<'store' | 'personal' | 'bank' | 'delivery' | null>(null)
  const [done, setDone] = useState<'store' | 'personal' | 'bank' | 'delivery' | 'warning' | 'delete' | null>(null)
  const [deleteMe, { isLoading: deleting }] = useDeleteMeMutation()
  const navigate = useNavigate()
  // The store's delivery setup (pickup contact and parcel); null until the seller sets it.
  const shipping = useGetShippingProfileQuery(store?.id ?? '', { skip: !store })
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const saveLocal = (patch: Partial<Local>) =>
    setLocal((l) => {
      const next = { ...l, ...patch }
      try {
        localStorage.setItem(localKey(account?.id ?? ''), JSON.stringify(next))
      } catch {
        /* storage blocked */
      }
      return next
    })

  const person = account ? { firstName: account.firstName, lastName: account.lastName, email: account.email, phoneNumber: account.phoneNumber ?? '' } : null
  const categoryNames = (store?.categoryIds ?? []).map((id) => categories.find((c) => c.id === id)?.name ?? id)
  const addr = store?.businessAddress

  async function pickCover(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadImage({ file, purpose: 'PRODUCT_IMAGE' }).unwrap()
      if (!url) throw new Error('The photo could not be stored. Try again.')
      saveLocal({ cover: url })
    } catch (e) {
      setError(describeError(e))
    } finally {
      setUploading(false)
    }
  }

  const headerAction =
    tab === 'store' ? (
      <PrimaryButton label="Edit store details" onClick={() => store && setDialog('store')} />
    ) : tab === 'personal' ? (
      <PrimaryButton label="Edit personal details" onClick={() => setDialog('personal')} />
    ) : null

  return (
    <DashboardLayout>
      <div className="relative px-[24px] pt-[42px] pb-[40px] flex flex-col max-md:px-[16px] max-md:pt-[24px]">
        <div className="flex items-start justify-between max-md:flex-col max-md:gap-[16px]">
          <div className="flex flex-col gap-[8px] max-w-[380px]">
            <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
              Account settings
            </h1>
            <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
              {seller ? 'How buyers see your store, and who can work on it.' : 'Your details, and how Earth reaches you.'}
            </p>
          </div>
          <div className="pt-[8px] max-md:pt-0">{headerAction}</div>
        </div>

        {/* Tabs (604:20487): pad 12/16, 12px Medium, the open one outlined #007c53 */}
        <div className={`mt-[38px] flex items-center gap-[12px] max-md:mt-[24px] ${SCROLL_ROW}`} role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className="h-[39px] px-[16px] rounded-[30px] text-[12px] leading-[15px] border whitespace-nowrap max-md:shrink-0"
              style={{ ...jakarta(500), color: tab === t.key ? '#007c53' : '#807e7e', borderColor: tab === t.key ? '#007c53' : 'transparent' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-[16px] text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
            {error}
          </p>
        )}

        {tab === 'store' && (
          <div className="mt-[24px] flex flex-col gap-[24px]">
            {/* Cover (639:24760): 409 tall, radius 20, photo under a dark wash, Upload image bottom right */}
            <Card>
              <div className="relative h-[409px] rounded-[20px] overflow-hidden bg-[#ededed] max-md:h-[220px]">
                <img src={local.cover || coverPhoto} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(20,20,20,0) 0%, rgba(20,20,20,0.6) 100%)' }} />
                <label
                  className="absolute right-[24px] bottom-[24px] flex h-[48px] items-center gap-[8px] rounded-[30px] px-[16px] cursor-pointer max-md:right-[16px] max-md:bottom-[16px]"
                  style={{ background: 'rgba(64,68,56,0.75)' }}
                >
                  <img src={uploadIcon} alt="" className="size-[20px]" />
                  <span className="text-white text-[14px] leading-[18px]" style={jakarta(500)}>
                    {uploading ? 'Uploading…' : 'Upload image'}
                  </span>
                  <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(e) => pickCover(e.target.files?.[0])} />
                </label>
              </div>
            </Card>
            {/* Figma 604:20255's details card is a fixed 354 with a two-line description; it never gets shorter */}
            <Card className="min-h-[354px]">
              <div className="flex flex-col gap-[24px]">
                <div className="flex gap-[16px] max-md:flex-col">
                  <Field label="Store name" value={store?.storeName} />
                  <Field label="What do you sell?">
                    <div className="flex flex-wrap items-center gap-[8px]">
                      {categoryNames.length ? (
                        categoryNames.map((n) => (
                          <span key={n} className="rounded-[30px] px-[10px] py-[5px] text-[#007c53] text-[11px] leading-[14px]" style={{ ...jakarta(500), background: 'rgba(0,124,83,0.05)' }}>
                            {n}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(500)}>
                          —
                        </span>
                      )}
                    </div>
                  </Field>
                </div>
                <Field label="Description" value={store?.description || 'Add a description so buyers know what you sell.'} />
                <div className="flex gap-[16px] max-md:flex-col">
                  <Field label="Country" value={addr ? countryName(addr.country) : ''} />
                  <Field label="Address" value={addr ? `${addr.street}, ${addr.area}, ${addr.region}` : ''} />
                </div>
                <div className="flex gap-[16px] max-md:flex-col">
                  <Field label="Landmark" value={addr?.landmark} />
                  <Field label="Opening hours" value={hoursLabel(store?.openingHours)} />
                </div>
              </div>
            </Card>
            {/* Delivery setup: no frame for it in the design file; the card follows the payout card (649:25596). */}
            <Card className="flex flex-col gap-[16px]">
              <div className="flex items-start justify-between gap-[16px] max-md:flex-col">
                <div className="flex items-center gap-[12px] min-w-0">
                  <span className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-[#f2f8f6]">
                    <img src={checkIcon} alt="" className="size-[20px]" />
                  </span>
                  <div className="flex flex-col gap-[4px] min-w-0">
                    <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(500)}>
                      {shipping.data ? 'Delivery is set up' : shipping.isLoading ? 'Delivery' : 'Delivery is not set up yet'}
                    </p>
                    <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                      {shipping.data
                        ? `Carriers collect from ${shipping.data.profile.pickup.area}, ${shipping.data.profile.pickup.region} · packages up to ${shipping.data.profile.parcel.maxWeightGrams / 1000} kg · ${shipping.data.profile.pickup.firstName} ${shipping.data.profile.pickup.lastName}, ${shipping.data.profile.pickup.phone}`
                        : shipping.error
                          ? describeError(shipping.error)
                          : 'Buyers cannot order until carriers know where to collect and what they carry.'}
                    </p>
                  </div>
                </div>
                <PrimaryButton label={shipping.data ? 'Edit delivery' : 'Set up delivery'} onClick={() => store && !shipping.isLoading && setDialog('delivery')} />
              </div>
            </Card>
          </div>
        )}

        {tab === 'personal' && person && (
          <Card className="mt-[24px] flex flex-col gap-[40px]">
            <div className="flex items-center gap-[24px]">
              <div className="relative">
                <span className="flex items-center justify-center size-[120px] rounded-full bg-[#f2f8f6] text-[#007c53] text-[40px] leading-[50px]" style={{ ...jakarta(700), boxShadow: 'inset 0 0 0 1.5px rgba(0,124,83,0.05)' }}>
                  {initials(`${person.firstName} ${person.lastName}`)}
                </span>
                <button type="button" aria-label="Change photo" title="Profile photos are coming soon" className="absolute right-0 bottom-0 flex size-[40px] items-center justify-center rounded-full bg-[#f7f7f7]">
                  <img src={cameraIcon} alt="" className="size-[16px]" />
                </button>
              </div>
              <div className="flex flex-col gap-[4px]">
                <p className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
                  {person.firstName} {person.lastName}
                </p>
                <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
                  {seller ? 'Store owner' : 'Buyer'}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-[24px]">
              <div className="flex gap-[16px] max-md:flex-col">
                <Field label="First name" value={person.firstName} />
                <Field label="Last name" value={person.lastName} />
              </div>
              <div className="flex gap-[16px] max-md:flex-col">
                <Field label="Email address" value={person.email} />
                <Field label="Phone number" value={person.phoneNumber} />
              </div>
            </div>
            {/* Verification is the seller's: identity, bank and registration belong to the store. */}
            {seller && (
              <>
            <div className="h-px w-full bg-[#f7f7f7]" />
            <div className="flex flex-col gap-[24px]">
              <h2 className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
                Verification
              </h2>
              <div className="flex flex-col gap-[16px]">
                {[
                  ['Identity', 'Checked against your identity document and selfie', store?.identity ? 'submitted' : 'missing', '/onboarding/verify-id'],
                  ['Bank account', 'Checked with your bank; your share is paid here', store?.bank ? 'submitted' : 'missing', '/onboarding/bank'],
                  ['Business registration', 'Optional. Unlocks higher limits sooner.', 'upload', ''],
                ].map(([title, sub, state, to], i) => (
                  <div key={title}>
                    {i > 0 && <div className="h-px w-full bg-[#f7f7f7] mb-[16px]" />}
                    <div className="flex items-center justify-between py-[8px] max-sm:flex-col max-sm:items-start max-sm:gap-[12px]">
                      <div className="flex items-center gap-[12px]">
                        <span className="flex size-[48px] items-center justify-center rounded-full bg-[#f2f8f6]">
                          <img src={checkIcon} alt="" className="size-[16px]" />
                        </span>
                        <div className="flex flex-col gap-[4px]">
                          <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(500)}>
                            {title}
                          </p>
                          <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                            {sub}
                          </p>
                        </div>
                      </div>
                      {state === 'upload' ? (
                        <button type="button" title="Document uploads are coming soon" className="flex items-center gap-[4px] rounded-[30px] px-[8px] py-[4px] text-[#007c53] text-[14px] leading-[18px]" style={jakarta(500)}>
                          <img src={exportIcon} alt="" className="size-[20px]" />
                          Upload document
                        </button>
                      ) : state === 'missing' ? (
                        /* The step lives in onboarding; it picks the draft up where it stopped. */
                        <button type="button" onClick={() => navigate(to)} className="flex items-center gap-[4px] rounded-[30px] px-[8px] py-[4px] text-[#007c53] text-[14px] leading-[18px]" style={jakarta(500)}>
                          <img src={exportIcon} alt="" className="size-[20px]" />
                          {title === 'Identity' ? 'Add your ID' : 'Add bank account'}
                        </button>
                      ) : (
                        <span className="flex items-center gap-[4px] rounded-[30px] px-[8px] py-[4px] text-[14px] leading-[18px]" style={{ ...jakarta(500), background: 'rgba(0,124,83,0.05)', color: '#007c53' }}>
                          <img src={verifiedIcon} alt="" className="size-[20px]" />
                          {/* The API only reports UNVERIFIED today, so a submitted document reads "Submitted", never "Verified". */}
                          Submitted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
              </>
            )}
            <div className="h-px w-full bg-[#f7f7f7]" />
            <div className="flex items-center justify-between py-[16px] max-sm:flex-col max-sm:items-start max-sm:gap-[12px]">
              <div className="flex items-center gap-[12px]">
                <span className="flex size-[48px] items-center justify-center rounded-full bg-[#fdf2f4]">
                  <img src={trashIcon} alt="" className="size-[16px]" />
                </span>
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[#d80027] text-[16px] leading-[24px]" style={jakarta(600)}>
                    Delete account
                  </p>
                  <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                    {seller ? 'Your store closes and comes off the marketplace. You must finish open orders first.' : 'Your account closes. Orders still on the way must be finished first.'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setDone('delete')} className="rounded-[30px] px-[16px] py-[12px] text-[#d80027] text-[14px] leading-[18px]" style={{ ...jakarta(500), background: 'rgba(216,0,39,0.05)' }}>
                Delete account
              </button>
            </div>
          </Card>
        )}

        {tab === 'payout' && (
          <Card className="mt-[24px] flex flex-col gap-[24px]">
            <div className="flex items-start justify-between max-md:flex-col max-md:gap-[16px]">
              <div className="flex items-center gap-[12px]">
                <span className="flex size-[48px] items-center justify-center rounded-full bg-[#f2f8f6]">
                  <img src={bankIcon} alt="" className="size-[20px]" />
                </span>
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(500)}>
                    {store?.bank?.bankName ?? 'No payout account yet'}
                  </p>
                  <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                    {store?.bank ? `${store.bank.accountNumber.slice(0, 3)}***${store.bank.accountNumber.slice(-4)} · ${store.bank.accountName}` : 'Add the account your share should go to.'}
                  </p>
                </div>
              </div>
              <PrimaryButton
                label="Change account"
                onClick={() => {
                  if (!store) return
                  const pending = local.bankChangedAt && Date.now() - local.bankChangedAt < 48 * 3600 * 1000
                  if (pending) setDone('warning')
                  else setDialog('bank')
                }}
              />
            </div>
            {store?.bank && (
              <div className="flex items-center gap-[4px]">
                <img src={verifiedIcon} alt="" className="size-[20px]" />
                <p className="text-[#007c53] text-[14px] leading-[18px]" style={jakarta(500)}>
                  Account checked with the bank
                </p>
              </div>
            )}
          </Card>
        )}

        {tab === 'notifications' && (
          <Card className="mt-[24px]">
            {prefs.error && (
              <p role="alert" className="mb-[16px] text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
                {describeError(prefs.error)}
              </p>
            )}
            <div className="rounded-[20px] border border-[#f7f7f7] overflow-hidden" aria-busy={prefs.isLoading}>
              {/* Figma 649:26248: header 45 and rows 73 each including a 1px #f7f7f7 separator, so borders add to the cells */}
              <table className="w-full table-fixed border-separate border-spacing-0">
                <colgroup>
                  <col />
                  {/* BUILDER: the frame's 244/245 columns; on a phone the two toggle columns narrow so the labels keep the room. */}
                  <col className="w-[244px] max-md:w-[80px]" />
                  <col className="w-[245px] max-md:w-[80px]" />
                </colgroup>
                <thead>
                  <tr>
                    {['Action', ...CHANNELS.map((c) => c.label)].map((h, i) => (
                      <th key={h} className={`h-[45px] px-[24px] border-b border-[#f7f7f7] text-[#807e7e] text-[12px] leading-[15px] max-md:px-[8px] ${i ? 'text-center' : 'text-left'}`} style={jakarta(600)}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...TOPICS, { key: 'security' as const, title: 'Security notices', sub: 'Sign-in codes and account changes; always on' }].map(({ key, title, sub }) => (
                    <tr key={key}>
                      <td className="p-0 border-b border-[#f7f7f7]">
                        <div className="h-[72px] px-[24px] flex flex-col justify-center max-md:h-auto max-md:min-h-[72px] max-md:px-[8px] max-md:py-[8px]">
                          <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(600)}>
                            {title}
                          </p>
                          <p className="text-[#807e7e] text-[14px] leading-[20px]" style={jakarta(400)}>
                            {sub}
                          </p>
                        </div>
                      </td>
                      {CHANNELS.map((ch) => (
                        <td key={ch.key} className="p-0 border-b border-[#f7f7f7]">
                          <div className="h-[72px] flex items-center justify-center">
                            {/* Off until the choices load, so a switch never shows a state the API did not report. */}
                            <Toggle
                              on={key === 'security' ? true : (prefs.data?.[key][ch.key] ?? false)}
                              disabled={key === 'security' || !prefs.data}
                              label={`${title} by ${ch.label.toLowerCase()}`}
                              onChange={(v) => key !== 'security' && updatePrefs({ [key]: { [ch.key]: v } })}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {dialog === 'store' && store && (
        <EditStoreDialog
          store={store}
          categories={categories}
          extras={{ description: store.description ?? '', opens: firstInterval(store.openingHours)?.opens ?? '09:00 AM', closes: firstInterval(store.openingHours)?.closes ?? '06:00 PM' }}
          onClose={() => setDialog(null)}
          onSaved={(s) => {
            setStore(s)
            setDialog(null)
            setDone('store')
          }}
        />
      )}
      {dialog === 'personal' && person && (
        <EditPersonalDialog
          initial={person}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null)
            setDone('personal')
          }}
        />
      )}
      {dialog === 'delivery' && store && (
        <DeliveryDialog
          store={store}
          current={shipping.data ?? null}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null)
            setDone('delivery')
          }}
        />
      )}
      {dialog === 'bank' && store && (
        <ChangeBankDialog
          store={store}
          onClose={() => setDialog(null)}
          onSaved={(s) => {
            setStore(s)
            setDialog(null)
            saveLocal({ bankChangedAt: Date.now() })
            setDone('bank')
          }}
        />
      )}
      {done === 'store' && (
        <SuccessModal
          title="Changes saved"
          body={
            <>
              Your store details have been saved and updated across
              <br />
              the platform.
            </>
          }
          primary={{ label: 'Proceed', onClick: () => setDone(null) }}
          onClose={() => setDone(null)}
        />
      )}
      {done === 'personal' && (
        <SuccessModal
          title="Changes saved"
          body={
            <>
              Your profile details have been saved and updated across
              <br />
              the platform.
            </>
          }
          primary={{ label: 'Proceed', onClick: () => setDone(null) }}
          onClose={() => setDone(null)}
        />
      )}
      {done === 'delivery' && (
        <SuccessModal
          title="Delivery set up"
          body="Carriers can now quote orders from your store, and buyers can place them."
          primary={{ label: 'Proceed', onClick: () => setDone(null) }}
          onClose={() => setDone(null)}
        />
      )}
      {done === 'bank' && (
        <SuccessModal
          title="Request Submitted"
          body="Your payout account change request has been submitted. Your new account will start receiving payments within 48 hours from now after verification."
          primary={{ label: 'Proceed', onClick: () => setDone(null) }}
          onClose={() => setDone(null)}
        />
      )}
      {done === 'delete' && (
        <SuccessModal
          icon="danger"
          destructive
          title="Delete your account?"
          body={`${seller ? 'Your store closes and comes off the marketplace, and you' : 'You'} are signed out at once. Records the law requires are kept; everything else is deleted.`}
          primary={{
            label: deleting ? 'Deleting…' : 'Yes, delete my account',
            onClick: async () => {
              try {
                await deleteMe().unwrap()
                navigate('/', { replace: true })
              } catch (e) {
                setDone(null)
                setError(describeError(e))
              }
            },
          }}
          secondary={{ label: 'No, keep it', onClick: () => setDone(null) }}
          onClose={() => setDone(null)}
        />
      )}
      {done === 'warning' && (
        <SuccessModal
          icon="warning"
          title="Verification pending"
          body="You already have a payout account update pending verification. Please wait until your current request is processed before submitting another change."
          primary={{ label: 'Okay, got it', onClick: () => setDone(null) }}
          onClose={() => setDone(null)}
        />
      )}
    </DashboardLayout>
  )
}
