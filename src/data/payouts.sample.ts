import type { Payout } from './payouts'

/**
 * Sample payout figures and transactions (payout 592:15295). Not shown unless the development
 * switch in ./sample.ts is on.
 */
export const samplePaid = 140986.85
export const samplePending = 65382.62
export const sampleProgress = { current: 1_000_000, inProgress: 650_000, goodOrders: 7, buyers: 4 }

const rows: [string, string, string, number, number, number, number][] = [
  ['EA-0850-0123', 'Adaora N.', 'Oct 5, 2026', 24000, 1087.5, 1087.5, 24000],
  ['EA-0862-0456', 'Ethan K.', 'Oct 4, 2026', 15000, 620.5, 620.5, 15000],
  ['EA-0876-0102', 'Ngozi E.', 'Oct 3, 2026', 18500, 875, 875, 2500],
  ['EA-0877-0115', 'Tunde B.', 'Oct 2, 2026', 12000, 473.5, 473.5, 2500],
  ['EA-0878-0130', 'Blessing O.', 'Oct 1, 2026', 9900, 1270.5, 1270.5, 0],
  ['EA-0879-0144', 'Chidi N.', 'Sep 30, 2026', 26000, 870.5, 870.5, 2500],
  ['EA-0880-0158', 'Fatima B.', 'Sep 29, 2026', 7400, 982.48, 982.48, 2500],
  ['EA-0881-0167', 'Emeka O.', 'Sep 28, 2026', 21000, 1087.5, 1087.5, 0],
  ['EA-0882-0173', 'Grace A.', 'Sep 27, 2026', 6800, 620.5, 620.5, 2500],
  ['EA-0883-0188', 'Ibrahim M.', 'Sep 26, 2026', 14200, 875, 875, 2500],
  ['EA-0884-0191', 'Kemi A.', 'Sep 25, 2026', 48000, 473.5, 473.5, 0],
  ['EA-0885-0204', 'David O.', 'Sep 24, 2026', 16500, 1270.5, 1270.5, 2500],
]

export const samplePayouts: Payout[] = rows.map(([orderId, buyer, date, amount, commission, vat, deliveryFee]) => ({
  orderId,
  buyer,
  date,
  amount,
  commission,
  vat,
  deliveryFee,
}))
