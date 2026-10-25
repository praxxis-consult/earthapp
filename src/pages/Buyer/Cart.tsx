import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import CartCheckoutDialog, { type CartStoreGroup } from '../../components/ui/CartCheckoutDialog'
import EmptyBlock from '../../components/ui/EmptyBlock'
import Skeleton from '../../components/ui/Skeleton'
import { useCart } from '../../feature/cart/useCart'
import type { CartItem } from '../../feature/cart/cartApiSlice'
import { useGetListingQuery } from '../../feature/marketplace/catalogApiSlice'
import type { Listing } from '../../lib/catalog'
import { naira } from '../../lib/productView'
import { describeError } from '../../services/earthApi'
import arrowRight from '../../assets/icons/rc-arrow-right.svg'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

const money = (n: number) => naira(n).replace(/\.00$/, '')

/**
 * The buyer's cart (the Cart entry of the buyer menu, 859:41006, and the cart button on a
 * listing, 818:11400). The lines live on the API (`GET /cart`, 25 October), so they follow the
 * buyer to another device; each line reads its listing for the photo, price and bounds. There is
 * no frame for the page, so it follows the dashboard's list pages: the 24/32 title and 16/24
 * intro, then one white card per store. One checkout pays for every store at once; each store
 * still gets its own order.
 */
