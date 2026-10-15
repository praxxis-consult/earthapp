import type { Referral } from './referrals'

/** Sample sign-ups (referral 599:19337's Activities rows). Not shown unless the development switch in ./sample.ts is on. */
export const sampleReferrals: Referral[] = [
  ['Yemisi Adewale', 'aishaabdullahi85@yahoo.com', 'Buyer', 'Oct 25, 2023'],
  ['Onyeka Ibe', 'chinedueze79@gmail.com', 'Seller', 'Nov 30, 2023'],
  ['Ronke Ojo', 'emekanwosu77@gmail.com', 'Buyer', 'Jan 10, 2024'],
  ['Femi Olayemi', 'ogechiokafor88@yahoo.com', 'Buyer', 'Nov 1, 2023'],
  ['Morenike Adeyemi', 'tobiadeyemi99@gmail.com', 'Seller', 'Dec 1, 2023'],
  ['Kunle Adeyemi', 'chikaobi92@gmail.com', 'Buyer', 'Oct 10, 2023'],
  ['Olabisi Owolabi', 'fatimai123@yahoo.com', 'Buyer', 'Nov 5, 2023'],
  ['Sani Lawal', 'adaobiokoro87@yahoo.com', 'Seller', 'Dec 15, 2023'],
  ['Opeyemi Ogunbiyi', 'ngozionuoha80@yahoo.com', 'Buyer', 'Oct 15, 2023'],
  ['Khadija Abubakar', 'ibrahimsuleiman95@gmail.com', 'Buyer', 'Oct 5, 2023'],
  ['Tunde Bakare', 'tundeb@gmail.com', 'Seller', 'Sep 30, 2023'],
  ['Amaka Johnson', 'amakaj@yahoo.com', 'Buyer', 'Sep 22, 2023'],
].map(([name, email, as, date]) => ({ name, email, as: as as 'Buyer' | 'Seller', date }))
