import Card from './Card'
import { useGetChatContactQuery, useSetChatContactMutation } from '../../feature/chats/chatsApiSlice'
import { describeError } from '../../services/earthApi'
import { jakarta } from '../../utils/styles'

/**
 * The seller's choice to show the account's phone number to buyers in their chats
 * (`GET/PUT /stores/me/chat-contact`, 25 October). The number is the account's; a changed number
 * needs the choice again, which the card says. No frame for it; it follows the delivery card.
 */
export default function ChatPhoneCard({ onError }: { onError: (message: string) => void }) {
  const contact = useGetChatContactQuery()
  const [save, { isLoading }] = useSetChatContactMutation()
  const c = contact.data
  const on = Boolean(c?.sharePhoneInChat) && !c?.needsRenewal
  async function toggle() {
    if (!c) return
    try {
      await save({ expectedVersion: c.version, sharePhoneInChat: !on }).unwrap()
    } catch (e) {
      onError(describeError(e))
    }
  }
  return (
    <Card className="flex flex-col gap-[16px]">
      <div className="flex items-start justify-between gap-[16px] max-md:flex-col">
        <div className="flex flex-col gap-[4px] min-w-0">
          <p className="text-[#101604] text-[16px] leading-[24px]" style={jakarta(500)}>
            Phone number in chat
          </p>
          <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
            {contact.isLoading
              ? 'Reading your choice…'
              : contact.error
                ? describeError(contact.error)
                : !c?.phone
                  ? 'Add a phone number under Personal details first; buyers in your chats can then call you.'
                  : c.needsRenewal
                    ? `Your number changed to ${c.phone}. Turn this on again to share the new one.`
                    : on
                      ? `Buyers you chat with see ${c.phone} and can call you from the thread.`
                      : `Off. Buyers message you here only; turn it on to let them call ${c.phone}.`}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Share my phone number in chat"
          disabled={!c || !c.phone || isLoading}
          onClick={toggle}
          className={`relative h-[28px] w-[48px] shrink-0 rounded-full transition-colors disabled:opacity-50 ${on ? 'bg-[#007c53]' : 'bg-[#e4dede]'}`}
        >
          <span className={`absolute top-[3px] size-[22px] rounded-full bg-white shadow transition-[left] ${on ? 'left-[23px]' : 'left-[3px]'}`} />
        </button>
      </div>
    </Card>
  )
}
