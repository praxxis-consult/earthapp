import filterIcon from '../../assets/icons/db-filter.svg'
import arrowDownIcon from '../../assets/icons/db-arrow-down.svg'
import type { FilterGroup } from '../../data/orderFilters'
import { jakarta } from '../../utils/styles'
import { MENU_SHADOW } from './SelectorMenu'
import { useMenu } from './useMenu'

interface FilterMenuProps<K extends string> {
  groups: FilterGroup<K>[]
  value: Record<K, string>
  onChange: (key: K, value: string) => void
  onReset: () => void
  /** Choices away from the defaults; shown on the button and enables Reset. */
  active: number
  /** The table or list the menu narrows, for the popover's label. */
  label?: string
}

/**
 * The "Filters" button of the list pages (orders 561:4005: 48 tall, #f7f7f7, radius 30, filter
 * icon, 13px SemiBold, chevron) and the popover it opens. The design file draws only the button,
 * so the popover follows the app's menus (Selector menu 421:4219: white, radius 24, the same
 * shadow) with one row of pills per group, in the status tabs' pill style. A choice applies at
 * once; Reset returns every group to its default. Closes on an outside click or Escape. Below
 * `md` the row is too narrow for a popover, so it opens as a sheet at the bottom of the screen.
 */
export default function FilterMenu<K extends string>({ groups, value, onChange, onReset, active, label = 'Filters' }: FilterMenuProps<K>) {
  const { open, setOpen, ref } = useMenu()
  return (
    <div ref={ref} className="relative max-md:flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center justify-center gap-[8px] h-[48px] px-[16px] rounded-[30px] max-md:w-full"
        style={{ background: active ? '#f2f8f6' : '#f7f7f7' }}
      >
        <img src={filterIcon} alt="" className="size-[20px]" />
        <span className="text-[13px] leading-[16px] whitespace-nowrap" style={{ ...jakarta(600), color: active ? '#007c53' : '#101604' }}>
          Filters
        </span>
        {active > 0 && (
          <span className="flex items-center justify-center h-[15px] px-[6px] rounded-full text-[9px] leading-[11px] bg-[#007c53] text-white" style={jakarta(700)}>
            {active}
          </span>
        )}
        <img src={arrowDownIcon} alt="" className={`size-[16px] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="md:hidden fixed inset-0 z-40 bg-[rgba(16,22,4,0.35)]" onClick={() => setOpen(false)} aria-hidden="true" />}
      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute right-0 top-[56px] z-20 w-[320px] bg-white rounded-[24px] p-[16px] flex flex-col gap-[16px] max-md:fixed max-md:inset-x-[16px] max-md:top-auto max-md:bottom-[16px] max-md:w-auto max-md:z-50 max-md:max-h-[calc(100dvh-32px)] max-md:overflow-y-auto"
          style={{ boxShadow: MENU_SHADOW }}
        >
          {groups.map((g) => (
            <fieldset key={g.key} className="flex flex-col gap-[8px] min-w-0">
              <legend className="text-[#807e7e] text-[12px] leading-[15px] mb-[8px]" style={jakarta(500)}>
                {g.label}
              </legend>
              <div className="flex flex-wrap gap-[8px]">
                {g.options.map((o) => {
                  const on = value[g.key] === o.value
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => onChange(g.key, o.value)}
                      className="h-[35px] px-[12px] rounded-[30px] text-[12px] leading-[15px] whitespace-nowrap transition-colors"
                      style={{ ...jakarta(on ? 600 : 500), background: on ? '#f2f8f6' : '#f7f7f7', color: on ? '#007c53' : '#807e7e' }}
                    >
                      {o.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}
          <div className="flex items-center justify-between pt-[12px] border-t border-[#f7f7f7]">
            <button
              type="button"
              onClick={onReset}
              disabled={!active}
              className="h-[36px] px-[12px] rounded-[30px] text-[13px] leading-[16px] text-[#807e7e] hover:bg-[#f7f7f7] disabled:opacity-40"
              style={jakarta(600)}
            >
              Reset
            </button>
            <button type="button" onClick={() => setOpen(false)} className="h-[36px] px-[16px] rounded-[30px] bg-[#007c53] text-white text-[13px] leading-[16px]" style={jakarta(600)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