export default function Cart() {
  const cart = useCart()
  const [listings, setListings] = useState<Record<string, Listing | null>>({})
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')
  const onListing = useCallback((id: string, l: Listing | null) => setListings((m) => (m[id] === l ? m : { ...m, [id]: l })), [])
  const act = (p: Promise<unknown>) => {
    setError('')
    p.catch((e) => setError(describeError(e)))
  }

  // The dialog needs every line's listing; a line whose listing is gone from the marketplace holds the checkout until it is removed.
  const groups: CartStoreGroup[] | null = useMemo(() => {
    const out: CartStoreGroup[] = []
    for (const g of cart.groups) {
      const lines = g.items.map((i) => ({ listing: listings[i.productId], quantity: i.quantity }))
      if (lines.some((l) => l.listing === undefined || l.listing === null)) return null
      const first = lines[0].listing as Listing
      out.push({ storeId: g.storeId, storeName: first.store.storeName, pickupPlace: `${first.store.businessAddress.area}, ${first.store.businessAddress.region}`, lines: lines as CartStoreGroup['lines'] })
    }
    return out
  }, [cart.groups, listings])
  const gone = cart.items.some((i) => listings[i.productId] === null)
  const goodsTotal = cart.items.reduce((n, i) => n + (listings[i.productId]?.priceNum ?? 0) * i.quantity, 0)

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[24px] flex flex-col gap-[24px] md:min-h-full max-md:px-[16px] max-md:pt-[24px]">
        <div className="flex flex-col gap-[8px] max-w-[600px]">
          <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Cart
          </h1>
          <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
            Listings you mean to order. One payment covers everything here; each store gets its own order, delivered by a carrier or collected by you.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
            {error}
          </p>
        )}

        {cart.loading ? (
          <div className="bg-white rounded-[20px] p-[24px] flex flex-col gap-[16px] max-md:p-[16px]" aria-busy="true">
            <Skeleton className="h-[24px] w-[200px]" />
            <Skeleton className="h-[64px] w-full" />
            <Skeleton className="h-[64px] w-full" />
          </div>
        ) : cart.error ? (
          <div className="bg-white rounded-[20px] p-[24px] max-md:p-[16px]">
            <p role="alert" className="text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
              {describeError(cart.error)}{' '}
              <button type="button" onClick={() => cart.refetch()} className="text-[#007c53]" style={jakarta(500)}>
                Try again
              </button>
            </p>
          </div>
        ) : cart.groups.length === 0 ? (
          <div className="bg-white rounded-[20px] p-[24px] flex flex-col md:flex-1 max-md:p-[16px]">
            <EmptyBlock
              className="justify-center md:flex-1 py-[40px] max-md:py-[24px]"
              title="Your cart is empty"
              copy="Open a listing on the marketplace and tap the cart button; it will wait for you here, on any device."
              action={
                <Link to="/dashboard/marketplace" className="flex h-[48px] items-center justify-center rounded-[30px] px-[24px]" style={{ backgroundImage: CTA_BG }}>
                  <span className="bg-clip-text text-[14px] leading-[18px] text-transparent" style={{ ...jakarta(500), backgroundImage: CTA_TEXT_BG }}>
                    Browse marketplace
                  </span>
                </Link>
              }
            />
          </div>
        ) : (
          <>
            {cart.groups.map((g) => {
              const first = listings[g.items[0].productId]
              const storeGoods = g.items.reduce((n, i) => n + (listings[i.productId]?.priceNum ?? 0) * i.quantity, 0)
              return (
                <section key={g.storeId} aria-label={`Cart, ${first?.store.storeName ?? 'store'}`} className="bg-white rounded-[20px] p-[24px] flex flex-col gap-[16px] max-md:p-[16px]">
                  <div className="flex items-center justify-between gap-[16px] max-md:flex-col max-md:items-start">
                    <div className="flex flex-col gap-[2px] min-w-0">
                      {first ? (
                        <h2 className="text-[#101604] text-[18px] leading-[24px] truncate" style={jakarta(600)}>
                          {first.store.storeName}
                        </h2>
                      ) : (
                        <Skeleton className="h-[24px] w-[180px]" />
                      )}
                      <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                        {g.items.length} {g.items.length === 1 ? 'listing' : 'listings'}
                        {first ? ` · ${first.location}` : ''}
                      </p>
                    </div>
                    <p className="text-[#807e7e] text-[14px] leading-[24px] shrink-0" style={jakarta(400)}>
                      Goods{' '}
                      <span className="text-[#101604] text-[16px]" style={jakarta(700)}>
                        {money(storeGoods)}
                      </span>
                    </p>
                  </div>
                  <ul className="flex flex-col">
                    {g.items.map((item) => (
                      <CartLineRow key={item.productId} item={item} onListing={onListing} onQuantity={(n, bounds) => act(cart.setQuantity(item.productId, n, bounds))} onRemove={() => act(cart.remove(item.productId))} />
                    ))}
                  </ul>
                </section>
              )
            })}

            <div className="bg-white rounded-[20px] p-[24px] flex items-center justify-between gap-[16px] max-md:p-[16px] max-md:flex-col max-md:items-stretch">
              <div className="flex flex-col gap-[2px]">
                <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
                  Goods across {cart.groups.length} {cart.groups.length === 1 ? 'store' : 'stores'}{' '}
                  <span className="text-[#101604] text-[16px]" style={jakarta(700)}>
                    {money(goodsTotal)}
                  </span>
                </p>
                <p className="text-[#807e7e] text-[13px] leading-[20px]" style={jakarta(400)}>
                  {gone ? 'A listing in the cart is no longer on the marketplace. Remove it to continue.' : 'Delivery is quoted by the carriers at checkout, or you collect from the seller; you pay after choosing.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCheckingOut(true)}
                disabled={!groups || gone}
                className="flex h-[48px] items-center justify-center gap-[8px] rounded-[30px] bg-[#007c53] px-[24px] text-white text-[14px] leading-[18px] disabled:opacity-60"
                style={jakarta(500)}
              >
                Check out
                <img src={arrowRight} alt="" className="size-[16px]" />
              </button>
            </div>
          </>
        )}
      </div>

      {checkingOut && groups && <CartCheckoutDialog groups={groups} cartVersion={cart.version} onClose={() => setCheckingOut(false)} />}
    </DashboardLayout>
  )
}

