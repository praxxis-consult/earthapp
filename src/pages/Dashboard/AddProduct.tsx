import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SuccessModal from '../../components/ui/SuccessModal'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import exportIcon from '../../assets/icons/prod-export.svg'
import galleryAddIcon from '../../assets/icons/prod-gallery-add.svg'
import verifyIcon from '../../assets/icons/db-verify.svg'
import chevronDownIcon from '../../assets/icons/db-chevron-down.svg'
import { describeError, type Category, type Product, type ProductInput, toApiError } from '../../services/earthApi'
import { useGetMyProductsQuery, useSaveProductMutation } from '../../feature/products/productsApiSlice'
import { useGetCategoriesQuery } from '../../feature/stores/storesApiSlice'
import { useStore } from '../../feature/stores/useStore'
import { useUploadImageMutation } from '../../feature/uploads/uploadsApiSlice'
import { PICKUP_PRESETS, pickupPresetLabel } from '../../lib/productView'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

const MAX_PHOTOS = 6
const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // the API's limit; the design says 10 MB
const DESCRIPTION_MAX = 500

interface Form {
  images: { url: string; isPrimary: boolean }[]
  productName: string
  categoryId: string
  description: string
  price: string
  soldAs: string
  weightKg: string
  moq: string
  availableQuantity: string
  availableForSale: boolean
  pickupSameAsBusiness: boolean
  pickup: { region: string; area: string; street: string; landmark: string }
  pickupHoursLabel: string
  note: string
}

const EMPTY: Form = {
  images: [],
  productName: '',
  categoryId: '',
  description: '',
  price: '',
  soldAs: '',
  weightKg: '',
  moq: '1',
  availableQuantity: '',
  availableForSale: true,
  pickupSameAsBusiness: true,
  pickup: { region: '', area: '', street: '', landmark: '' },
  pickupHoursLabel: PICKUP_PRESETS[0].label,
  note: '',
}

function fromProduct(p: Product): Form {
  const custom = p.pickupLocation?.type === 'CUSTOM' ? p.pickupLocation.address : null
  return {
    images: p.images ?? [],
    productName: p.productName ?? '',
    categoryId: p.categoryId ?? '',
    description: p.description ?? '',
    price: p.price ?? '',
    soldAs: p.soldAs ?? '',
    weightKg: p.approximateWeightGrams ? String(p.approximateWeightGrams / 1000) : '',
    moq: p.moq ? String(p.moq) : '1',
    availableQuantity: p.availableQuantity != null ? String(p.availableQuantity) : '',
    availableForSale: p.status === 'PUBLISHED',
    pickupSameAsBusiness: !custom,
    pickup: custom
      ? { region: custom.region, area: custom.area, street: custom.street, landmark: custom.landmark }
      : EMPTY.pickup,
    pickupHoursLabel: pickupPresetLabel(p.pickupHours) || PICKUP_PRESETS[0].label,
    note: p.note ?? '',
  }
}

const FIELD_LABEL: Record<string, string> = {
  productName: 'Product name',
  categoryId: 'Category',
  description: 'Product description',
  price: 'Price',
  soldAs: 'Sold as',
  approximateWeightGrams: 'Approx. weight per unit',
  moq: 'MOQ',
  images: 'Product photos',
  availableQuantity: 'Available quantity',
  pickupLocation: 'Pickup location',
  pickupHours: 'Pickup hours',
  note: 'Note',
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white flex flex-col gap-[16px] p-[20px] rounded-[20px] w-full">
      <div className="flex flex-col gap-[3px]">
        <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="bg-[#f7f7f7] h-px w-full" />
      {children}
    </div>
  )
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px]"
      style={jakarta(500)}
    >
      {children}
    </label>
  )
}

const inputClass =
  'bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] text-[14px] leading-[24px] tracking-[-0.28px] text-[#101604] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e]'

function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <div className="flex flex-col items-center w-[16px] shrink-0">
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(value + 1)}
        className="flex items-center justify-center w-full"
        style={{ transform: 'rotate(180deg)' }}
      >
        <img src={arrowDownIcon} alt="" className="size-[16px]" />
      </button>
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex items-center justify-center w-full"
      >
        <img src={arrowDownIcon} alt="" className="size-[16px]" />
      </button>
    </div>
  )
}

