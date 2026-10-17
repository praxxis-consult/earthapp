import { useState } from 'react'
import LoginModal from './LoginModal'
import OtpModal from './OtpModal'

interface SignInDialogsProps {
  open: boolean
  onClose: () => void
  /** Where the OTP step sends the visitor once signed in; the page they are on, to carry on there. */
  redirectTo?: string
  initialEmail?: string
}

/**
 * The two-step sign-in the navbar, the sign-up page and the marketplace all use: the email
 * dialog (387:2682), then the code dialog (390:2921) which signs in.
 */
export default function SignInDialogs({ open, onClose, redirectTo, initialEmail = '' }: SignInDialogsProps) {
  const [otpEmail, setOtpEmail] = useState('')
  return (
    <>
      {open && (
        <LoginModal
          initialEmail={initialEmail}
          onClose={onClose}
          onProceed={(email) => {
            onClose()
            setOtpEmail(email)
          }}
        />
      )}
      {otpEmail && <OtpModal email={otpEmail} redirectTo={redirectTo} onClose={() => setOtpEmail('')} />}
    </>
  )
}
