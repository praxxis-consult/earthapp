import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import EmptyBlock from '../../components/ui/EmptyBlock'
import { MenuItem, MenuList } from '../../components/ui/SelectorMenu'
import { useMenu } from '../../components/ui/useMenu'
import tagIcon from '../../assets/icons/msg-tag.svg'
import galleryIcon from '../../assets/icons/msg-gallery.svg'
import searchIcon from '../../assets/icons/db-search.svg'
import callIcon from '../../assets/icons/msg-call.svg'
import addIcon from '../../assets/icons/msg-add.svg'
import sendIcon from '../../assets/icons/msg-send.svg'
import receiptIcon from '../../assets/icons/msg-receipt.svg'
import paidIcon from '../../assets/icons/msg-paid-check.svg'
import arrowRightIcon from '../../assets/icons/msg-arrow-right.svg'
import productThumb from '../../assets/images/db-product-thumb.png'
import { describeError, toApiError, type Product } from '../../services/earthApi'
import { useAuth } from '../../feature/authentication/useAuth'
import { useLazyGetMyProductsQuery } from '../../feature/products/productsApiSlice'
import { useStore } from '../../feature/stores/useStore'
import { canSell } from '../../feature/authentication/role'
import { useUploadImageMutation } from '../../feature/uploads/uploadsApiSlice'
import {
  previewOf,
  useGetMessagesQuery,
  useLazyNewerMessagesQuery,
  useListChatsQuery,
  useMarkReadMutation,
  useSendMessageMutation,
  type ChatMessage,
  type ChatThread,
} from '../../feature/chats/chatsApiSlice'
import { useAppSelector } from '../../app/hooks'
import { selectLive } from '../../feature/realtime/realtimeSlice'
import { useConversationLive } from '../../feature/realtime/useConversationLive'
import { nairaFromMinor } from '../../lib/productView'
import { initials } from '../../data/orders'
import { jakarta } from '../../utils/styles'

/** How often the open thread asks for messages after its last one, and the list for new threads, while no live channel is up. */
const THREAD_POLL_MS = 5_000
const LIST_POLL_MS = 10_000
const MAX_MEDIA_BYTES = { image: 10 * 1024 * 1024, video: 50 * 1024 * 1024 }

