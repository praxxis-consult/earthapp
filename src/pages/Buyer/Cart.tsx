import { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import CheckoutDialog from '../../components/ui/CheckoutDialog'
import EmptyBlock from '../../components/ui/EmptyBlock'
import { useAuth } from '../../feature/authentication/useAuth'
import { useCart, type CartGroup } from '../../lib/cart'
import { naira } from '../../lib/productView'
import arrowRight from '../../assets/icons/rc-arrow-right.svg'
import { jakarta, CTA_BG, CTA_TEXT_BG } from '../../utils/styles'

/**
 * The buyer's cart (the Cart entry of the buyer menu, 859:41006, and the cart button on a
 * listing, 818:11400). There is no frame for the page, so it follows the dashboard's list pages:
 * the 24/32 title and 16/24 intro, then one white card per store with its lines, since a
 * delivery quote, and so an order, covers one store at a time. The lines live in this browser
 * until the API holds a cart.
 */
export default function Cart() {
  const { account } = useAuth()
  const cart = useCart(account?.id)
  const [checking, setChecking] = useState<CartGroup | null>(null)
  const money = (n: number) => naira(n).replace(/\.00$/, '')

  return (
    <DashboardLayout>
      <div className="px-[24px] pt-[40px] pb-[24px] flex flex-col gap-[24px] md:min-h-full max-md:px-[16px] max-md:pt-[24px]">
        <div className="flex flex-col gap-[8px] max-w-[600px]">
          <h1 className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
            Cart
          </h1>
          <p className="text-[#807e7e] text-[16px] leading-[24px]" style={jakarta(400)}>
            Listings you mean to order. Each store is checked out on its own, since one carrier collects from one store. The cart is kept on this device.
          </p>
        </div>

        {cart.groups.length === 0 ? (
          <div className="bg-white rounded-[20px] p-[24px] flex flex-col md:flex-1 max-md:p-[16px]">
            <EmptyBlock
              className="justify-center md:flex-1 py-[40px] max-md:py-[24px]"
              title="Your cart is empty"
              copy="Open a listing on the marketplace and tap the cart button; it will wait for you here."
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
          cart.groups.map((g) => (
            <section key={g.storeId} aria-label={`Cart, ${g.storeName}`} className="bg-white rounded-[20px] p-[24px] flex flex-col gap-[16px] max-md:p-[16px]">
              <div className="flex items-center justify-between gap-[16px] max-md:flex-col max-md:items-start">
                <div className="flex flex-col gap-[2px] min-w-0">
                  <h2 className="text-[#101604] text-[18px] leading-[24px] truncate" style={jakarta(600)}>
                    {g.storeName}
                  </h2>
                  <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                    {g.lines.length} {g.lines.length === 1 ? 'listing' : 'listings'} · {g.lines[0].listing.location}
                  </p>
                </div>
                <p className="text-[#807e7e] text-[14px] leading-[24px] shrink-0" style={jakarta(400)}>
                  Goods{' '}
                  <span className="text-[#101604] text-[16px]" style={jakarta(700)}>
                    {money(g.goodsTotal)}
                  </span>
                </p>
              </div>

              <ul className="flex flex-col">
                {g.lines.map((l) => {
                  const p = l.listing
                  const atMin = l.quantity <= p.moq
                  const atMax = l.quantity >= Math.max(p.available, p.moq)
                  return (
                    <li key={p.id} className="flex items-center gap-[16px] border-t border-[#f7f7f7] py-[16px] first:border-t-0 first:pt-0 max-md:flex-wrap">
                      <Link to={`/dashboard/marketplace/${p.id}`} className="size-[64px] shrink-0 overflow-hidden rounded-[12px] bg-[#eeeeee]">
                        {p.image && <img src={p.image} alt="" className="size-full object-cover" />}
                      </Link>
                      <div className="flex flex-1 min-w-0 flex-col gap-[2px]">
                        <Link to={`/dashboard/marketplace/${p.id}`} className="text-[#101604] text-[16px] leading-[24px] truncate" style={jakarta(600)}>
                          {p.title}
                        </Link>
                        <p className="text-[#807e7e] text-[12px] leading-[20px]" style={jakarta(400)}>
                          {p.price} per {p.unit} · minimum {p.moq} · {p.available} available
                        </p>
                      </div>
                      <div className="flex h-[40px] items-center justify-between rounded-full bg-[#f7f7f7] px-[12px] w-[132px] shrink-0" aria-label={`Quantity of ${p.title}`}>
                        <button type="button" onClick={() => cart.setQuantity(p.id, l.quantity - 1)} disabled={atMin} aria-label="Decrease quantity" className="text-[#807e7e] text-[20px] leading-[24px] disabled:opacity-40" style={jakarta(500)}>
                          −
                        </button>
                        <span className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)} aria-live="polite">
                          {l.quantity}
                        </span>
                        <button type="button" onClick={() => cart.setQuantity(p.id, l.quantity + 1)} disabled={atMax} aria-label="Increase quantity" className="text-[#807e7e] text-[20px] leading-[24px] disabled:opacity-40" style={jakarta(500)}>
                          +
                        </button>
                      </div>
                      <p className="w-[120px] shrink-0 text-right text-[#101604] text-[16px] leading-[24px] max-md:w-auto max-md:flex-1" style={jakarta(700)}>
                        {money(l.quantity * p.priceNum)}
                      </p>
                      <button type="button" onClick={() => cart.remove(p.id)} className="shrink-0 text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(500)}>
                        Remove
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="flex items-center justify-between gap-[16px] border-t border-[#f7f7f7] pt-[16px] max-md:flex-col max-md:items-stretch">
                <p className="text-[#807e7e] text-[13px] leading-[20px]" style={jakarta(400)}>
                  Delivery is quoted by the carriers at checkout; you pay after choosing one.
                </p>
                <button
                  type="button"
                  onClick={() => setChecking(g)}
                  disabled={g.lines.some((l) => l.listing.available <= 0)}
                  className="flex h-[48px] items-center justify-center gap-[8px] rounded-[30px] bg-[#007c53] px-[24px] text-white text-[14px] leading-[18px] disabled:opacity-60"
                  style={jakarta(500)}
                >
                  Place order
                  <img src={arrowRight} alt="" className="size-[16px]" />
                </button>
              </div>
            </section>
          ))
        )}
      </div>

      {checking && (
        <CheckoutDialog
          lines={checking.lines.map((l) => ({ listing: l.listing, quantity: l.quantity }))}
          onOrdered={() => cart.clearStore(checking.storeId)}
          onClose={() => setChecking(null)}
        />
      )}
    </DashboardLayout>
  )
}
