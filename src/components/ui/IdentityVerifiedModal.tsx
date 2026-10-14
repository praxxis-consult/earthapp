import SuccessModal from './SuccessModal'

interface IdentityVerifiedModalProps {
  onProceed: () => void
  onClose: () => void
}

/**
 * Figma "id verified" (423:4471). The API keeps identity UNVERIFIED for now, so the copy says the
 * details were received rather than claiming a check that has not run.
 */
export default function IdentityVerifiedModal({ onProceed, onClose }: IdentityVerifiedModalProps) {
  return (
    <SuccessModal
      title="Identity received"
      body={
        <>
          We’ve saved your identity details and selfie. Buyers
          <br className="max-md:hidden" /> will see your verified badge once the check completes.
        </>
      }
      primary={{ label: 'Proceed', onClick: onProceed }}
      onClose={onClose}
    />
  )
}