/** Figma "Avatars": 48px initials (16/18 SemiBold #101928) on a tint, 1.5px white ring; the API sends no photos yet. */
function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-full ring-[1.5px] ring-white shrink-0 text-[#101928]"
      style={{ ...jakarta(600), width: size, height: size, background: '#e5e6ff', fontSize: size === 48 ? 16 : 14 }}
    >
      {initials(name)}
    </span>
  )
}

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
/** The list row's time: the clock today, the short date otherwise. */
function whenOf(iso: string): string {
  const d = new Date(iso)
  return sameDay(d, new Date()) ? timeOf(iso) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
/** The day chip over a run of messages: Today, Yesterday, or the date. */
function dayLabel(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  if (sameDay(d, now)) return 'Today'
  const y = new Date(now)
  y.setDate(now.getDate() - 1)
  if (sameDay(d, y)) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' })
}

/**
 * Figma messages 584:11283: a 400px chat list (search, All/Unread tabs, 80px rows, the open chat
 * tinted green at 5%) beside a 677px chat pane (88px header, day chips, 420px-wide bubbles —
 * incoming #f7f7f7 with the bottom-left corner squared, outgoing #007c53 with the bottom-right
 * squared — invoice, product and media attachments, then the composer). Threads and messages
 * come from the chats API; the open thread is subscribed on the live channel (polled when there is
 * none), its new messages are read over HTTP as they are announced, and marked read as they land.
 */
export default function Messages() {
  const navigate = useNavigate()
  const { account } = useAuth()
  const { store } = useStore()
  const seller = canSell(account)
  const me = account?.id ?? ''
  const [searchParams, setSearchParams] = useSearchParams()
  const live = useAppSelector(selectLive)
  const threads = useListChatsQuery(undefined, { pollingInterval: live ? 0 : LIST_POLL_MS })
  const list = threads.data ?? []
  // The thread named in the URL (a notification lands here), else the newest.
  const wanted = searchParams.get('chat')
  const activeId = (wanted && list.some((t) => t.id === wanted) ? wanted : list[0]?.id) ?? ''
  const active = list.find((t) => t.id === activeId)
  const history = useGetMessagesQuery(activeId, { skip: !activeId })
  const [poll] = useLazyNewerMessagesQuery()
  const [send, sending] = useSendMessageMutation()
  const [markRead] = useMarkReadMutation()
  const [uploadImage] = useUploadImageMutation()
  const [loadMine] = useLazyGetMyProductsQuery()
  // Below lg the list and the conversation are two screens; opening a chat moves to the second.
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pane = useRef<HTMLDivElement>(null)
  const { open: attachOpen, setOpen: setAttachOpen, ref: attachRef } = useMenu()
  const [picker, setPicker] = useState<Product[] | null>(null)

  /** The other side of a thread: the buyer when this account sells, the store when it buys. */
  const counterpart = (t: ChatThread) => (t.seller.id === me ? t.buyer.name : t.storeName)
  const messages = history.currentData?.items ?? []
  const lastSequence = history.currentData?.lastSequence ?? null
  // The live channel announces a new message by id only; the text is read after the last sequence on screen.
  const position = useRef({ chatId: activeId, lastSequence })
  useEffect(() => {
    position.current = { chatId: activeId, lastSequence }
  })
  const replay = useCallback(() => {
    const { chatId, lastSequence } = position.current
    if (chatId && lastSequence !== null) poll({ chatId, afterSequence: lastSequence })
  }, [poll])
  const { subscribed, peerTyping, noteTyping, stopTyping } = useConversationLive(activeId, replay)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return list.filter(
      (t) =>
        (tab === 'all' || Number(t.unreadCount) > 0) &&
        (!q || counterpart(t).toLowerCase().includes(q) || previewOf(t).toLowerCase().includes(q)),
    )
  }, [list, tab, query, me]) // eslint-disable-line react-hooks/exhaustive-deps

  // Without a live subscription: new messages after the last one, every few seconds while the tab is visible.
  useEffect(() => {
    if (!activeId || lastSequence === null || subscribed) return
    const tick = () => {
      if (document.visibilityState === 'visible') poll({ chatId: activeId, afterSequence: lastSequence })
    }
    const id = setInterval(tick, THREAD_POLL_MS)
    return () => clearInterval(id)
  }, [activeId, lastSequence, poll, subscribed])

  // What is on screen has been read: tell the API when the thread still counts anything unread.
  useEffect(() => {
    if (active && lastSequence !== null && Number(active.unreadCount) > 0) markRead({ chatId: active.id, sequence: lastSequence })
  }, [active, lastSequence, markRead])

  useEffect(() => {
    pane.current?.scrollTo({ top: pane.current.scrollHeight })
  }, [activeId, messages.length])

  function open(id: string) {
    setSearchParams(id === list[0]?.id ? {} : { chat: id }, { replace: true })
    setMobileView('chat')
    setError('')
  }

  async function deliver(body: Parameters<typeof send>[0]['body']): Promise<ChatMessage | null> {
    if (!activeId) return null
    setError('')
    try {
      return await send({ chatId: activeId, body }).unwrap()
    } catch (e) {
      setError(describeError(e))
      return null
    }
  }

  async function openPicker() {
    setAttachOpen(false)
    setPicker([])
    setPicker(await loadMine('PUBLISHED').unwrap().catch(() => []))
  }

  function sendProduct(p: Product) {
    setPicker(null)
    void deliver({ kind: 'PRODUCT', productId: p.id })
  }

  /**
   * A photo or video goes to the API as private chat media, then a message carries it. The API
   * reads the bytes and takes JPEG, PNG, WebP (10 MB) and MP4 (50 MB); phones' HEIC photos and
   * MOV videos are refused, and the message says so before anything is sent.
   */
  async function sendMedia(file: File | undefined) {
    setAttachOpen(false)
    if (!file || !activeId) return
    // Some browsers leave `type` empty; the extension says what the file is then.
    const ext = file.name.toLowerCase().split('.').pop() ?? ''
    const kind = /^image\/(jpeg|jpg|png|webp)$/.test(file.type) || (!file.type && /^(jpe?g|png|webp)$/.test(ext)) ? 'image' : file.type === 'video/mp4' || (!file.type && ext === 'mp4') ? 'video' : null
    if (!kind) {
      const heic = /heic|heif/.test(file.type) || /^hei[cf]$/.test(ext)
      const mov = /quicktime/.test(file.type) || ext === 'mov'
      return setError(
        heic
          ? 'That photo is in HEIC, which Earth cannot read yet. On an iPhone, choose "Most compatible" under Settings › Camera › Formats, or send a screenshot of it.'
          : mov
            ? 'That video is a MOV file, which Earth cannot read yet. Export it as MP4 first.'
            : 'Use a JPG, PNG or WebP photo, or an MP4 video.',
      )
    }
    if (file.size > MAX_MEDIA_BYTES[kind]) return setError(kind === 'video' ? 'Videos must be under 50 MB.' : 'Photos must be under 10 MB.')
    setBusy(true)
    setError('')
    try {
      const { id } = await uploadImage({ file, purpose: 'CHAT_MEDIA', conversationId: activeId }).unwrap()
      const sent = await deliver({ kind: 'MEDIA', uploadIds: [id] })
      // The acknowledgement has no viewing link; reading the message back brings the signed one.
      if (sent) poll({ chatId: activeId, afterSequence: String(Number(sent.sequence) - 1) })
    } catch (e) {
      const problem = toApiError(e)
      setError(
        problem.status === 413
          ? 'That file is too big for the chat. Photos up to 10 MB, videos up to 50 MB.'
          : problem.status === 400 || problem.status === 422
            ? 'Earth could not read that file. Use a JPG, PNG or WebP photo, or an MP4 video.'
            : describeError(e),
      )
    } finally {
      setBusy(false)
    }
  }

  function sendText(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setDraft('')
    stopTyping()
    void deliver({ kind: 'TEXT', text: text.slice(0, 4000) })
  }

  /** "View product" on a product card: the seller's own listing opens in the dashboard, any other on the marketplace. */
  const productHref = (p: { id: string; storeId: string }) => (store && p.storeId === store.id ? `/dashboard/products/${p.id}` : `/marketplace/${p.id}`)

  function bubble(m: ChatMessage, name: string) {
    const mine = m.senderId === me
    const p = m.payload
    if ('invoice' in p) {
      const inv = p.invoice
      return (
        <div className={`flex ${mine ? 'justify-end' : ''}`}>
          <div className="w-[368px] max-w-full rounded-[16px] bg-white overflow-hidden shadow-[0_8px_30px_rgba(16,22,4,0.06)]">
            <div className="flex items-center gap-[12px] bg-[#edf7f3] p-[14px]">
              <span className="flex items-center justify-center size-[32px] rounded-[10px] bg-white">
                <img src={receiptIcon} alt="" className="size-[16px]" />
              </span>
              <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                <p className="text-[#101604] text-[12px] leading-[15px]" style={jakarta(700)}>
                  Invoice #{inv.invoiceNumber}
                </p>
                <p className="text-[#807e7e] text-[11px] leading-[14px] truncate" style={jakarta(400)}>
                  {inv.summary.map((s) => `${s.quantity} × ${s.name}`).join(' · ')}
                </p>
              </div>
              {inv.paid && (
                <span className="flex items-center gap-[4px] rounded-[30px] bg-[#aee74a] px-[8px] py-[4px] text-[#0c2310] text-[11px] leading-[14px]" style={jakarta(600)}>
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
                  {nairaFromMinor(inv.amount).replace(/\.00$/, '')}
                </p>
              </div>
              <button type="button" onClick={() => navigate(`/dashboard/orders/${inv.orderId}`)} className="text-[#007c53] text-[12px] leading-[15px]" style={jakarta(600)}>
                View order
              </button>
            </div>
          </div>
        </div>
      )
    }
    if ('product' in p) {
      const prod = p.product
      return (
        <div className={`flex ${mine ? 'justify-end' : ''}`}>
          <div className="w-[423px] max-w-full rounded-[16px] bg-white p-[16px] shadow-[0_8px_30px_rgba(16,22,4,0.06)] flex items-center gap-[14px] max-sm:flex-wrap">
            <img src={prod.image ?? productThumb} alt="" className="size-[48px] rounded-[12px] object-cover shrink-0" />
            <div className="flex flex-col gap-[4px] flex-1 min-w-0">
              <p className="text-[#101604] text-[14px] leading-[20px] truncate" style={jakarta(600)}>
                {prod.name}
              </p>
              <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                Sold by {prod.storeId === active?.storeId ? active.storeName : 'the store'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-[4px] shrink-0">
              <p className="text-[#101604] text-[14px] leading-[18px]" style={jakarta(700)}>
                {nairaFromMinor(prod.price)}
              </p>
              <button type="button" onClick={() => navigate(productHref(prod))} className="flex items-center gap-[8px] text-[#177b4d] text-[10px] leading-[13px]" style={jakarta(600)}>
                View product
                <img src={arrowRightIcon} alt="" className="size-[16px]" />
              </button>
            </div>
          </div>
        </div>
      )
    }
    if ('assets' in p) {
      return (
        <div className={`flex items-end gap-[12px] ${mine ? 'justify-end' : ''}`}>
          {!mine && <Avatar name={name} size={40} />}
          <div className={`flex flex-col gap-[4px] ${mine ? 'items-end' : ''}`}>
            {p.assets.map((a) => (
              <div key={a.id} className="relative h-[232px] w-[230px] overflow-hidden rounded-[16px] bg-[#f7f7f7] flex items-center justify-center">
                {/* The link is signed for about a minute from the read; the message itself is kept and reread on the next open. */}
                {!a.url ? (
                  <p className="px-[16px] text-center text-[#807e7e] text-[12px] leading-[16px]" style={jakarta(400)}>
                    {a.contentType.startsWith('video/') ? 'Video' : 'Photo'} · reopen the chat to view
                  </p>
                ) : a.contentType.startsWith('video/') ? (
                  <video src={a.url} className="size-full object-cover" controls muted playsInline />
                ) : (
                  <img src={a.url} alt="" className="size-full object-cover" />
                )}
              </div>
            ))}
            <span className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(400)}>
              {timeOf(m.createdAt)}
            </span>
          </div>
        </div>
      )
    }
    return (
      <div className={`flex items-end gap-[12px] ${mine ? 'justify-end' : ''}`}>
        {!mine && <Avatar name={name} size={40} />}
        <div className={`flex flex-col gap-[4px] max-w-[420px] max-md:max-w-[85%] ${mine ? 'items-end' : ''}`}>
          <div className={`px-[16px] py-[12px] ${mine ? 'rounded-[16px] rounded-br-[4px] bg-[#007c53]' : 'rounded-[16px] rounded-bl-[4px] bg-[#f7f7f7]'}`}>
            <p className="text-[14px] leading-[22px] whitespace-pre-wrap break-words" style={{ ...jakarta(400), color: mine ? '#ffffff' : '#101604' }}>
              {p.text}
            </p>
          </div>
          <span className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(400)}>
            {timeOf(m.createdAt)}
          </span>
        </div>
      </div>
    )
  }

  const listEmpty = threads.error
    ? { title: 'Chats could not be loaded', copy: describeError(threads.error) }
    : list.length === 0
      ? { title: 'No messages yet', copy: seller ? 'Chats with your buyers will show up here.' : 'Chats with sellers will show up here.' }
      : { title: 'No unread messages', copy: 'You are all caught up.' }

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
          aria-busy={threads.isLoading}
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
                style={{ ...jakarta(tab === t ? 600 : 500), background: tab === t ? '#f2f8f6' : '#f7f7f7', color: tab === t ? '#007c53' : '#807e7e' }}
              >
                {t === 'all' ? 'All' : 'Unread'}
              </button>
            ))}
          </div>
          <div className="h-px w-full bg-[#f7f7f7]" />
          <ul className="flex flex-col gap-[16px] overflow-y-auto -mx-[4px] px-[4px]">
            {shown.map((c) => {
              const unread = Number(c.unreadCount)
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => open(c.id)}
                    aria-current={c.id === activeId || undefined}
                    className="flex w-full h-[80px] items-center justify-between gap-[10px] rounded-[20px] px-[16px] text-left"
                    style={{ background: c.id === activeId ? 'rgba(0,124,83,0.05)' : '#ffffff' }}
                  >
                    <div className="flex items-center gap-[12px] min-w-0">
                      <Avatar name={counterpart(c)} />
                      <div className="flex flex-col gap-[8px] min-w-0">
                        <p className="text-[#101604] text-[16px] leading-[20px] truncate" style={jakarta(600)}>
                          {counterpart(c)}
                        </p>
                        <p className="text-[#807e7e] text-[12px] leading-[15px] truncate" style={jakarta(400)}>
                          {previewOf(c)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-[6px] shrink-0">
                      <span className="text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(400)}>
                        {whenOf(c.lastMessageAt)}
                      </span>
                      {unread > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-[20px] px-[6px] rounded-full bg-[#007c53] text-white text-[11px]" style={jakarta(600)}>
                          {unread}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          {shown.length === 0 && !threads.isLoading && <EmptyBlock className="flex-1 justify-center py-[24px]" title={listEmpty.title} copy={listEmpty.copy} />}
        </section>

        {/* Chat pane */}
        <section
          className={`flex-1 min-w-0 h-full bg-white rounded-[20px] flex flex-col overflow-hidden max-lg:w-full ${mobileView === 'list' ? 'max-lg:hidden' : ''}`}
          aria-label={active ? `Chat with ${counterpart(active)}` : 'Messages'}
        >
          {!active ? (
            <EmptyBlock
              className="flex-1 justify-center p-[24px]"
              title="No conversation yet"
              copy={seller ? 'When a buyer messages you about a listing, the chat opens here.' : 'Message a seller from a listing and the chat opens here.'}
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
                  <Avatar name={counterpart(active)} />
                  <div className="flex flex-col gap-[2px] min-w-0">
                    <p className="text-[#101604] text-[16px] leading-[20px] truncate" style={jakarta(600)}>
                      {counterpart(active)}
                    </p>
                    {/* The frame shows an online dot here; the API has no presence, so the line names the listing, or says when the other side is typing. */}
                    <p className={`text-[12px] leading-[15px] truncate ${peerTyping ? 'text-[#007c53]' : 'text-[#807e7e]'}`} style={jakarta(peerTyping ? 600 : 400)} aria-live="polite">
                      {peerTyping ? 'Typing…' : active.seller.id === me ? `Buyer · ${active.storeName}` : active.seller.name}
                    </p>
                  </div>
                </div>
                {/* The call button (584:11283) stays as designed; the API shares no phone numbers, so it says so. */}
                <button type="button" disabled title="Phone numbers are not shared yet" aria-label={`Call ${counterpart(active)}`} className="flex items-center justify-center size-[36px] rounded-[18px] bg-[#f7f7f7] disabled:opacity-60">
                  <img src={callIcon} alt="" className="size-[16px]" />
                </button>
              </header>

              <div ref={pane} className="flex-1 overflow-y-auto p-[24px] flex flex-col gap-[24px] max-md:p-[16px]" aria-busy={history.isLoading}>
                {history.error && (
                  <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
                    {describeError(history.error)}
                  </p>
                )}
                {messages.map((m, i) => {
                  const chip = i === 0 || !sameDay(new Date(messages[i - 1].createdAt), new Date(m.createdAt))
                  return (
                    <div key={m.id} className="flex flex-col gap-[24px]">
                      {chip && (
                        <div className="flex justify-center">
                          <span className="rounded-[12px] bg-[#f7f7f7] px-[12px] py-[6px] text-[#807e7e] text-[11px] leading-[14px]" style={jakarta(600)}>
                            {dayLabel(m.createdAt)}
                          </span>
                        </div>
                      )}
                      {bubble(m, counterpart(active))}
                    </div>
                  )
                })}
                {!history.isLoading && !history.error && messages.length === 0 && (
                  <p className="text-center text-[#807e7e] text-[13px] leading-[20px]" style={jakarta(400)}>
                    Say hello to start the conversation.
                  </p>
                )}
              </div>

              {error && (
                <p role="alert" className="mx-[20px] mb-[8px] rounded-[12px] bg-[#fff0f0] px-[16px] py-[10px] text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
                  {error}
                </p>
              )}
              <form onSubmit={sendText} className="flex items-center gap-[12px] h-[88px] px-[20px] border-t border-[#f7f7f7] shrink-0">
                <div ref={attachRef} className="relative shrink-0">
                  <button
                    type="button"
                    aria-label="Attach"
                    aria-haspopup="menu"
                    aria-expanded={attachOpen}
                    disabled={busy}
                    onClick={() => setAttachOpen((o) => !o)}
                    className="flex items-center justify-center size-[48px] rounded-full bg-[#f7f7f7] disabled:opacity-60"
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
                          Photo or video
                        </span>
                      </button>
                    </div>
                  )}
                  <input id="msg-file" type="file" accept="image/jpeg,image/png,image/webp,video/mp4" className="sr-only" onChange={(e) => sendMedia(e.target.files?.[0])} />
                </div>
                <input
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value)
                    if (e.target.value) noteTyping()
                    else stopTyping()
                  }}
                  placeholder={busy ? 'Sending…' : 'Type a message...'}
                  aria-label="Message"
                  maxLength={4000}
                  className="flex-1 min-w-0 h-[48px] rounded-[24px] bg-[#f7f7f7] px-[16px] text-[14px] leading-[18px] text-[#101604] outline-none placeholder:text-[#807e7e]"
                  style={jakarta(400)}
                />
                <button type="submit" aria-label="Send" disabled={sending.isLoading || !draft.trim()} className="flex items-center justify-center size-[48px] rounded-full bg-[#007c53] shrink-0 disabled:opacity-60">
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
                <MenuItem key={p.id} label={`${p.productName ?? 'Product'} · ${nairaFromMinor(p.price ?? 0)}`} selected={false} onSelect={() => sendProduct(p)} />
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
    </DashboardLayout>
  )
}
