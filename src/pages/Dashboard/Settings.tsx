import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SuccessModal from '../../components/ui/SuccessModal'
import { ChangeBankDialog, EditPersonalDialog, EditStoreDialog } from '../../components/ui/SettingsDialogs'
import coverPhoto from '../../assets/images/store-cover.jpg'
import editIcon from '../../assets/icons/st-edit.svg'
import uploadIcon from '../../assets/icons/st-upload.svg'
import cameraIcon from '../../assets/icons/st-camera.svg'
import verifiedIcon from '../../assets/icons/st-verified.svg'
import bankIcon from '../../assets/icons/st-bank.svg'
import trashIcon from '../../assets/icons/st-trash.svg'
import checkIcon from '../../assets/icons/od-truck-fast.svg'
import exportIcon from '../../assets/icons/prod-export.svg'
import { useAuth } from '../../auth/useAuth'
import { describeError, stores, uploads, type Category } from '../../services/earthApi'
import { useStore } from '../../auth/useStore'
import { countryName } from '../../onboarding/draft'
import { initials } from '../../data/orders'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

type Tab = 'store' | 'personal' | 'payout' | 'notifications'
const TABS: { key: Tab; label: string }[] = [
  { key: 'store', label: 'Store details' },
  { key: 'personal', label: 'Personal details' },
  { key: 'payout', label: 'Payout account' },
  { key: 'notifications', label: 'Notifications' },
]

