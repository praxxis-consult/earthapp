import { useCallback, useMemo } from 'react'
import { useAuth } from '../feature/authentication/useAuth'
import { useUpdateMeMutation } from '../feature/authentication/authApiSlice'
import { forgetSignupAddress } from './signupAddress'
import { useAddAddressMutation, useListAddressesQuery, useRemoveAddressMutation, useUpdateAddressMutation, type ApiAddress } from '../feature/accounts/addressesApiSlice'
import type { DeliveryAddress } from '../feature/delivery/deliveryApiSlice'

/** A saved address as the pages use it: the delivery fields flat, with the API's id, version, label and default flag. */
export type SavedAddress = DeliveryAddress & { id: string; version: number; label: string | null; isDefault: boolean }

export const flatten = (a: ApiAddress): SavedAddress => ({ ...a.address, country: 'NG', id: a.id, version: a.version, label: a.label, isDefault: a.isDefault })

/** The choice on the checkout's address step: a saved address by id, or a new one typed there. */
export const NEW_ADDRESS = 'new'

/** The address the carriers get: the saved one picked, or the typed one. */
export function resolveAddress(saved: SavedAddress[], picked: string, typed: DeliveryAddress): DeliveryAddress {
  const s = picked === NEW_ADDRESS ? undefined : saved.find((a) => a.id === picked)
  if (!s) return typed
  return { country: 'NG', region: s.region, area: s.area, street: s.street, landmark: s.landmark, postalCode: s.postalCode, firstName: s.firstName, lastName: s.lastName, phone: s.phone, email: s.email }
}

/** "7 Adebola Street, Surulere, Lagos" as the list shows it. */
export const addressLine = (a: DeliveryAddress) => [a.street, a.area, a.region].filter(Boolean).join(', ')

/** When the default is removed, the first remaining address takes over (the API asks for its id). */
export const replacementFor = (list: SavedAddress[], id: string): string | undefined => {
  const gone = list.find((a) => a.id === id)
  if (!gone?.isDefault) return undefined
  return list.find((a) => a.id !== id)?.id
}

const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)

const EMPTY: SavedAddress[] = []

/**
 * The buyer's delivery addresses (Account settings, "Delivery addresses"), on the API since
 * 25 October: they follow the buyer to another device, and the default one starts the checkout
 * off. Every write answers a promise; the page shows what went wrong.
 */
export function useAddresses() {
  const { status, account } = useAuth()
  const signedIn = status === 'authenticated'
  const hasDraft = Boolean(account?.signupAddressDraft)
  const [updateMe] = useUpdateMeMutation()
  const query = useListAddressesQuery(undefined, { skip: !signedIn })
  const [addMutation] = useAddAddressMutation()
  const [updateMutation] = useUpdateAddressMutation()
  const [removeMutation] = useRemoveAddressMutation()
  const list = useMemo(() => (query.data ? query.data.map(flatten) : EMPTY), [query.data])
  const versionOf = useCallback((id: string) => list.find((a) => a.id === id)?.version ?? 0, [list])

  const add = useCallback(
    async (a: DeliveryAddress, isDefault?: boolean) => {
      const saved = await addMutation({ id: newId(), label: null, address: a, isDefault: Boolean(isDefault) || list.length === 0 }).unwrap()
      // A complete address is saved: the sign-up draft has done its job, here and on the account.
      forgetSignupAddress()
      if (hasDraft) updateMe({ signupAddressDraft: null }).unwrap().catch(() => {})
      return saved
    },
    [addMutation, list.length, hasDraft, updateMe],
  )
  const update = useCallback((id: string, a: DeliveryAddress) => updateMutation({ id, expectedVersion: versionOf(id), address: a }).unwrap(), [updateMutation, versionOf])
  const makeDefault = useCallback((id: string) => updateMutation({ id, expectedVersion: versionOf(id), isDefault: true }).unwrap(), [updateMutation, versionOf])
  const remove = useCallback((id: string) => removeMutation({ id, expectedVersion: versionOf(id), replacementAddressId: replacementFor(list, id) }).unwrap(), [removeMutation, versionOf, list])

  return { list, defaultAddress: list.find((a) => a.isDefault) ?? null, loading: signedIn && query.isLoading, error: query.error, add, update, makeDefault, remove }
}
