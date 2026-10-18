import SuccessModal from './SuccessModal'

interface AccountCreatedModalProps {
  /** A selling account goes on to set up its store; a buying one opens its dashboard. */
  seller: boolean
  onContinue: () => void
  onClose: () => void
}

/** Figma "account created" (394:3265); the button names what comes next for the account type. */
export default function AccountCreatedModal({ seller, onContinue, onClose }: AccountCreatedModalProps) {
  return (
    <SuccessModal
      title="Great! You’re In."
      body={
        <>
          Welcome to Earth, the marketplace for everything that
          <br className="max-md:hidden" /> grows from the land. Your account is ready.
        </>
      }
      primary={{ label: seller ? 'Setup store' : 'Open my dashboard', onClick: onContinue }}
      onClose={onClose}
    />
  )
}