/** One line: its listing from the marketplace (photo, price, bounds), the quantity stepper and Remove. */
function CartLineRow({ item, onListing, onQuantity, onRemove }: { item: CartItem; onListing: (id: string, l: Listing | null) => void; onQuantity: (n: number, bounds: Pick<Listing, 'moq' | 'available'>) => void; onRemove: () => void }) {
  const { data: p, isLoading, error } = useGetListingQuery(item.productId)
  // Report the listing up once it is known (null when the marketplace no longer has it).
  useEffect(() => {
    if (p !== undefined && !isLoading) onListing(item.productId, p)
  }, [p, isLoading, item.productId, onListing])
  if (isLoading)
    return (
      <li className="flex items-center gap-[16px] border-t border-[#f7f7f7] py-[16px] first:border-t-0 first:pt-0" aria-busy="true">
        <Skeleton className="size-[64px] rounded-[12px]" />
        <Skeleton className="h-[20px] flex-1" />
      </li>
    )
  if (!p)
    return (
      <li className="flex items-center gap-[16px] border-t border-[#f7f7f7] py-[16px] first:border-t-0 first:pt-0 max-md:flex-wrap">
        <div className="size-[64px] shrink-0 rounded-[12px] bg-[#eeeeee]" />
        <p className="flex-1 min-w-0 text-[#807e7e] text-[14px] leading-[20px]" style={jakarta(400)}>
          {error ? describeError(error) : 'This listing is no longer on the marketplace.'}
        </p>
        <button type="button" onClick={onRemove} className="shrink-0 text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(500)}>
          Remove
        </button>
      </li>
    )
  const atMin = item.quantity <= p.moq
  const atMax = item.quantity >= Math.max(p.available, p.moq)
  return (
    // On a phone the photo and the words take the first row; the stepper, the line total and Remove wrap onto a second one.
    <li className="flex items-center gap-[16px] border-t border-[#f7f7f7] py-[16px] first:border-t-0 first:pt-0 max-md:flex-wrap max-md:gap-y-[12px]">
      <Link to={`/dashboard/marketplace/${p.id}`} className="size-[64px] shrink-0 overflow-hidden rounded-[12px] bg-[#eeeeee]">
        {p.image && <img src={p.image} alt="" className="size-full object-cover" />}
      </Link>
      <div className="flex flex-1 min-w-0 flex-col gap-[2px] max-md:basis-[calc(100%-80px)]">
        <Link to={`/dashboard/marketplace/${p.id}`} className="text-[#101604] text-[16px] leading-[24px] truncate" style={jakarta(600)}>
          {p.title}
        </Link>
        <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
          {p.price} per {p.unit} · minimum {p.moq} · {p.available} available
        </p>
      </div>
      <div className="flex h-[40px] items-center justify-between rounded-full bg-[#f7f7f7] px-[12px] w-[132px] shrink-0" aria-label={`Quantity of ${p.title}`}>
        <button type="button" onClick={() => onQuantity(item.quantity - 1, p)} disabled={atMin} aria-label="Decrease quantity" className="text-[#807e7e] text-[20px] leading-[24px] disabled:opacity-40 max-md:flex max-md:size-[44px] max-md:items-center max-md:justify-center max-md:-ml-[12px]" style={jakarta(500)}>
          −
        </button>
        <span className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)} aria-live="polite">
          {item.quantity}
        </span>
        <button type="button" onClick={() => onQuantity(item.quantity + 1, p)} disabled={atMax} aria-label="Increase quantity" className="text-[#807e7e] text-[20px] leading-[24px] disabled:opacity-40 max-md:flex max-md:size-[44px] max-md:items-center max-md:justify-center max-md:-mr-[12px]" style={jakarta(500)}>
          +
        </button>
      </div>
      <p className="w-[120px] shrink-0 text-right text-[#101604] text-[16px] leading-[24px] max-md:w-auto max-md:flex-1" style={jakarta(700)}>
        {money(item.quantity * p.priceNum)}
      </p>
      <button type="button" onClick={onRemove} className="shrink-0 text-[#b13b3b] text-[13px] leading-[20px] max-md:py-[10px] max-md:-my-[10px]" style={jakarta(500)}>
        Remove
      </button>
    </li>
  )
}
