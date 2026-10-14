import SuccessModal from './SuccessModal'

interface AccountCreatedModalProps {
  onSetupStore: () => void
  onClose: () => void
}

/** Figma "account created" (394:3265). */
export default function AccountCreatedModal({ onSetupStore, onClose }: AccountCreatedModalProps) {
  return (
    <SuccessModal
      title="Great! You’re In."
      body={
        <>
          Welcome to Earth, the marketplace for everything that
          <br />
          grows from the land. Your account is ready.
        </>
      }
      primary={{ label: 'Setup store', onClick: onSetupStore }}
      onClose={onClose}
    />
  )
}