/** Settings the API has no field for yet live in the browser. */
const LOCAL_KEY = 'earth.settings'
interface Local {
  description: string
  opens: string
  closes: string
  cover: string
  /** When the payout account last changed; a second change inside 48 hours is held (689:8948). */
  bankChangedAt?: number
  personal?: { firstName: string; lastName: string; email: string; phoneNumber: string }
  notifications: Record<string, { email: boolean; whatsapp: boolean }>
}
const DEFAULT_LOCAL: Local = {
  description: '',
  opens: '09:00 AM',
  closes: '06:00 PM',
  cover: '',
  notifications: { orders: { email: true, whatsapp: true }, messages: { email: true, whatsapp: true }, earth: { email: true, whatsapp: false } },
}
const readLocal = (): Local => {
  try {
    return { ...DEFAULT_LOCAL, ...(JSON.parse(localStorage.getItem(LOCAL_KEY) ?? 'null') ?? {}) }
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
  return <section className={`bg-white rounded-[25px] p-[24px] ${className}`}>{children}</section>
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
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative h-[20px] w-[40px] rounded-[12.76px] transition-colors"
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
 * Store and payout details read and write the real onboarding profile; personal details come from
 * the account (no update endpoint yet); notifications, description, opening hours and the cover
 * photo have no API fields and stay on this device.
 */
export default function Settings() {
  const { account } = useAuth()
  const [tab, setTab] = useState<Tab>('store')
  const { store, setStore } = useStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [local, setLocal] = useState<Local>(readLocal)
  const [dialog, setDialog] = useState<'store' | 'personal' | 'bank' | null>(null)
  const [done, setDone] = useState<'store' | 'personal' | 'bank' | 'warning' | null>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let live = true
    stores.categories().then((c) => live && setCategories(c)).catch(() => {})
    return () => {
      live = false
    }
  }, [])

  const saveLocal = (patch: Partial<Local>) =>
    setLocal((l) => {
      const next = { ...l, ...patch }
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(next))
      } catch {
        /* storage blocked */
      }
      return next
    })

  const person = local.personal ?? (account ? { firstName: account.firstName, lastName: account.lastName, email: account.email, phoneNumber: account.phoneNumber } : null)
  const categoryNames = (store?.categoryIds ?? []).map((id) => categories.find((c) => c.id === id)?.name ?? id)
  const addr = store?.businessAddress

  async function pickCover(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploads.image(file, 'PRODUCT_IMAGE')
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
      <div className="relative px-[24px] pt-[42px] pb-[40px] flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-[8px] max-w-[380px]">
            <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
              Account settings
            </h1>
            <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
              How buyers see your store, and who can work on it.
            </p>
          </div>
          <div className="pt-[8px]">{headerAction}</div>
        </div>

        {/* Tabs (604:20487): pad 12/16, 12px Medium, the open one outlined #007c53 */}
        <div className="mt-[38px] flex items-center gap-[12px]" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className="h-[39px] px-[16px] rounded-[30px] text-[12px] leading-[15px] border"
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
              <div className="relative h-[409px] rounded-[20px] overflow-hidden bg-[#ededed]">
                <img src={local.cover || coverPhoto} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(20,20,20,0) 0%, rgba(20,20,20,0.6) 100%)' }} />
                <label
                  className="absolute right-[24px] bottom-[24px] flex h-[48px] items-center gap-[8px] rounded-[30px] px-[16px] cursor-pointer"
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
                <div className="flex gap-[16px]">
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
                <Field label="Description" value={local.description || 'Add a description so buyers know what you sell.'} />
                <div className="flex gap-[16px]">
                  <Field label="Country" value={addr ? countryName(addr.country) : ''} />
                  <Field label="Address" value={addr ? `${addr.street}, ${addr.area}, ${addr.region}` : ''} />
                </div>
                <div className="flex gap-[16px]">
                  <Field label="Landmark" value={addr?.landmark} />
                  <Field label="Opening hours" value={`${local.opens} to ${local.closes}`} />
                </div>
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
                  Store owner
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-[24px]">
              <div className="flex gap-[16px]">
                <Field label="First name" value={person.firstName} />
                <Field label="Last name" value={person.lastName} />
              </div>
              <div className="flex gap-[16px]">
                <Field label="Email address" value={person.email} />
                <Field label="Phone number" value={person.phoneNumber} />
              </div>
            </div>
            <div className="h-px w-full bg-[#f7f7f7]" />
            <div className="flex flex-col gap-[24px]">
              <h2 className="text-[#101604] text-[20px] leading-[25px]" style={jakarta(600)}>
                Verification
              </h2>
              <div className="flex flex-col gap-[16px]">
                {[
                  ['Identity', 'Checked against your identity document and selfie', store?.identity ? 'submitted' : 'missing'],
                  ['Bank account', 'Matches the information on your ID', store?.bank ? 'submitted' : 'missing'],
                  ['Business registration', 'Optional. Unlocks higher limits sooner.', 'upload'],
                ].map(([title, sub, state], i) => (
                  <div key={title}>
                    {i > 0 && <div className="h-px w-full bg-[#f7f7f7] mb-[16px]" />}
                    <div className="flex items-center justify-between py-[8px]">
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
                      ) : (
                        <span className="flex items-center gap-[4px] rounded-[30px] px-[8px] py-[4px] text-[14px] leading-[18px]" style={{ ...jakarta(500), background: 'rgba(0,124,83,0.05)', color: state === 'submitted' ? '#007c53' : '#a66608' }}>
                          {state === 'submitted' && <img src={verifiedIcon} alt="" className="size-[20px]" />}
                          {/* The API only reports UNVERIFIED today, so a submitted document reads "Submitted", never "Verified". */}
                          {state === 'submitted' ? 'Submitted' : 'Not provided'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-px w-full bg-[#f7f7f7]" />
            <div className="flex items-center justify-between py-[16px]">
              <div className="flex items-center gap-[12px]">
                <span className="flex size-[48px] items-center justify-center rounded-full bg-[#fdf2f4]">
                  <img src={trashIcon} alt="" className="size-[16px]" />
                </span>
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[#d80027] text-[16px] leading-[24px]" style={jakarta(600)}>
                    Delete account
                  </p>
                  <p className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                    Your store closes and comes off the marketplace. You must finish open orders first.
                  </p>
                </div>
              </div>
              <button type="button" disabled title="Account deletion is not available yet" className="rounded-[30px] px-[16px] py-[12px] text-[#d80027] text-[14px] leading-[18px] opacity-60 cursor-not-allowed" style={{ ...jakarta(500), background: 'rgba(216,0,39,0.05)' }}>
                Delete account
              </button>
            </div>
          </Card>
        )}

        {tab === 'payout' && (
          <Card className="mt-[24px] flex flex-col gap-[24px]">
            <div className="flex items-start justify-between">
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
                  {/* The API has no name check yet, so this never claims a match. */}
                  Name check pending
                </p>
              </div>
            )}
          </Card>
        )}

        {tab === 'notifications' && (
          <Card className="mt-[24px]">
            <div className="rounded-[20px] border border-[#f7f7f7] overflow-hidden">
              {/* Figma 649:26248: header 45 and rows 73 each including a 1px #f7f7f7 separator, so borders add to the cells */}
              <table className="w-full table-fixed border-separate border-spacing-0">
                <colgroup>
                  <col />
                  <col style={{ width: 244 }} />
                  <col style={{ width: 245 }} />
                </colgroup>
                <thead>
                  <tr>
                    {['Action', 'Email', 'Whatsapp'].map((h, i) => (
                      <th key={h} className={`h-[45px] px-[24px] border-b border-[#f7f7f7] text-[#807e7e] text-[12px] leading-[15px] ${i ? 'text-center' : 'text-left'}`} style={jakarta(600)}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['orders', 'Order updates', 'Paid, accepted, on the way, delivered'],
                    ['messages', 'New messages', 'When a buyer writes you'],
                    ['earth', 'Update from Earth', 'New stores, product updates, etc'],
                  ].map(([key, title, sub]) => (
                    <tr key={key}>
                      <td className="p-0 border-b border-[#f7f7f7]">
                        <div className="h-[72px] px-[24px] flex flex-col justify-center">
                          <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(600)}>
                            {title}
                          </p>
                          <p className="text-[#807e7e] text-[14px] leading-[20px]" style={jakarta(400)}>
                            {sub}
                          </p>
                        </div>
                      </td>
                      {(['email', 'whatsapp'] as const).map((ch) => (
                        <td key={ch} className="p-0 border-b border-[#f7f7f7]">
                          <div className="h-[72px] flex items-center justify-center">
                            <Toggle
                              on={local.notifications[key]?.[ch] ?? false}
                              label={`${title} by ${ch}`}
                              onChange={(v) => saveLocal({ notifications: { ...local.notifications, [key]: { ...local.notifications[key], [ch]: v } } })}
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
          extras={{ description: local.description, opens: local.opens, closes: local.closes }}
          onClose={() => setDialog(null)}
          onSaved={(s, extras) => {
            setStore(s)
            saveLocal(extras)
            setDialog(null)
            setDone('store')
          }}
        />
      )}
      {dialog === 'personal' && person && (
        <EditPersonalDialog
          initial={person}
          onClose={() => setDialog(null)}
          onSaved={(v) => {
            saveLocal({ personal: v })
            setDialog(null)
            setDone('personal')
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
              Your profile details have been saved on this device
              <br />
              until profile editing reaches the platform.
            </>
          }
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
