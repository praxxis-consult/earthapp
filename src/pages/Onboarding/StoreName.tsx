import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../components/layout/OnboardingLayout'
import OnboardingHeader from '../../components/layout/OnboardingHeader'
import FormMultiDropdown from '../../components/ui/FormMultiDropdown'
import GradientButton from '../../components/ui/GradientButton'
import { describeError, stores, type Category } from '../../services/earthApi'
import { saveDraft, useDraft } from '../../onboarding/draft'
import { jakarta } from '../../utils/styles'

export default function StoreName() {
  const navigate = useNavigate()
  const [draft, update] = useDraft()
  const [categories, setCategories] = useState<Category[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // The selling categories come from the API (ids behind the names the person picks).
  useEffect(() => {
    let live = true
    stores
      .categories()
      .then((list) => live && setCategories(list))
      .catch(() => live && setError('We could not load the selling categories. Check your connection and reload.'))
    return () => {
      live = false
    }
  }, [])

  const names = categories.filter((c) => draft.categoryIds.includes(c.id)).map((c) => c.name)

  function toggleCategory(name: string) {
    const cat = categories.find((c) => c.name === name)
    if (!cat) return
    const ids = draft.categoryIds.includes(cat.id)
      ? draft.categoryIds.filter((id) => id !== cat.id)
      : [...draft.categoryIds, cat.id]
    update({ categoryIds: ids })
  }

  async function proceed() {
    if (!draft.storeName.trim()) return setError('Enter your store name.')
    if (!draft.categoryIds.length) return setError('Pick at least one thing you sell.')
    setBusy(true)
    setError('')
    try {
      await saveDraft()
      navigate('/onboarding/location')
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <OnboardingLayout>
      <OnboardingHeader
        onBack={() => navigate(-1)}
        step={1}
        title="Your store"
        subtitle="Tell us your store name and what you intend to sell"
      />

      <div className="mt-[40px] flex flex-col gap-[16px] items-start w-full">
        {/* Store name */}
        <div className="flex flex-col gap-[8px] items-start w-full">
          <label
            htmlFor="store-name"
            className="text-[#101604] text-[14px] leading-[24px] w-full"
            style={jakarta(500)}
          >
            Store name
          </label>
          <input
            id="store-name"
            type="text"
            value={draft.storeName}
            maxLength={160}
            onChange={(e) => update({ storeName: e.target.value })}
            placeholder="e.g. Akpolo Agro & Mine"
            className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] leading-[24px] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e]"
            style={{ ...jakarta(400), color: '#101604' }}
          />
        </div>

        <FormMultiDropdown
          label="What do you sell?"
          values={names}
          placeholder={categories.length ? 'Select more than one option' : 'Loading categories…'}
          options={categories.map((c) => c.name)}
          onToggle={toggleCategory}
        />

        {error && (
          <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
            {error}
          </p>
        )}
      </div>

      <GradientButton onClick={proceed} className="mt-[64px] w-full" style={{ opacity: busy ? 0.7 : 1 }}>
        {busy ? 'Saving…' : 'Proceed'}
      </GradientButton>
    </OnboardingLayout>
  )
}
