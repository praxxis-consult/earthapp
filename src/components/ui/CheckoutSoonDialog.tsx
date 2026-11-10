import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shell } from './SettingsDialogs'
import { useStartChatMutation } from '../../feature/chats/chatsApiSlice'
import { describeError } from '../../services/earthApi'
import { jakarta } from '../../utils/styles'

/** A store the buyer was about to pay, so the dialog can open a chat with it instead. */
export interface SoonStore {
  id: string
  name: string
  /** The listing the buyer wanted, when there is exactly one; the chat opens about it. */
  productId?: string
}

/**
 * What checkout shows while payments are off (`PAYMENTS_LIVE`): the buyer keeps everything they
 * have, learns that paying opens on launch day, and can message the seller meanwhile. With one
 * store the button opens that chat; with several it simply closes.
 */
export default function CheckoutSoonDialog({ stores, onClose }: { stores: SoonStore[]; onClose: () => void }) {
  const navigate = useNavigate()
  const [startChat, { isLoading }] = useStartChatMutation()
  const [error, setError] = useState('')
  const one = stores.length === 1 ? stores[0] : null
  const sellers = stores.length === 1 ? 'the seller' : 'the sellers'

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!one) return onClose()
    setError('')
    try {
      const thread = await startChat({ storeId: one.id, ...(one.productId ? { productId: one.productId } : {}) }).unwrap()
      navigate(`/dashboard/messages?chat=${thread.id}`)
    } catch (err) {
      setError(describeError(err))
    }
  }

  return (
    <Shell title="Checkout opens soon" onClose={onClose} onSubmit={submit} busy={isLoading} cta={one ? `Message ${one.name}` : 'Keep browsing'} busyLabel="Opening chat…" cancel={!!one} cancelLabel="Not now">
      <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(400)}>
        Earth is in early access. Your account, cart and saved addresses are all kept; paying is the one thing that opens on launch day, and we email you the moment it does.
      </p>
      <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
        Until then, message {sellers} here about stock, prices and delivery, so your order is ready to place the day checkout opens.
      </p>
      {error && (
        <p role="alert" className="text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
          {error}
        </p>
      )}
    </Shell>
  )
}
