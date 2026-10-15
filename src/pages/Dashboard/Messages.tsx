import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import EmptyBlock from '../../components/ui/EmptyBlock'
import ReceiptModal from '../../components/ui/ReceiptModal'
import { MenuItem, MenuList } from '../../components/ui/SelectorMenu'
import { useMenu } from '../../components/ui/useMenu'
import tagIcon from '../../assets/icons/msg-tag.svg'
import galleryIcon from '../../assets/icons/msg-gallery.svg'
import type { Product } from '../../services/earthApi'
import { useLazyGetMyProductsQuery } from '../../feature/products/productsApiSlice'
import { naira as nairaFmt } from '../../lib/productView'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import searchIcon from '../../assets/icons/db-search.svg'
import callIcon from '../../assets/icons/msg-call.svg'
import addIcon from '../../assets/icons/msg-add.svg'
import sendIcon from '../../assets/icons/msg-send.svg'
import receiptIcon from '../../assets/icons/msg-receipt.svg'
import paidIcon from '../../assets/icons/msg-paid-check.svg'
import arrowRightIcon from '../../assets/icons/msg-arrow-right.svg'
import { chats as seed, productThumb, type Chat, type Message } from '../../data/messages'
import { initials, naira } from '../../data/orders'
import { jakarta } from '../../utils/styles'

/** Figma "Avatars": 48px photo or initials (16/18 SemiBold #101928) on a tint, 1.5px white ring. */
function Avatar({ chat, size = 48 }: { chat: Chat; size?: number }) {
  return chat.photo ? (
    <img
      src={chat.photo}
      alt=""
      className="rounded-full object-cover ring-[1.5px] ring-white shrink-0"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="flex items-center justify-center rounded-full ring-[1.5px] ring-white shrink-0 text-[#101928]"
      style={{
        ...jakarta(600),
        width: size,
        height: size,
        background: chat.tint ?? '#e5e6ff',
        fontSize: size === 48 ? 16 : 14,
      }}
    >
      {initials(chat.name)}
    </span>
  )
}

const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
let seq = 0
const nextId = (prefix: string) => `${prefix}${++seq}`

/**
 * Figma messages 584:11283: a 400px chat list (search, All/Unread tabs, 80px rows, the open chat
 * tinted green at 5%) beside a 677px chat pane (88px header with the online dot and call button,
 * day chip, 420px-wide bubbles — incoming #f7f7f7 with the bottom-left corner squared, outgoing
 * #007c53 with the bottom-right squared — invoice and product attachments, then the composer).
 * Conversations are local until the messaging API exists.
 */