/**
 * Figma products 471:14969 (add) and 476:17917 (edit): the same two-column form. Save draft keeps
 * the listing private; Publish asks the API to list it. In edit mode the buttons become Discard
 * changes / Save changes and the listing keeps its status.
 */
function ProductForm({ original, categories, storeCountry }: { original: Product | null; categories: Category[]; storeCountry: string }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const editing = Boolean(id)
  const [form, setForm] = useState<Form>(() => (original ? fromProduct(original) : EMPTY))
  const [saveProduct] = useSaveProductMutation()
  const [uploadImage] = useUploadImageMutation()
  const [catOpen, setCatOpen] = useState(false)
  const [hoursOpen, setHoursOpen] = useState(false)
  const [busy, setBusy] = useState<'' | 'draft' | 'publish' | 'upload'>('')
  const [error, setError] = useState('')
  const [published, setPublished] = useState<{ id: string; edited: boolean } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const fileInput = useRef<HTMLInputElement>(null)
  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }))

  const category = categories.find((c) => c.id === form.categoryId)
  const checklist = useMemo(
    () => ({
      photos: form.images.length > 0,
      details: Boolean(form.productName.trim() && form.categoryId && form.description.trim()),
      price: Number(form.price) > 0 && form.availableQuantity !== '' && Boolean(form.soldAs.trim()),
    }),
    [form],
  )
  const allComplete = checklist.photos && checklist.details && checklist.price

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return
    const room = MAX_PHOTOS - form.images.length
    const chosen = Array.from(files).slice(0, room)
    if (!chosen.length) return setError(`You can add up to ${MAX_PHOTOS} photos.`)
    setBusy('upload')
    setError('')
    try {
      for (const file of chosen) {
        if (!/^image\/(jpeg|png)$/.test(file.type)) throw new Error('Use JPG or PNG photos.')
        if (file.size > MAX_PHOTO_BYTES) throw new Error('Each photo must be under 5 MB.')
        const { url } = await uploadImage({ file, purpose: 'PRODUCT_IMAGE' }).unwrap()
        setForm((f) => ({ ...f, images: [...f.images, { url, isPrimary: f.images.length === 0 }] }))
      }
    } catch (e) {
      setError(describeError(e))
    } finally {
      setBusy('')
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  function removePhoto(i: number) {
    setForm((f) => {
      const images = f.images.filter((_, j) => j !== i).map((img, j) => ({ ...img, isPrimary: j === 0 }))
      return { ...f, images }
    })
  }

  function toInput(status: 'DRAFT' | 'PUBLISHED'): ProductInput {
    const grams = form.weightKg ? Math.round(Number(form.weightKg) * 1000) : undefined
    const preset = PICKUP_PRESETS.find((p) => p.label === form.pickupHoursLabel) ?? PICKUP_PRESETS[0]
    const input: ProductInput = {
      status,
      expectedVersion: original?.version ?? 0,
      ...(original ? { id: original.id } : {}),
      ...(form.productName.trim() ? { productName: form.productName.trim().slice(0, 160) } : {}),
      ...(form.categoryId ? { categoryId: form.categoryId } : {}),
      ...(form.description.trim() ? { description: form.description.trim().slice(0, 5000) } : {}),
      ...(form.price ? { price: String(Number(form.price)), currency: 'NGN' } : {}),
      ...(form.soldAs.trim() ? { soldAs: form.soldAs.trim().slice(0, 40) } : {}),
      ...(grams && grams > 0 ? { approximateWeightGrams: grams } : {}),
      ...(form.moq && Number(form.moq) > 0 ? { moq: Math.round(Number(form.moq)) } : {}),
      ...(form.images.length ? { images: form.images } : {}),
      ...(form.availableQuantity !== ''
        ? { availableQuantity: Math.max(0, Math.round(Number(form.availableQuantity))) }
        : {}),
      pickupLocation: form.pickupSameAsBusiness
        ? { type: 'BUSINESS' }
        : {
            type: 'CUSTOM',
            address: { country: storeCountry, ...form.pickup, landmark: form.pickup.landmark || 'Not provided' },
          },
      pickupHours: preset.hours,
      ...(form.note.trim() ? { note: form.note.trim().slice(0, 2000) } : {}),
    }
    return input
  }

  async function save(status: 'DRAFT' | 'PUBLISHED') {
    setFieldErrors({})
    setError('')
    if (status === 'PUBLISHED') {
      const missing: Record<string, string> = {}
      if (!form.productName.trim()) missing.productName = 'Enter a product name.'
      if (!form.categoryId) missing.categoryId = 'Choose a category.'
      if (!form.description.trim()) missing.description = 'Describe the product.'
      if (!(Number(form.price) > 0)) missing.price = 'Enter a price.'
      if (!form.soldAs.trim()) missing.soldAs = 'Say how it is sold.'
      if (!form.images.length) missing.images = 'Add at least one photo.'
      if (form.availableQuantity === '') missing.availableQuantity = 'Enter the quantity available.'
      if (!form.pickupSameAsBusiness && !(form.pickup.region && form.pickup.area && form.pickup.street))
        missing.pickupLocation = 'Enter the pickup address.'
      if (Object.keys(missing).length) {
        setFieldErrors(missing)
        setError('Fill in the highlighted details before publishing.')
        return
      }
    }
    setBusy(status === 'DRAFT' ? 'draft' : 'publish')
    try {
      // "Available for sale" off keeps a published listing out of the marketplace: it is saved as a draft.
      const effective = status === 'PUBLISHED' && !form.availableForSale ? 'DRAFT' : status
      const saved = await saveProduct(toInput(effective)).unwrap()
      if (effective === 'PUBLISHED') {
        // Figma 476:16104 / 687:7412: a modal, not a toast, once the listing is live.
        setPublished({ id: saved.id, edited: editing })
        return
      }
      const toast = { title: 'Draft saved successfully', body: 'You can complete this listing anytime from your product list.' }
      navigate('/dashboard/products', { state: { toast } })
    } catch (err) {
      const e = toApiError(err)
      if (e.status === 400 && e.errors.length) {
        const fe: Record<string, string> = {}
        for (const err of e.errors) {
          const key = (err.path ?? '').split('.')[0]
          fe[key] = `${FIELD_LABEL[key] ?? key}: ${err.code ?? 'invalid'}`
        }
        setFieldErrors(fe)
        setError('The API could not accept some of these details. Check the highlighted fields.')
      } else if (e.status === 403) {
        setError('Publishing needs a live store. Finish your store setup first.')
      } else setError(describeError(e))
    } finally {
      setBusy('')
    }
  }

  const err = (k: string) =>
    fieldErrors[k] ? (
      <p className="text-[#b13b3b] text-[12px] leading-[20px]" style={jakarta(400)}>
        {fieldErrors[k]}
      </p>
    ) : null

  const title = editing ? 'Edit product' : 'Add product'
  const subtitle = editing
    ? 'Make sure the updated details is accurate before you submit.'
    : "Add accurate product details and photos so customers know exactly what they'll receive."

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[48px] max-md:px-[16px] max-md:pt-[24px]">
        {/* Header */}
        <div className="flex items-start justify-between w-full mb-[24px] max-md:flex-col max-md:gap-[16px]">
          <div className="flex flex-col gap-[24px] max-w-[539px]">
            <button type="button" onClick={() => navigate(-1)} className="flex gap-[8px] items-center">
              <div className="flex items-center justify-center size-[16px]" style={{ transform: 'rotate(90deg)' }}>
                <img src={arrowDownIcon} alt="" className="size-[16px]" />
              </div>
              <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(500)}>
                Back
              </p>
            </button>
            <div className="flex flex-col gap-[8px]">
              <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
                {title}
              </h1>
              <p className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
                {subtitle}
              </p>
            </div>
          </div>

          {/* Save draft + Publish, or Discard + Save changes */}
          <div className="flex items-center gap-[16px] pt-[8px] max-md:w-full max-md:pt-0 max-md:gap-[12px]">
            {editing ? (
              <button
                type="button"
                onClick={() => original && setForm(fromProduct(original))}
                className="bg-white flex h-[48px] items-center justify-center px-[28px] rounded-[30px] w-[168px] max-md:w-auto max-md:flex-1 max-md:px-[16px]"
              >
                <p className="text-[#101604] text-[14px] tracking-[-0.14px] whitespace-nowrap" style={jakarta(500)}>
                  Discard changes
                </p>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => save('DRAFT')}
                disabled={busy !== ''}
                className="bg-white flex h-[48px] items-center justify-center px-[28px] rounded-[30px] w-[168px] disabled:opacity-60 max-md:w-auto max-md:flex-1 max-md:px-[16px]"
              >
                <p className="text-[#101604] text-[14px] tracking-[-0.14px] whitespace-nowrap" style={jakarta(500)}>
                  {busy === 'draft' ? 'Saving…' : 'Save draft'}
                </p>
              </button>
            )}
            <button
              type="button"
              onClick={() => save(editing ? (original?.status ?? 'DRAFT') : 'PUBLISHED')}
              disabled={busy !== ''}
              className="flex h-[48px] items-center justify-center px-[24px] rounded-[30px] w-[168px] disabled:opacity-60 max-md:w-auto max-md:flex-1 max-md:px-[16px]"
              style={{ backgroundImage: CTA_BG }}
            >
              <p
                className="text-[14px] tracking-[-0.14px] bg-clip-text text-transparent whitespace-nowrap"
                style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}
              >
                {busy === 'publish' ? 'Saving…' : editing ? 'Save changes' : 'Publish'}
              </p>
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="mb-[16px] text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
            {error}
          </p>
        )}

        {/* Two-column layout; one column below lg, the checklist and inventory cards after the form */}
        <div className="flex gap-[16px] items-start max-xl:flex-col">
          {/* Left column: photos + product details + price */}
          <div className="flex flex-col gap-[16px] flex-1 min-w-0 max-xl:flex-none max-xl:w-full">
            {/* Product photos */}
            <div className="bg-white flex flex-col gap-[18px] p-[24px] rounded-[20px] max-md:p-[16px]">
              <div className="flex gap-[12px] items-center w-full max-sm:flex-wrap">
                <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                  <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(600)}>
                    Product photos
                  </p>
                  <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                    Add up to 6 clear photos. The first photo will be your cover image.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={busy === 'upload' || form.images.length >= MAX_PHOTOS}
                  className="flex gap-[7px] h-[38px] items-center justify-center px-[16px] rounded-[999px] disabled:opacity-60"
                >
                  <div className="relative shrink-0 size-[16px]">
                    <img src={exportIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                  </div>
                  <p className="text-[#007c53] text-[12px] whitespace-nowrap" style={jakarta(500)}>
                    {busy === 'upload' ? 'Uploading…' : 'Upload photo'}
                  </p>
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  className="sr-only"
                  onChange={(e) => addPhotos(e.target.files)}
                />
              </div>

              {/* Gallery grid: cover left (~74.5%), two slots right */}
              <div className="h-[246px] relative w-full">
                {[0, 1, 2].map((slot) => {
                  const pos =
                    slot === 0
                      ? 'inset-[0_25.5%_0_0]'
                      : slot === 1
                        ? 'inset-[0_0_52.4%_76.5%]'
                        : 'inset-[52.4%_0_0_76.5%]'
                  const img = form.images[slot]
                  return (
                    <div
                      key={slot}
                      className={`absolute ${pos} bg-[#f7f7f7] overflow-clip rounded-[20px] flex items-center justify-center`}
                    >
                      {img ? (
                        <>
                          <img src={img.url} alt="" className="absolute inset-0 size-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(slot)}
                            aria-label="Remove photo"
                            className="absolute right-[8px] top-[8px] size-[28px] rounded-full bg-white/90 text-[#101604] text-[16px] leading-none"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInput.current?.click()}
                          aria-label="Add photo"
                          className="relative"
                          style={{ width: slot === 0 ? 64 : 32, height: slot === 0 ? 64 : 32 }}
                        >
                          <img src={galleryAddIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              {form.images.length > 3 && (
                <div className="flex gap-[8px]">
                  {form.images.slice(3).map((img, i) => (
                    <div key={img.url} className="relative size-[64px] rounded-[12px] overflow-hidden bg-[#f7f7f7]">
                      <img src={img.url} alt="" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i + 3)}
                        aria-label="Remove photo"
                        className="absolute right-[4px] top-[4px] size-[20px] rounded-full bg-white/90 text-[#101604] text-[12px] leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[#807e7e] text-[11px]" style={jakarta(400)}>
                JPG or PNG · up to 5 MB each · {form.images.length} photo{form.images.length === 1 ? '' : 's'} added
              </p>
              {err('images')}
            </div>

            {/* Product details */}
            <SectionCard title="Product details" subtitle="This information is shown to customers on the product page">
              <div className="flex flex-col gap-[8px]">
                <FieldLabel htmlFor="product-name">Product name</FieldLabel>
                <input
                  id="product-name"
                  value={form.productName}
                  maxLength={160}
                  onChange={(e) => set({ productName: e.target.value })}
                  placeholder="Enter product name"
                  className={inputClass}
                  style={jakarta(400)}
                />
                {err('productName')}
                <p className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
                  Use a simple name customers can easily recognise
                </p>
              </div>
              <div className="flex flex-col gap-[8px] relative">
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <button
                  id="category"
                  type="button"
                  onClick={() => setCatOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={catOpen}
                  className="bg-[#f7f7f7] flex h-[48px] items-center justify-between px-[16px] rounded-[30px] w-full"
                >
                  <span
                    className="text-[14px] leading-[24px] tracking-[-0.28px]"
                    style={{ ...jakarta(400), color: category ? '#101604' : '#807e7e' }}
                  >
                    {category?.name ?? 'Select category'}
                  </span>
                  <div className="relative shrink-0 size-[24px]">
                    <img src={chevronDownIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                  </div>
                </button>
                {catOpen && (
                  <ul
                    role="listbox"
                    className="absolute left-0 right-0 top-[84px] z-20 bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] overflow-y-auto max-h-[240px] py-[4px]"
                  >
                    {categories.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={c.id === form.categoryId}
                          onClick={() => {
                            set({ categoryId: c.id })
                            setCatOpen(false)
                          }}
                          className="w-full text-left px-[16px] py-[12px] text-[14px] leading-[24px] hover:bg-[#f7f7f7]"
                          style={{ ...jakarta(400), color: c.id === form.categoryId ? '#007c53' : '#101604' }}
                        >
                          {c.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {err('categoryId')}
              </div>
              <div className="flex flex-col gap-[8px]">
                <FieldLabel htmlFor="description">Product description</FieldLabel>
                <textarea
                  id="description"
                  value={form.description}
                  maxLength={DESCRIPTION_MAX}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder="Start typing here"
                  className="bg-[#f7f7f7] h-[120px] w-full rounded-[15px] px-[16px] py-[8px] text-[14px] leading-[24px] tracking-[-0.28px] text-[#101604] outline-none border border-transparent focus:border-[#007c53] resize-none placeholder:text-[#807e7e]"
                  style={jakarta(400)}
                />
                {err('description')}
                <p className="text-[#807e7e] text-[12px]" style={jakarta(400)}>
                  {DESCRIPTION_MAX - form.description.length} characters
                </p>
              </div>
            </SectionCard>

            {/* Price & selling unit */}
            <SectionCard title="Price & selling unit" subtitle="Only you and your team can see this.">
              <div className="flex gap-[16px] w-full max-sm:flex-col">
                <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                  <FieldLabel htmlFor="price">Price</FieldLabel>
                  <div className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center px-[16px] rounded-[30px] w-full">
                    <input
                      id="price"
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      value={form.price}
                      onChange={(e) => set({ price: e.target.value })}
                      placeholder="0"
                      className="flex-1 min-w-0 bg-transparent text-[14px] leading-[24px] tracking-[-0.28px] text-[#101604] outline-none placeholder:text-[#807e7e]"
                      style={jakarta(400)}
                    />
                    <div className="flex gap-[4px] items-center">
                      <p className="text-[#101604] text-[12px] whitespace-nowrap" style={jakarta(600)}>
                        NGN
                      </p>
                      <div className="relative shrink-0 size-[24px]">
                        <img src={chevronDownIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                      </div>
                    </div>
                  </div>
                  {err('price')}
                </div>
                <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                  <FieldLabel htmlFor="sold-as">Sold as</FieldLabel>
                  <input
                    id="sold-as"
                    value={form.soldAs}
                    maxLength={40}
                    onChange={(e) => set({ soldAs: e.target.value })}
                    placeholder="e. g. bag, basket, etc."
                    className={inputClass}
                    style={jakarta(400)}
                  />
                  {err('soldAs')}
                </div>
              </div>

              <div className="flex gap-[16px] w-full max-sm:flex-col">
                <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                  <FieldLabel htmlFor="weight">Approx. weight per unit</FieldLabel>
                  <div className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center px-[16px] rounded-[30px] w-full">
                    <input
                      id="weight"
                      type="number"
                      min={0}
                      step="0.1"
                      inputMode="decimal"
                      value={form.weightKg}
                      onChange={(e) => set({ weightKg: e.target.value })}
                      placeholder="0"
                      className="flex-1 min-w-0 bg-transparent text-[14px] leading-[24px] tracking-[-0.28px] text-[#101604] outline-none placeholder:text-[#807e7e]"
                      style={jakarta(400)}
                    />
                    <div className="flex gap-[4px] items-center">
                      <p className="text-[#101604] text-[12px] whitespace-nowrap" style={jakarta(600)}>
                        Kg
                      </p>
                      <div className="relative shrink-0 size-[24px]">
                        <img src={chevronDownIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                      </div>
                    </div>
                  </div>
                  {err('approximateWeightGrams')}
                </div>
                <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                  <FieldLabel htmlFor="moq">MOQ</FieldLabel>
                  <div className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center px-[16px] rounded-[30px] w-full">
                    <input
                      id="moq"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={form.moq}
                      onChange={(e) => set({ moq: e.target.value })}
                      placeholder="0"
                      className="flex-1 min-w-0 bg-transparent text-[14px] leading-[24px] tracking-[-0.28px] text-[#101604] outline-none placeholder:text-[#807e7e]"
                      style={jakarta(400)}
                    />
                    <Stepper value={Number(form.moq) || 0} min={1} onChange={(n) => set({ moq: String(n) })} />
                  </div>
                  {err('moq')}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Right column: checklist + inventory + pickup + seller info + actions */}
          <div className="flex flex-col gap-[16px] w-[400px] shrink-0 max-xl:w-full">
            {/* Listing checklist */}
            <div className="bg-[#0c2310] flex flex-col gap-[24px] h-[196px] p-[20px] rounded-[20px] w-full">
              <div className="flex flex-col gap-[4px]">
                <p className="text-white text-[14px] leading-[20px]" style={jakarta(700)}>
                  Listing checklist
                </p>
                <p className="text-[rgba(255,255,255,0.66)] text-[12px] leading-[20px]" style={jakarta(400)}>
                  {allComplete ? 'All required details are complete.' : 'Complete these to publish the listing.'}
                </p>
              </div>
              <div className="flex flex-col gap-[8px] w-full">
                {[
                  ['Photos added', checklist.photos],
                  ['Product details complete', checklist.details],
                  ['Price and stock set', checklist.price],
                ].map(([item, done]) => (
                  <div key={String(item)} className="flex gap-[8px] items-center w-full overflow-clip">
                    <div className="relative shrink-0 size-[24px]" style={{ opacity: done ? 1 : 0.3 }}>
                      <img
                        src={verifyIcon}
                        alt={done ? 'Done' : 'To do'}
                        className="absolute block inset-0 max-w-none size-full"
                      />
                    </div>
                    <p className="text-white text-[12px] leading-[20px] flex-1 min-w-0" style={jakarta(400)}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory & availability */}
            <SectionCard title="Inventory & availability" subtitle="Control stock and customer visibility.">
              <div className="flex flex-col gap-[8px]">
                <FieldLabel htmlFor="quantity">Available Quantity</FieldLabel>
                <div className="bg-[#f7f7f7] flex h-[48px] items-center justify-between gap-[8px] px-[16px] rounded-[30px] w-full">
                  <input
                    id="quantity"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={form.availableQuantity}
                    onChange={(e) => set({ availableQuantity: e.target.value })}
                    placeholder={form.soldAs ? `e.g. 12 ${form.soldAs}s` : 'e.g. 12'}
                    className="flex-1 min-w-0 bg-transparent text-[14px] leading-[24px] tracking-[-0.28px] text-[#101604] outline-none placeholder:text-[#807e7e]"
                    style={jakarta(400)}
                  />
                  <Stepper
                    value={Number(form.availableQuantity) || 0}
                    onChange={(n) => set({ availableQuantity: String(n) })}
                  />
                </div>
                {err('availableQuantity')}
              </div>
              <div className="flex gap-[12px] items-center w-full overflow-clip">
                <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                  <p className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>
                    Available for sale
                  </p>
                  <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                    Customers can find and order this product.
                  </p>
                </div>
                {/* 42×24 switch (prod-toggle.svg's geometry), live */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.availableForSale}
                  onClick={() => set({ availableForSale: !form.availableForSale })}
                  className="relative shrink-0 h-[24px] w-[42px] rounded-full transition-colors"
                  style={{ background: form.availableForSale ? '#007c53' : '#d0d5dd' }}
                >
                  <span
                    className="absolute top-[2px] size-[20px] rounded-full bg-white transition-transform"
                    style={{ left: 2, transform: form.availableForSale ? 'translateX(18px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            </SectionCard>

            {/* Pickup details */}
            <SectionCard title="Pickup details" subtitle="Where and when orders are ready.">
              <div className="flex flex-col gap-[8px]">
                <FieldLabel htmlFor="pickup-street">Pickup location</FieldLabel>
                {form.pickupSameAsBusiness ? (
                  <div className="bg-[#f7f7f7] flex h-[48px] items-center px-[16px] rounded-[30px] w-full">
                    <p
                      className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] truncate"
                      style={jakarta(400)}
                    >
                      Your business address
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-[8px]">
                    <input
                      id="pickup-street"
                      value={form.pickup.street}
                      onChange={(e) => set({ pickup: { ...form.pickup, street: e.target.value } })}
                      placeholder="Enter pickup location"
                      className={inputClass}
                      style={jakarta(400)}
                    />
                    <div className="flex gap-[8px]">
                      <input
                        aria-label="Area"
                        value={form.pickup.area}
                        onChange={(e) => set({ pickup: { ...form.pickup, area: e.target.value } })}
                        placeholder="Area"
                        className={inputClass}
                        style={jakarta(400)}
                      />
                      <input
                        aria-label="Region or state"
                        value={form.pickup.region}
                        onChange={(e) => set({ pickup: { ...form.pickup, region: e.target.value } })}
                        placeholder="Region/State"
                        className={inputClass}
                        style={jakarta(400)}
                      />
                    </div>
                    <input
                      aria-label="Landmark"
                      value={form.pickup.landmark}
                      onChange={(e) => set({ pickup: { ...form.pickup, landmark: e.target.value } })}
                      placeholder="Landmark (optional)"
                      className={inputClass}
                      style={jakarta(400)}
                    />
                  </div>
                )}
                {err('pickupLocation')}
                <label className="flex gap-[8px] items-start w-full cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.pickupSameAsBusiness}
                    onChange={(e) => set({ pickupSameAsBusiness: e.target.checked })}
                    className="mt-[2px] size-[16px] shrink-0 appearance-none rounded-[3px] border-[1.25px] border-[#d0d5dd] bg-white checked:bg-[#007c53] checked:border-[#007c53]"
                  />
                  <p className="text-[#101604] text-[12px]" style={jakarta(400)}>
                    Same as business address
                  </p>
                </label>
              </div>
              <div className="flex flex-col gap-[8px] relative">
                <FieldLabel htmlFor="pickup-hours">Pickup hours</FieldLabel>
                <button
                  id="pickup-hours"
                  type="button"
                  onClick={() => setHoursOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={hoursOpen}
                  className="bg-[#f7f7f7] flex h-[48px] items-center justify-between px-[16px] rounded-[30px] w-full"
                >
                  <span className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px]" style={jakarta(400)}>
                    {form.pickupHoursLabel}
                  </span>
                  <div className="relative shrink-0 size-[24px]">
                    <img src={chevronDownIcon} alt="" className="absolute block inset-0 max-w-none size-full" />
                  </div>
                </button>
                {hoursOpen && (
                  <ul
                    role="listbox"
                    className="absolute left-0 right-0 top-[84px] z-20 bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] py-[4px]"
                  >
                    {PICKUP_PRESETS.map((p) => (
                      <li key={p.label}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={p.label === form.pickupHoursLabel}
                          onClick={() => {
                            set({ pickupHoursLabel: p.label })
                            setHoursOpen(false)
                          }}
                          className="w-full text-left px-[16px] py-[12px] text-[14px] leading-[24px] hover:bg-[#f7f7f7]"
                          style={{ ...jakarta(400), color: p.label === form.pickupHoursLabel ? '#007c53' : '#101604' }}
                        >
                          {p.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </SectionCard>

            {/* Seller-only information */}
            <SectionCard title="Seller-only information" subtitle="Only you and your team can see this.">
              <div className="flex flex-col gap-[8px]">
                <FieldLabel>SKU</FieldLabel>
                {/* The API assigns the SKU on save. */}
                <div className="bg-[#f7f7f7] flex h-[48px] items-center px-[16px] rounded-[30px] w-full">
                  <p
                    className="text-[14px] leading-[24px] tracking-[-0.28px]"
                    style={{ ...jakarta(400), color: original?.sku ? '#101604' : '#807e7e' }}
                  >
                    {original?.sku ?? 'Generated when you save'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-[8px]">
                <FieldLabel htmlFor="note">Note</FieldLabel>
                <input
                  id="note"
                  value={form.note}
                  maxLength={2000}
                  onChange={(e) => set({ note: e.target.value })}
                  placeholder="October harvest"
                  className={inputClass}
                  style={jakarta(400)}
                />
              </div>
            </SectionCard>

            {/* Action buttons */}
            <button
              type="button"
              onClick={() => save(editing ? (original?.status ?? 'DRAFT') : 'PUBLISHED')}
              disabled={busy !== ''}
              className="flex h-[48px] items-center justify-center px-[24px] rounded-[30px] w-full disabled:opacity-60"
              style={{ backgroundImage: CTA_BG }}
            >
              <p
                className="text-[14px] tracking-[-0.14px] bg-clip-text text-transparent"
                style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}
              >
                {editing ? 'Save changes' : 'Publish listing'}
              </p>
            </button>
            {/* The API has no delete yet; the button stays as designed but says so. */}
            <button
              type="button"
              disabled
              title="Deleting a listing is not available yet"
              className="bg-[#f5ebed] flex h-[48px] items-center justify-center px-[24px] rounded-[30px] w-full opacity-60 cursor-not-allowed"
            >
              <p className="text-[#d80027] text-[14px] tracking-[-0.14px]" style={jakarta(500)}>
                {editing ? 'Delete listing' : 'Delete'}
              </p>
            </button>
          </div>
        </div>
      </div>
      {published && (
        <SuccessModal
          title={published.edited ? 'Changes saved' : 'Product published! 🎉'}
          body={
            published.edited
              ? 'Your product details have been updated successfully and are now live on the marketplace.'
              : 'Your product is now live on the marketplace and visible to buyers.'
          }
          primary={{ label: 'View listing', onClick: () => navigate(`/dashboard/products/${published.id}`) }}
          secondary={{ label: 'Back to products', onClick: () => navigate('/dashboard/products') }}
          onClose={() => navigate(`/dashboard/products/${published.id}`)}
        />
      )}
    </DashboardLayout>
  )
}

/** Loads the store, its categories and (when editing) the listing, then mounts the form fresh per listing. */
export default function AddProduct() {
  const { id } = useParams()
  const { data: allCategories = [] } = useGetCategoriesQuery()
  const { store } = useStore()
  const myProducts = useGetMyProductsQuery(undefined, { skip: !id })
  const original = id ? (myProducts.data?.find((x) => x.id === id) ?? null) : null
  // A product can only sit in a category the store sells, so the list is the store's own.
  const categories = store?.categoryIds?.length ? allCategories.filter((c) => store.categoryIds.includes(c.id)) : allCategories
  const pending = Boolean(id) && !myProducts.data && !myProducts.error
  const missing = Boolean(id) && Boolean(myProducts.data) && !original
  if (pending || missing || myProducts.error)
    return (
      <DashboardLayout>
        <p className="px-[24px] pt-[40px] text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
          {pending ? 'Loading…' : myProducts.error ? describeError(myProducts.error) : 'We could not find that product.'}
        </p>
      </DashboardLayout>
    )
  return <ProductForm key={original?.id ?? 'new'} original={original} categories={categories} storeCountry={store?.businessAddress?.country ?? 'NG'} />
}
