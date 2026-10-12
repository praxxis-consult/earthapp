import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../components/layout/OnboardingLayout'
import OnboardingHeader from '../../components/layout/OnboardingHeader'
import FormMultiDropdown from '../../components/ui/FormMultiDropdown'
import GradientButton from '../../components/ui/GradientButton'
import { jakarta } from '../../utils/styles'

const SELL_OPTIONS = ['Agriculture', 'Forestry', 'Minerals', 'Energy', 'Metals', 'Raw materials']

export default function StoreName() {
  const navigate = useNavigate()
  const [storeName, setStoreName] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  return (
    <OnboardingLayout>
      <OnboardingHeader
        onBack={() => navigate(-1)}
        step={1}
        title="Your store"
        subtitle="Tell us your store name and what you intend to sell"
      />

      <div
        className="absolute flex flex-col gap-[16px] items-start"
        style={{ left: '120px', top: '328px', width: '580px' }}
      >
        {/* Store name */}
        <div className="flex flex-col gap-[8px] items-start w-full">
          <label
            htmlFor="store-name"
            className="text-[#101604] text-[14px] leading-[24px] tracking-[-0.28px] w-full"
            style={jakarta(500)}
          >
            Store name
          </label>
          <input
            id="store-name"
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g. Akpolo Agro & Mine"
            className="bg-[#f7f7f7] h-[48px] w-full rounded-[30px] px-[16px] py-[8px] text-[14px] tracking-[-0.28px] leading-[24px] outline-none border border-transparent focus:border-[#007c53] transition-colors placeholder:text-[#807e7e]"
            style={{ ...jakarta(400), color: '#101604' }}
          />
        </div>

        <FormMultiDropdown
          label="What do you sell?"
          values={categories}
          placeholder="Select more than one option"
          options={SELL_OPTIONS}
          onToggle={toggleCategory}
        />
      </div>

      <GradientButton
        onClick={() => navigate('/onboarding/location')}
        style={{ position: 'absolute', left: '120px', top: '568px', width: '580px' }}
      >
        Proceed
      </GradientButton>
    </OnboardingLayout>
  )
}
