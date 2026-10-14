import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
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
  const [activeId, setActiveId] = useState(seed[0].id)
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const history = useRef<HTMLDivElement>(null)

  const active = chats.find((c) => c.id === activeId) ?? chats[0]
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
  }, [activeId, active.messages.length])

  function open(id: string) {
    setActiveId(id)
    setChats((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }

  function send(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    const msg: Message = { id: `s${Date.now()}`, from: 'me', kind: 'text', text, at: now() }
    setChats((cs) =>
      cs.map((c) =>
        c.id === active.id
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
        className="px-[24px] pt-[24px] pb-[24px] flex gap-[16px] items-start"
        style={{ height: 'calc(100vh - 96px)' }}
      >
        {/* Chat list */}
        <section
          className="w-[400px] shrink-0 h-full bg-white rounded-[20px] p-[20px] flex flex-col gap-[16px] overflow-hidden"
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
                  aria-current={c.id === active.id || undefined}
                  className="flex w-full h-[80px] items-center justify-between gap-[10px] rounded-[20px] px-[16px] text-left"
                  style={{ background: c.id === active.id ? 'rgba(0,124,83,0.05)' : '#ffffff' }}
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
            {list.length === 0 && (
              <li className="text-[#807e7e] text-[13px] leading-[20px] px-[16px]" style={jakarta(400)}>
                No chats here yet.
              </li>
            )}
          </ul>
        </section>

        {/* Chat pane */}
        <section
          className="flex-1 min-w-0 h-full bg-white rounded-[20px] flex flex-col overflow-hidden"
          aria-label={`Chat with ${active.name}`}
        >
          <header className="flex items-center justify-between h-[88px] px-[20px] border-b border-[#f7f7f7] shrink-0">
            <div className="flex items-center gap-[12px]">
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

          <div ref={history} className="flex-1 overflow-y-auto p-[24px] flex flex-col gap-[24px]">
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
                    <div className="w-[368px] rounded-[16px] bg-white overflow-hidden shadow-[0_8px_30px_rgba(16,22,4,0.06)]">
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
                          onClick={() => window.print()}
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
                    <div className="w-[423px] rounded-[16px] bg-white p-[16px] shadow-[0_8px_30px_rgba(16,22,4,0.06)] flex items-center gap-[14px]">
                      <img src={productThumb} alt="" className="size-[48px] rounded-[12px] object-cover shrink-0" />
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
                          onClick={() => navigate(`/marketplace/${m.productId}`)}
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
              const mine = m.from === 'me'
              return (
                <div key={m.id} className={`flex items-end gap-[12px] ${mine ? 'justify-end' : ''}`}>
                  {!mine && <Avatar chat={active} size={40} />}
                  <div className={`flex flex-col gap-[4px] max-w-[420px] ${mine ? 'items-end' : ''}`}>
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
            <button
              type="button"
              aria-label="Attach"
              className="flex items-center justify-center size-[48px] rounded-full bg-[#f7f7f7] shrink-0"
            >
              <img src={addIcon} alt="" className="size-[24px]" />
            </button>
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
        </section>
      </div>
    </DashboardLayout>
  )
}
