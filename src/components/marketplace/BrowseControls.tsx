import { useEffect, useRef, useState } from 'react'
import { COUNTRIES, countryName, regionsOf } from '../../data/locations'
import { EVERYWHERE } from '../../feature/marketplace/catalogApiSlice'
import type { Browse } from '../../feature/marketplace/useBrowse'
import { GLOBAL, SORT_OPTIONS } from '../../lib/browse'
import { jakarta } from '../../utils/styles'

export interface BrowseIcons {
  search: string
  location: string
  sort: string
  arrowDown: string
}

interface BrowseControlsProps {
  browse: Browse
  /** Each marketplace frame exports its own glyphs for these four. */
  icons: BrowseIcons
}

/**
 * The marketplace's controls, the same on the public page (175:2625) and in the buyer dashboard
 * (817:9376): the 588×48 search, the Location and Sort pills 16 apart on the right, then the
 * 40px category pills 12 apart with the count on the same line. The frames show the pills only;
 * the location menu is Global, every country, then the chosen country's regions.
 */
export default function BrowseControls({ browse, icons }: BrowseControlsProps) {
  const b = browse
  const [locationOpen, setLocationOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [menuCountry, setMenuCountry] = useState('')
  const [placeFilter, setPlaceFilter] = useState('')
  const locationRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  function closeLocation() {
    setLocationOpen(false)
    setPlaceFilter('')
  }
  function choosePlace(next: typeof EVERYWHERE) {
    b.setPlace(next)
    closeLocation()
  }
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) closeLocation()
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const q = placeFilter.trim().toLowerCase()
  const menuCountries = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES
  const menuRegions = q ? regionsOf(menuCountry).filter((r) => r.toLowerCase().includes(q)) : regionsOf(menuCountry)
  const menuRow = (selected: boolean, extra = '') =>
    `w-full text-left px-[16px] py-[10px] text-[13px] leading-[20px] hover:bg-[#f7f7f7] transition-colors ${selected ? 'text-[#007c53]' : 'text-[#101604]'} ${extra}`

  return (
    <div className="flex flex-col gap-[24px]">
      {/* Row 1: search 588×48 on the left, the two pickers 16 apart on the right */}
      <div className="flex items-center justify-between max-lg:flex-col max-lg:items-stretch max-lg:gap-[12px]">
        <label className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center px-[16px] rounded-[30px] w-[588px] max-lg:w-full">
          <img src={icons.search} alt="" className="size-[20px] shrink-0" />
          <input
            type="text"
            value={b.search}
            onChange={(e) => b.setSearch(e.target.value)}
            placeholder="Search by commodity name, location ..."
            aria-label="Search listings"
            className="bg-transparent outline-none text-[#101604] text-[13px] leading-[16px] w-full placeholder:text-[#807e7e]"
            style={jakarta(400)}
          />
        </label>

        <div className="flex gap-[16px] items-center max-md:flex-col max-md:items-stretch max-md:gap-[12px]">
          {/* Location: 187×48 hugging "Location: Global", 500 13 #807e7e */}
          <div className="relative max-md:w-full" ref={locationRef}>
            <button
              type="button"
              onClick={() => {
                if (b.storeId) return
                if (locationOpen) closeLocation()
                else {
                  setMenuCountry(b.place.country)
                  setLocationOpen(true)
                }
                setSortOpen(false)
              }}
              title={b.storeId ? 'Showing one store; choose "See every store" to browse by location' : undefined}
              aria-haspopup="listbox"
              aria-expanded={locationOpen}
              className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center justify-center px-[16px] rounded-[30px] max-md:w-full"
            >
              <img src={icons.location} alt="" className="size-[20px] shrink-0" />
              <span className="text-[13px] leading-[16px] text-[#807e7e] whitespace-nowrap" style={jakarta(500)}>
                Location: {b.shownPlace}
              </span>
              <img src={icons.arrowDown} alt="" className={`size-[16px] shrink-0 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
            </button>
            {locationOpen && (
              <div
                role="listbox"
                aria-label="Location"
                className="absolute top-[52px] left-0 bg-white border border-[#e4dede] rounded-[16px] shadow-[0px_8px_32px_rgba(0,0,0,0.1)] z-50 w-[260px] max-md:w-full flex flex-col overflow-hidden"
              >
                <div className="p-[8px] pb-0">
                  <input
                    type="text"
                    value={placeFilter}
                    onChange={(e) => setPlaceFilter(e.target.value)}
                    placeholder={menuCountry ? `Find a region in ${countryName(menuCountry)}` : 'Find a country'}
                    aria-label={menuCountry ? 'Find a region' : 'Find a country'}
                    autoFocus
                    className="bg-[#f7f7f7] h-[40px] w-full rounded-[30px] px-[16px] text-[13px] leading-[20px] text-[#101604] outline-none placeholder:text-[#807e7e]"
                    style={jakarta(400)}
                  />
                </div>
                <div className="max-h-[320px] overflow-y-auto py-[4px]">
                  {menuCountry ? (
                    <>
                      <button type="button" onClick={() => { setMenuCountry(''); setPlaceFilter('') }} className={menuRow(false, 'text-[#807e7e]')} style={jakarta(500)}>
                        ← All countries
                      </button>
                      <button
                        type="button"
                        role="option"
                        aria-selected={b.place.country === menuCountry && !b.place.region}
                        onClick={() => choosePlace({ country: menuCountry, region: '' })}
                        className={menuRow(b.place.country === menuCountry && !b.place.region, 'border-b border-[#f7f7f7]')}
                        style={jakarta(600)}
                      >
                        All of {countryName(menuCountry)}
                      </button>
                      {menuRegions.map((r) => (
                        <button
                          key={r}
                          type="button"
                          role="option"
                          aria-selected={b.place.country === menuCountry && b.place.region === r}
                          onClick={() => choosePlace({ country: menuCountry, region: r })}
                          className={menuRow(b.place.country === menuCountry && b.place.region === r)}
                          style={jakarta(b.place.country === menuCountry && b.place.region === r ? 600 : 400)}
                        >
                          {r}
                        </button>
                      ))}
                      {menuRegions.length === 0 && (
                        <p className="px-[16px] py-[10px] text-[13px] leading-[20px] text-[#807e7e]" style={jakarta(400)}>
                          {q ? 'No region matches.' : 'No regions listed for this country.'}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      {!q && (
                        <button
                          type="button"
                          role="option"
                          aria-selected={!b.place.country}
                          onClick={() => choosePlace(EVERYWHERE)}
                          className={menuRow(!b.place.country, 'border-b border-[#f7f7f7]')}
                          style={jakarta(600)}
                        >
                          {GLOBAL}
                        </button>
                      )}
                      {menuCountries.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => { setMenuCountry(c.code); setPlaceFilter('') }}
                          className={`${menuRow(b.place.country === c.code)} flex items-center justify-between gap-[8px]`}
                          style={jakarta(b.place.country === c.code ? 600 : 400)}
                        >
                          <span className="truncate">{c.name}</span>
                          <span className="text-[#807e7e] shrink-0">›</span>
                        </button>
                      ))}
                      {menuCountries.length === 0 && (
                        <p className="px-[16px] py-[10px] text-[13px] leading-[20px] text-[#807e7e]" style={jakarta(400)}>
                          No country matches.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sort: 193×48 hugging "Sort: Most recent" */}
          <div className="relative max-md:w-full" ref={sortRef}>
            <button
              type="button"
              onClick={() => { setSortOpen((o) => !o); setLocationOpen(false) }}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              className="bg-[#f7f7f7] flex gap-[8px] h-[48px] items-center justify-center px-[16px] rounded-[30px] max-md:w-full"
            >
              <img src={icons.sort} alt="" className="size-[20px] shrink-0" />
              <span className="text-[13px] leading-[16px] text-[#807e7e] whitespace-nowrap" style={jakarta(500)}>
                Sort: {b.sort}
              </span>
              <img src={icons.arrowDown} alt="" className={`size-[16px] shrink-0 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div role="listbox" aria-label="Sort" className="absolute top-[52px] right-0 bg-white border border-[#e4dede] rounded-[16px] shadow-[0px_8px_32px_rgba(0,0,0,0.1)] z-50 min-w-[193px] overflow-hidden">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="option"
                    aria-selected={s === b.sort}
                    onClick={() => { b.setSort(s); setSortOpen(false) }}
                    className={`w-full text-left px-[16px] py-[10px] text-[13px] hover:bg-[#f7f7f7] transition-colors ${s === b.sort ? 'text-[#007c53]' : 'text-[#101604]'}`}
                    style={jakarta(s === b.sort ? 600 : 400)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: 40px category pills 12 apart, the count right-aligned on the same line. The API has
          more categories than the frame's pills, so they scroll sideways under a hidden scrollbar. */}
      <div className="flex items-center justify-between gap-[24px] max-xl:flex-col max-xl:items-start max-xl:gap-[12px]">
        <div role="tablist" aria-label="Categories" className="flex gap-[12px] items-center min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-xl:w-full">
          {b.categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={b.category === cat}
              onClick={() => b.setCategory(cat)}
              className={`h-[40px] px-[16px] rounded-[30px] text-[13px] leading-[16px] whitespace-nowrap shrink-0 transition-colors ${b.category === cat ? 'bg-[#007c53] text-white' : 'bg-[#f7f7f7] text-[#807e7e]'}`}
              style={jakarta(500)}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-[14px] leading-[24px] text-[#807e7e] whitespace-nowrap shrink-0" style={jakarta(400)} aria-live="polite">
          Showing {b.listings.length} of {b.total} commodities
        </span>
      </div>
    </div>
  )
}