export default function Messages() {
  const navigate = useNavigate()
  // The first chat opens on arrival, so it starts read.
  const [chats, setChats] = useState<Chat[]>(() => seed.map((c, i) => (i === 0 ? { ...c, unread: 0 } : c)))
  const [activeId, setActiveId] = useState<string | undefined>(seed[0]?.id)
  // Below lg the list and the conversation are two screens; opening a chat moves to the second.
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const history = useRef<HTMLDivElement>(null)
  const { open: attachOpen, setOpen: setAttachOpen, ref: attachRef } = useMenu()
  const [picker, setPicker] = useState<Product[] | null>(null)
  const [loadMine] = useLazyGetMyProductsQuery()
  const [receipt, setReceipt] = useState<Extract<Message, { kind: 'invoice' }> | null>(null)

  const active: Chat | undefined = chats.find((c) => c.id === activeId) ?? chats[0]
  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return chats.filter(
      (c) =>
        (tab === 'all' || c.unread > 0) &&
        (!q || c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)),
    )
  }, [chats, tab, query])

  useEffect(() => {
    history.current?.scrollTo({ top: history.current.scrollHeight })
  }, [activeId, active?.messages.length])

  function open(id: string) {
    setActiveId(id)
    setMobileView('chat')
    setChats((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }

  /** Appends a message to the open chat and refreshes its preview. */
  function append(msg: Message, preview: string) {
    setChats((cs) =>
      cs.map((c) =>
        c.id === active?.id
          ? { ...c, messages: [...c.messages.filter((m) => m.kind !== 'typing'), msg], preview, previewAt: 'at' in msg ? msg.at : now(), typing: false }
          : c,
      ),
    )
  }

  async function openPicker() {
    setAttachOpen(false)
    setPicker([])
    setPicker(await loadMine('PUBLISHED').unwrap().catch(() => []))
  }

  function sendProduct(p: Product) {
    setPicker(null)
    append(
      {
        id: nextId('p'),
        from: 'me',
        kind: 'product',
        title: p.productName ?? 'Product',
        soldBy: `Sold by ${(p.soldAs ?? 'unit').toLowerCase()}`,
        unit: p.approximateWeightGrams ? `${Math.round(p.approximateWeightGrams / 1000)} kg/${(p.soldAs ?? 'unit').toLowerCase()}` : (p.soldAs ?? ''),
        price: Number(p.price ?? 0),
        productId: p.id,
        image: p.images?.find((i) => i.isPrimary)?.url ?? p.images?.[0]?.url,
        at: now(),
      },
      `Sent a product: ${p.productName ?? ''}`,
    )
  }

  function sendPhoto(file: File | undefined) {
    setAttachOpen(false)
    if (!file) return
    append({ id: nextId('m'), from: 'me', kind: 'media', url: URL.createObjectURL(file), video: file.type.startsWith('video/'), at: now() }, file.type.startsWith('video/') ? 'Sent a video' : 'Sent a photo')
  }

  function send(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    const msg: Message = { id: nextId('s'), from: 'me', kind: 'text', text, at: now() }
    setChats((cs) =>
      cs.map((c) =>
        c.id === active?.id
          ? {
              ...c,
              messages: [...c.messages.filter((m) => m.kind !== 'typing'), msg],
              preview: text,
              previewAt: msg.at,
              typing: false,
            }
          : c,
      ),
    )
    setDraft('')
  }

  return (
    <DashboardLayout>
      <div
        className="px-[24px] pt-[24px] pb-[24px] flex gap-[16px] items-start max-md:px-[16px] max-md:pt-[16px] max-md:pb-[16px]"
        style={{ height: 'calc(100vh - 96px)' }}
      >
        {/* Chat list */}
        <section
          className={`w-[400px] shrink-0 h-full bg-white rounded-[20px] p-[20px] flex flex-col gap-[16px] overflow-hidden max-lg:w-full max-md:p-[16px] ${mobileView === 'chat' ? 'max-lg:hidden' : ''}`}
          aria-label="Chats"
        >
          <label className="flex items-center gap-[8px] h-[48px] px-[16px] rounded-[30px] bg-[#f7f7f7]">
            <img src={searchIcon} alt="" className="size-[20px]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats..."
              aria-label="Search chats"
              className="flex-1 min-w-0 bg-transparent outline-none text-[13px] leading-[16px] text-[#101604] placeholder:text-[#807e7e]"
              style={jakarta(400)}
            />
          </label>
          <div className="flex items-center gap-[12px]" role="tablist">
            {(['all', 'unread'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className="h-[35px] px-[12px] rounded-[30px] text-[12px] leading-[15px]"
                style={{
                  ...jakarta(tab === t ? 600 : 500),
                  background: tab === t ? '#f2f8f6' : '#f7f7f7',
                  color: tab === t ? '#007c53' : '#807e7e',
                }}
              >
                {t === 'all' ? 'All' : 'Unread'}
              </button>
            ))}
          </div>
          <div className="h-px w-full bg-[#f7f7f7]" />
          <ul className="flex flex-col gap-[16px] overflow-y-auto -mx-[4px] px-[4px]">
            {list.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => open(c.id)}
                  aria-current={c.id === active?.id || undefined}
                  className="flex w-full h-[80px] items-center justify-between gap-[10px] rounded-[20px] px-[16px] text-left"
                  style={{ background: c.id === active?.id ? 'rgba(0,124,83,0.05)' : '#ffffff' }}
                >
                  <div className="flex items-center gap-[12px] min-w-0">
                    <Avatar chat={c} />
                    <div className="flex flex-col gap-[8px] min-w-0">
                      <p className="text-[#101604] text-[16px] leading-[20px] truncate" style={jakarta(600)}>
                        {c.name}
                      </p>
                      <p
                        className={`text-[#807e7e] text-[12px] leading-[15px] truncate ${c.typing ? 'italic' : ''}`}
                        style={jakarta(400)}
                      >
                        {c.typing ? 'Typing...' : c.preview}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-[6px] shrink-0">
                    <span className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(400)}>
                      {c.previewAt}
                    </span>
                    {c.unread > 0 && (
                      <span
                        className="flex items-center justify-center min-w-[20px] h-[20px] px-[6px] rounded-full bg-[#007c53] text-white text-[11px]"
                        style={jakarta(600)}
                      >
                        {c.unread}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {list.length === 0 && (
            <EmptyBlock
              className="flex-1 justify-center py-[24px]"
              title={chats.length === 0 ? 'No messages yet' : 'No unread messages'}
              copy={chats.length === 0 ? 'Chats with your buyers will show up here.' : 'You are all caught up.'}
            />
          )}
        </section>

        {/* Chat pane */}
        <section
          className={`flex-1 min-w-0 h-full bg-white rounded-[20px] flex flex-col overflow-hidden max-lg:w-full ${mobileView === 'list' ? 'max-lg:hidden' : ''}`}
          aria-label={active ? `Chat with ${active.name}` : 'Messages'}
        >
          {!active ? (
            <EmptyBlock
              className="flex-1 justify-center p-[24px]"
              title="No conversation yet"
              copy="When a buyer messages you about a listing, the chat opens here."
            />
          ) : (
            <>
          <header className="flex items-center justify-between h-[88px] px-[20px] border-b border-[#f7f7f7] shrink-0 max-md:px-[16px] max-md:h-[72px]">
            <div className="flex items-center gap-[12px] min-w-0">
              <button
                type="button"
                onClick={() => setMobileView('list')}
                aria-label="Back to chats"
                className="lg:hidden flex items-center justify-center size-[36px] -ml-[8px] rounded-full shrink-0 hover:bg-[#f7f7f7]"
              >
                <img src={arrowRightIcon} alt="" className="size-[20px] rotate-180" />
              </button>
              <Avatar chat={active} />
              <div className="flex flex-col gap-[2px]">
                <p className="text-[#101604] text-[16px] leading-[20px]" style={jakarta(600)}>
                  {active.name}
                </p>
                <div className="flex items-center gap-[6px]">
                  <span
                    className="size-[8px] rounded-[4px]"
                    style={{ background: active.online ? 'rgba(142,206,163,0.5)' : '#d0d5dd' }}
                  />
                  <span className="text-[#807e7e] text-[12px] leading-[15px]" style={jakarta(400)}>
                    {active.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <a
              href="tel:"
              aria-label={`Call ${active.name}`}
              className="flex items-center justify-center size-[36px] rounded-[18px] bg-[#f7f7f7]"
            >
              <img src={callIcon} alt="" className="size-[16px]" />
            </a>
          </header>

          <div ref={history} className="flex-1 overflow-y-auto p-[24px] flex flex-col gap-[24px] max-md:p-[16px]">
            <div className="flex justify-center">
              <span
                className="rounded-[12px] bg-[#f7f7f7] px-[12px] py-[6px] text-[#807e7e] text-[11px] leading-[14px]"
                style={jakarta(600)}
              >
                {active.dayLabel}
              </span>
            </div>
            {active.messages.map((m) => {
              if (m.kind === 'typing')
                return (
                  <div key={m.id} className="flex items-end gap-[12px]">
                    <Avatar chat={active} size={40} />
                    <div className="rounded-[16px] rounded-bl-[4px] bg-[#f7f7f7] px-[16px] py-[12px]">
                      <p className="text-[#807e7e] text-[14px] leading-[22px] italic" style={jakarta(400)}>
                        Typing...
                      </p>
                    </div>
                  </div>
                )
              if (m.kind === 'invoice')
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="w-[368px] max-w-full rounded-[16px] bg-white overflow-hidden shadow-[0_8px_30px_rgba(16,22,4,0.06)]">
                      <div className="flex items-center gap-[12px] bg-[#edf7f3] p-[14px]">
                        <span className="flex items-center justify-center size-[32px] rounded-[10px] bg-white">
                          <img src={receiptIcon} alt="" className="size-[16px]" />
                        </span>
                        <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                          <p className="text-[#101604] text-[12px] leading-[15px]" style={jakarta(700)}>
                            Invoice #{m.number}
                          </p>
                          <p className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(400)}>
                            {m.summary}
                          </p>
                        </div>
                        {m.paid && (
                          <span
                            className="flex items-center gap-[4px] rounded-[30px] bg-[#aee74a] px-[8px] py-[4px] text-[#0c2310] text-[11px] leading-[14px]"
                            style={jakarta(600)}
                          >
                            <img src={paidIcon} alt="" className="size-[16px]" />
                            PAID
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-[14px]">
                        <div className="flex flex-col gap-[2px]">
                          <p className="text-[#807e7e] text-[10px] leading-[13px]" style={jakarta(400)}>
                            Amount Paid
                          </p>
                          <p className="text-[#101604] text-[16px] leading-[20px]" style={jakarta(700)}>
                            {naira(m.amount).replace(/\.00$/, '')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReceipt(m)}
                          className="text-[#007c53] text-[12px] leading-[15px]"
                          style={jakarta(600)}
                        >
                          View receipt
                        </button>
                      </div>
                    </div>
                  </div>
                )
              if (m.kind === 'product')
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="w-[423px] max-w-full rounded-[16px] bg-white p-[16px] shadow-[0_8px_30px_rgba(16,22,4,0.06)] flex items-center gap-[14px] max-sm:flex-wrap">
                      <img src={m.image ?? productThumb} alt="" className="size-[48px] rounded-[12px] object-cover shrink-0" />
                      <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                        <p className="text-[#101604] text-[14px] leading-[20px] truncate" style={jakarta(600)}>
                          {m.title}
                        </p>
                        <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                          {m.soldBy} · {m.unit}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-[4px] shrink-0">
                        <p className="text-[#101604] text-[14px] leading-[18px]" style={jakarta(700)}>
                          {naira(m.price)}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/products/${m.productId}`)}
                          className="flex items-center gap-[8px] text-[#177b4d] text-[10px] leading-[13px]"
                          style={jakarta(600)}
                        >
                          View product
                          <img src={arrowRightIcon} alt="" className="size-[16px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              if (m.kind === 'media')
                return (
                  <div key={m.id} className={`flex items-end gap-[12px] ${m.from === 'me' ? 'justify-end' : ''}`}>
                    {m.from !== 'me' && <Avatar chat={active} size={40} />}
                    <div className={`flex flex-col gap-[4px] ${m.from === 'me' ? 'items-end' : ''}`}>
                      <div className="relative h-[232px] w-[230px] overflow-hidden rounded-[16px] bg-[#f7f7f7]">
                        {m.video ? (
                          <video src={m.url} className="size-full object-cover" controls={false} muted playsInline />
                        ) : (
                          <img src={m.url} alt="" className="size-full object-cover" />
                        )}
                        {m.video && (
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Play video"
                            className="absolute left-1/2 top-1/2 flex size-[48px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                            style={{ background: 'rgba(16,22,4,0.4)' }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M7 4.5v15l12-7.5-12-7.5z" fill="#fff" />
                            </svg>
                          </a>
                        )}
                      </div>
                      <span className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(400)}>
                        {m.at}
                      </span>
                    </div>
                  </div>
                )
              const mine = m.from === 'me'
              return (
                <div key={m.id} className={`flex items-end gap-[12px] ${mine ? 'justify-end' : ''}`}>
                  {!mine && <Avatar chat={active} size={40} />}
                  <div className={`flex flex-col gap-[4px] max-w-[420px] max-md:max-w-[85%] ${mine ? 'items-end' : ''}`}>
                    <div
                      className={`px-[16px] py-[12px] ${mine ? 'rounded-[16px] rounded-br-[4px] bg-[#007c53]' : 'rounded-[16px] rounded-bl-[4px] bg-[#f7f7f7]'}`}
                    >
                      <p
                        className="text-[14px] leading-[22px]"
                        style={{ ...jakarta(400), color: mine ? '#ffffff' : '#101604' }}
                      >
                        {m.text}
                      </p>
                    </div>
                    <span className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(400)}>
                      {m.at}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <form
            onSubmit={send}
            className="flex items-center gap-[12px] h-[88px] px-[20px] border-t border-[#f7f7f7] shrink-0"
          >
            <div ref={attachRef} className="relative shrink-0">
              <button
                type="button"
                aria-label="Attach"
                aria-haspopup="menu"
                aria-expanded={attachOpen}
                onClick={() => setAttachOpen((o) => !o)}
                className="flex items-center justify-center size-[48px] rounded-full bg-[#f7f7f7]"
              >
                <img src={addIcon} alt="" className="size-[24px]" />
              </button>
              {/* Figma "Selector menu" (623:20879): 375 wide, 1px #d9d9d9, radius 24, two 72px rows with tinted icon discs */}
              {attachOpen && (
                <div
                  role="menu"
                  className="absolute bottom-[56px] left-0 z-30 w-[375px] max-w-[calc(100vw-72px)] rounded-[24px] border border-[#d9d9d9] bg-white py-[8px]"
                  style={{ boxShadow: '0 5px 15px 5px rgba(0,0,0,0.02), 0 3px 10px -2px rgba(0,0,0,0.1)' }}
                >
                  <button type="button" role="menuitem" onClick={openPicker} className="flex h-[72px] w-full items-center gap-[8px] border-b border-[#f7f7f7] px-[16px] text-left hover:bg-[#f7f7f7]">
                    <span className="flex size-[40px] items-center justify-center rounded-full" style={{ background: 'rgba(213,85,25,0.05)' }}>
                      <img src={tagIcon} alt="" className="size-[20px]" />
                    </span>
                    <span className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>
                      Send a product
                    </span>
                  </button>
                  <button type="button" role="menuitem" onClick={() => document.getElementById('msg-file')?.click()} className="flex h-[72px] w-full items-center gap-[8px] px-[16px] text-left hover:bg-[#f7f7f7]">
                    <span className="flex size-[40px] items-center justify-center rounded-full" style={{ background: 'rgba(61,71,226,0.05)' }}>
                      <img src={galleryIcon} alt="" className="size-[20px]" />
                    </span>
                    <span className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>
                      Photo
                    </span>
                  </button>
                </div>
              )}
              <input id="msg-file" type="file" accept="image/*,video/*" className="sr-only" onChange={(e) => sendPhoto(e.target.files?.[0])} />
            </div>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              aria-label="Message"
              className="flex-1 min-w-0 h-[48px] rounded-[24px] bg-[#f7f7f7] px-[16px] text-[14px] leading-[18px] text-[#101604] outline-none placeholder:text-[#807e7e]"
              style={jakarta(400)}
            />
            <button
              type="submit"
              aria-label="Send"
              className="flex items-center justify-center size-[48px] rounded-full bg-[#007c53] shrink-0"
            >
              <img src={sendIcon} alt="" className="size-[16px]" />
            </button>
          </form>
            </>
          )}
        </section>
      </div>

      {picker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setPicker(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <MenuList width={Math.min(375, window.innerWidth - 32)} hint={picker.length ? 'Choose a listing to send' : 'Loading your listings…'}>
              {picker.map((p) => (
                <MenuItem key={p.id} label={`${p.productName ?? 'Product'} · ${nairaFmt(Number(p.price ?? 0))}`} selected={false} onSelect={() => sendProduct(p)} />
              ))}
              {picker.length === 0 && (
                <p className="px-[16px] py-[12px] text-[#807e7e] text-[14px] leading-[20px]" style={jakarta(400)}>
                  Publish a listing first, then you can send it here.
                </p>
              )}
            </MenuList>
          </div>
        </div>
      )}
      {receipt && (
        <ReceiptModal
          receipt={{
            invoiceNumber: receipt.number,
            receiptNumber: `RCT-${receipt.number.replace(/\D/g, '')}`,
            paidAt: `today, ${receipt.at}`,
            amount: receipt.amount,
            product: { title: receipt.summary.split(' · ')[0], detail: `${receipt.summary.split(' · ').slice(1).join(' · ')} · Delivery to ${active?.name ?? ''}`, image: productThumb },
            paidWith: 'Bank transfer',
            reference: `PAY-${receipt.id.toUpperCase()}${receipt.number.replace(/\D/g, '')}`,
            deliveryTitle: 'Order confirmed · Preparing next',
            deliveryEta: 'Estimated delivery in 2–3 business days',
            nextSteps: [`You prepare the ${receipt.summary} order for dispatch.`, 'The buyer receives delivery updates in real time.', 'The buyer confirms delivery to release your payout.'],
          }}
          onViewOrder={() => navigate('/dashboard/orders')}
          onClose={() => setReceipt(null)}
        />
      )}
    </DashboardLayout>
  )
}
