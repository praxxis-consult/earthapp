import { useState } from 'react'
import copyIcon from '../../assets/icons/modal-copy.svg'
import SuccessModal from './SuccessModal'

interface SetupDoneModalProps {
  /** The live store's id from the API; the link opens the marketplace on that store. */
  storeId: string
  onDashboard: () => void
  onClose: () => void
}

/** Figma "setup done" (429:4719) and its "Link copied" state (668:30382). */
export default function SetupDoneModal({ storeId, onDashboard, onClose }: SetupDoneModalProps) {
  const [copied, setCopied] = useState(false)
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/marketplace?store=${storeId}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked: nothing to recover */
    }
  }
  return (
    <SuccessModal
      title="Your store is live! 🎉"
      body="Users across the platform can now find you. Share your store link where your customers already are."
      primary={{ label: 'Go to Dashboard', onClick: onDashboard }}
      secondary={{
        label: (
          <>
            <img src={copyIcon} alt="" className="size-[24px]" />
            {copied ? 'Link copied' : 'Copy link'}
          </>
        ),
        onClick: copyLink,
      }}
      onClose={onClose}
    />
  )
}
