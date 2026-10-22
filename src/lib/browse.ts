import type { Listing } from './catalog'

/**
 * Narrowing and ordering the marketplace's listings, shared by the public marketplace and the
 * buyer dashboard's: the category pill, the search box (name, place or store) and the sort.
 */

/** The first category pill: everything the catalogue holds. */
export const ALL_CATEGORIES = 'All Resources'
/** The location picker's first choice: every LIVE store on the marketplace. */
export const GLOBAL = 'Global'

export const SORT_OPTIONS = ['Most recent', 'Price: Low to High', 'Price: High to Low'] as const
export type Sort = (typeof SORT_OPTIONS)[number]

export interface BrowseFilters {
  category: string
  search: string
  sort: Sort
}

export function filterListings(products: Listing[], f: BrowseFilters): Listing[] {
  const q = f.search.trim().toLowerCase()
  return products
    .filter((p) => {
      const matchCat = f.category === ALL_CATEGORIES || p.category === f.category
      const matchSearch = q === '' || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.store.storeName.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
    .sort((a, b) => {
      if (f.sort === 'Price: Low to High') return a.priceNum - b.priceNum
      if (f.sort === 'Price: High to Low') return b.priceNum - a.priceNum
      return 0 // Most recent: the catalogue is already newest first
    })
}

/** The page's slice and the page count; a page past the end falls back to the last one. */
export function paginate<T>(items: T[], page: number, perPage: number): { items: T[]; page: number; pageCount: number } {
  const pageCount = Math.max(1, Math.ceil(items.length / perPage))
  const current = Math.min(Math.max(1, page), pageCount)
  return { items: items.slice((current - 1) * perPage, current * perPage), page: current, pageCount }
}
