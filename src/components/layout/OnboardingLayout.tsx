import type { ReactNode } from 'react'
import AuthLayout from './AuthLayout'
import image15 from '../../assets/images/onboarding-image15.png'
import image16 from '../../assets/images/onboarding-image16.png'

/** The onboarding frames' panel (413:3440): image 15 centred under image 16 anchored at the top. */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout
      images={[
        { src: image15, className: 'object-center' },
        { src: image16, className: 'object-top' },
      ]}
    >
      {children}
    </AuthLayout>
  )
}
