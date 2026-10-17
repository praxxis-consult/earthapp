import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { stores, type Address, type IdentityType, type Onboarding, type OnboardingDraft } from '../services/earthApi'

/**
 * The seller's onboarding answers, kept in the browser between steps and saved to the API as a
 * DRAFT on every "Proceed", so a reload or a later visit picks up where they stopped. Review
 * submits the same answers with status LIVE.
 */
export interface Draft {
  storeName: string
  categoryIds: string[]
  address: Address
  identityType: IdentityType | ''
  identityNumber: string
  selfieUrl: string
  /** `verified`: the name came from the bank's own lookup and matched the seller; never sent to the API. */
  bank: { country: string; bankName: string; bankCode?: string; accountNumber: string; accountName: string; verified?: boolean }
  /** The API's optimistic-concurrency counter; 0 until the store exists. */
  version: number
  status: 'NONE' | 'DRAFT' | 'LIVE' | 'SUSPENDED'
  storeId: string
}

const EMPTY: Draft = {
  storeName: '',
  categoryIds: [],
  address: { country: '', region: '', area: '', street: '', landmark: '' },
  identityType: '',
  identityNumber: '',
  selfieUrl: '',
  bank: { country: '', bankName: '', accountNumber: '', accountName: '' },
  version: 0,
  status: 'NONE',
  storeId: '',
}

const KEY = 'earth.onboarding'
let draft: Draft = read()
let synced = false
let syncing: Promise<void> | null = null
const listeners = new Set<() => void>()

function read(): Draft {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) } : EMPTY
  } catch {
    return EMPTY
  }
}

function write(next: Draft) {
  draft = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage blocked: the draft still lives for this page */
  }
  listeners.forEach((l) => l())
}

export function updateDraft(patch: Partial<Draft>) {
  write({ ...draft, ...patch })
}

export function clearDraft() {
  write(EMPTY)
  synced = false
}

/** What the API already holds wins over stale local answers; local keeps what the API has no field for. */
function merge(local: Draft, remote: Onboarding): Draft {
  return {
    ...local,
    storeName: remote.storeName || local.storeName,
    categoryIds: remote.categoryIds?.length ? remote.categoryIds : local.categoryIds,
    address: remote.businessAddress?.country ? remote.businessAddress : local.address,
    identityType: remote.identity?.type ?? local.identityType,
    identityNumber: remote.identity?.number ?? local.identityNumber,
    selfieUrl: remote.selfieUrl ?? local.selfieUrl,
    bank: remote.bank
      ? { ...remote.bank, verified: local.bank.verified && remote.bank.accountNumber === local.bank.accountNumber && remote.bank.bankName === local.bank.bankName }
      : local.bank,
    version: remote.version,
    status: remote.status,
    storeId: remote.id,
  }
}

/** Pulls the API's copy once per page load. */
export function syncDraft(): Promise<void> {
  if (synced) return Promise.resolve()
  if (!syncing) {
    syncing = stores
      .onboarding()
      .then((remote) => {
        if (remote) write(merge(draft, remote))
        synced = true
      })
      .catch(() => {
        /* offline or signed out: the local draft stands */
      })
      .finally(() => {
        syncing = null
      })
  }
  return syncing
}

const complete = (a: Address) => Boolean(a.country && a.region && a.area && a.street)

/** The API accepts only whole sub-objects, so a half-filled step is left out of the draft. */
export function toApiDraft(d: Draft): OnboardingDraft {
  const out: OnboardingDraft = {}
  if (d.storeName) out.storeName = d.storeName
  if (d.categoryIds.length) out.categoryIds = d.categoryIds
  if (complete(d.address)) out.businessAddress = { ...d.address, landmark: d.address.landmark || 'Not provided' }
  if (d.identityType && d.identityNumber) out.identity = { type: d.identityType, number: d.identityNumber }
  if (d.selfieUrl) out.selfieUrl = d.selfieUrl
  const b = d.bank
  if (b.country && b.bankName && b.accountNumber && b.accountName)
    out.bank = { country: b.country, bankName: b.bankName, ...(b.bankCode ? { bankCode: b.bankCode } : {}), accountNumber: b.accountNumber, accountName: b.accountName }
  return out
}

/** Saves the current answers as a DRAFT; the API's version and store id come back into the draft. */
export async function saveDraft(): Promise<Onboarding> {
  const remote = await stores.saveDraft(toApiDraft(draft), draft.version)
  write(merge(draft, remote))
  return remote
}

/** Everything the API needs before a store can go LIVE, as the field names it reports back. */
export function missingForLive(d: Draft): string[] {
  const m: string[] = []
  if (!d.storeName) m.push('storeName')
  if (!d.categoryIds.length) m.push('categoryIds')
  if (!complete(d.address)) m.push('businessAddress')
  if (!(d.identityType && d.identityNumber)) m.push('identity')
  if (!d.selfieUrl) m.push('selfieUrl')
  const b = d.bank
  // The API needs the bank's code to go LIVE; it only comes with a successful name lookup.
  if (!(b.country && b.bankName && b.bankCode && b.accountNumber && b.accountName)) m.push('bank')
  return m
}

export async function goLive(): Promise<Onboarding> {
  const full = toApiDraft(draft) as Required<OnboardingDraft>
  const remote = await stores.goLive(full, draft.version)
  write(merge(draft, remote))
  return remote
}

export function useDraft() {
  const d = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => draft,
    () => EMPTY,
  )
  useEffect(() => {
    syncDraft()
  }, [])
  const update = useCallback((patch: Partial<Draft>) => updateDraft(patch), [])
  return [d, update] as const
}

/** Design labels for the identity dropdown, and the API values behind them. */
export const ID_TYPES: { label: string; value: IdentityType }[] = [
  { label: 'International Passport', value: 'PASSPORT' },
  { label: 'National ID Card', value: 'NATIONAL_ID' },
  { label: "Driver's License", value: 'DRIVERS_LICENSE' },
  { label: "Voter's Card", value: 'VOTER_ID' },
  { label: 'NIN Slip', value: 'NIN' },
]
export const idTypeLabel = (v: IdentityType | '') => ID_TYPES.find((t) => t.value === v)?.label ?? ''

/** The country list and the ISO codes the API stores live with the regions in src/data/locations.ts. */
export { COUNTRIES, COUNTRY_NAMES, countryCode, countryName } from '../data/locations'
