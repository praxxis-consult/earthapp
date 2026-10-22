import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { countryName } from '../../data/locations'
import { ALL_CATEGORIES, GLOBAL, filterListings, paginate, type Sort } from '../../lib/browse'
import { useGetCategoriesQuery } from '../stores/storesApiSlice'
import { EVERYWHERE, useListCatalogQuery, useListStoreQuery, type Place } from './catalogApiSlice'

/**
 * Browsing the catalogue, shared by the public marketplace and the buyer dashboard's: the place
 * (every store, a country, a region), one store when a "Share my store" link lands with
 * `?store=`, the search box (started from `?q=` by the dashboard's search), the category pill,
 * the sort and the page. Listings come from the public catalogue, newest first.
 */
export function useBrowse(perPage: number) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState(ALL_CATEGORIES)
  const [search, setSearchState] = useState(() => searchParams.get('q') ?? '')
  const [place, setPlaceState] = useState<Place>(EVERYWHERE)
  const [sort, setSortState] = useState<Sort>('Most recent')
  const [page, setPage] = useState(1)
  const storeId = searchParams.get('store') ?? ''

  const catalogListing = useListCatalogQuery(place, { skip: Boolean(storeId) })
  const storeListing = useListStoreQuery(storeId, { skip: !storeId })
  const listing = storeId ? storeListing : catalogListing
  const store = storeId ? (storeListing.currentData?.store ?? null) : null
  const { data: categoryList = [] } = useGetCategoriesQuery()
  // `currentData` is for the current place only, so changing the picker shows the skeleton, not the last place's cards.
  const loading = listing.isFetching || (listing.currentData === undefined && !listing.error)
  const products = useMemo(() => {
    if (loading) return []
    if (storeId) return storeListing.currentData?.listings ?? []
    return catalogListing.currentData ?? []
  }, [loading, storeId, storeListing.currentData, catalogListing.currentData])
  const failed = Boolean(listing.error)

  const placeLabel = (p: Place) => (p.region ? `${p.region}, ${countryName(p.country)}` : p.country ? countryName(p.country) : GLOBAL)
  const shownPlace = store ? placeLabel({ country: store.businessAddress.country, region: store.businessAddress.region }) : placeLabel(place)
  const categories = useMemo(() => [ALL_CATEGORIES, ...categoryList.map((c) => c.name)], [categoryList])

  const filtered = useMemo(() => filterListings(products, { category, search, sort }), [products, category, search, sort])
  const paged = paginate(filtered, page, perPage)
  const emptyText = loading
    ? ''
    : failed
      ? 'We could not load the marketplace. Check your connection and try again.'
      : storeId
        ? 'This store has nothing listed yet.'
        : place.country
          ? `No listings in ${placeLabel(place)} match your filters yet.`
          : 'No listings match your filters yet.'

  return {
    // what is shown
    loading,
    failed,
    emptyText,
    listings: paged.items,
    total: filtered.length,
    page: paged.page,
    pageCount: paged.pageCount,
    setPage,
    // the controls
    search,
    setSearch: (q: string) => {
      setSearchState(q)
      setPage(1)
    },
    place,
    shownPlace,
    setPlace: (p: Place) => {
      setPlaceState(p)
      setPage(1)
    },
    sort,
    setSort: (s: Sort) => {
      setSortState(s)
      setPage(1)
    },
    categories,
    category,
    setCategory: (c: string) => {
      setCategory(c)
      setPage(1)
    },
    // one store
    storeId,
    store,
    showEveryStore: () => setSearchParams({}),
  }
}

export type Browse = ReturnType<typeof useBrowse>
