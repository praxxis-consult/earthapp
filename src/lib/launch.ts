/**
 * Whether a buyer can pay. Earth's Paystack account is still in test mode, so until launch day
 * the app lets people sign up, open a store, list, browse, fill a cart and chat, but never starts
 * a payment: no order is created and no checkout reaches the API, so nothing can be "paid" with a
 * test card and no seller ships against it. Set `VITE_PAYMENTS_LIVE=true` in the build environment
 * (Vercel) and redeploy to open checkout. Nothing else changes: every account, store, listing and
 * cart made before that day carries straight over, and nobody signs up twice.
 */
export const PAYMENTS_LIVE = import.meta.env.VITE_PAYMENTS_LIVE === 'true'
