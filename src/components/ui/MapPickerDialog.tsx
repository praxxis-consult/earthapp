import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Shell } from './SettingsDialogs'
import { reverseGeocode, type GeoAddress } from '../../lib/geocode'
import { jakarta } from '../../utils/styles'

interface MapPickerDialogProps {
  /** Where the map opens; Lagos when nothing better is known. */
  initial?: { lat: number; lon: number }
  onPick: (address: GeoAddress & { lat: number; lon: number }) => void
  onClose: () => void
}

const LAGOS = { lat: 6.5244, lon: 3.3792 }
/** Nominatim takes one request a second at most; a dragged pin asks once it has settled. */
const GEOCODE_DEBOUNCE_MS = 1100

/** The pin: a brand-green dot with a white ring, drawn in CSS so no image paths are involved. */
const PIN = L.divIcon({ className: '', html: '<span style="display:block;width:20px;height:20px;border-radius:50%;background:#007c53;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>', iconSize: [20, 20], iconAnchor: [10, 10] })

/**
 * "Select from map" (create acc 805:7443, and the delivery address forms): an OpenStreetMap map
 * in the 648px form dialog, a pin that follows a click or a drag, "Use my location" for the
 * phone's GPS, and the address the pin resolves to shown underneath before it is used. There is
 * no frame for the dialog itself; it follows the 648px form dialog (639:24245).
 */
export default function MapPickerDialog({ initial, onPick, onClose }: MapPickerDialogProps) {
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const marker = useRef<L.Marker | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const abort = useRef<AbortController | null>(null)
  const [pin, setPin] = useState(initial ?? LAGOS)
  const [found, setFound] = useState<GeoAddress | null>(null)
  const [state, setState] = useState<'idle' | 'reading' | 'error'>('idle')
  const [message, setMessage] = useState('Tap the map, or drag the pin, to where the goods go.')
  const [locating, setLocating] = useState(false)

  // Resolve the pin, at most once a second, cancelling a read the pin moved away from.
  const resolve = (lat: number, lon: number) => {
    clearTimeout(timer.current)
    abort.current?.abort()
    setState('reading')
    setFound(null)
    timer.current = setTimeout(async () => {
      const controller = new AbortController()
      abort.current = controller
      try {
        const a = await reverseGeocode(lat, lon, controller.signal)
        if (controller.signal.aborted) return
        setFound(a)
        setState('idle')
        setMessage(a.line || 'No address is known here; the fields can be typed.')
      } catch (e) {
        if (controller.signal.aborted) return
        setState('error')
        setMessage(e instanceof Error ? e.message : 'The map service did not answer.')
      }
    }, GEOCODE_DEBOUNCE_MS)
  }

  useEffect(() => {
    if (!box.current || map.current) return
    const m = L.map(box.current, { center: [pin.lat, pin.lon], zoom: initial ? 16 : 12, zoomControl: true, attributionControl: true })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(m)
    const mk = L.marker([pin.lat, pin.lon], { icon: PIN, draggable: true, keyboard: true }).addTo(m)
    const moved = (lat: number, lon: number) => {
      setPin({ lat, lon })
      resolve(lat, lon)
    }
    mk.on('dragend', () => {
      const p = mk.getLatLng()
      moved(p.lat, p.lng)
    })
    m.on('click', (e: L.LeafletMouseEvent) => {
      mk.setLatLng(e.latlng)
      moved(e.latlng.lat, e.latlng.lng)
    })
    map.current = m
    marker.current = mk
    if (initial) resolve(initial.lat, initial.lon)
    // The dialog animates in; the map measures itself once the box has its size.
    setTimeout(() => m.invalidateSize(), 50)
    return () => {
      clearTimeout(timer.current)
      abort.current?.abort()
      m.remove()
      map.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function locate() {
    if (!navigator.geolocation) return setMessage('This browser cannot share its location; tap the map instead.')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        const { latitude: lat, longitude: lon } = pos.coords
        map.current?.setView([lat, lon], 17)
        marker.current?.setLatLng([lat, lon])
        setPin({ lat, lon })
        resolve(lat, lon)
      },
      () => {
        setLocating(false)
        setMessage('Location was not shared; tap the map to place the pin.')
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const canUse = state === 'idle' && found !== null

  return (
    <Shell title="Pick your location" onClose={onClose} onSubmit={(e) => { e.preventDefault(); if (found) onPick({ ...found, ...pin }) }} busy={!canUse} cta="Use this address" busyLabel={state === 'reading' ? 'Reading the address…' : 'Place the pin first'} cancel>
      <div className="relative">
        <div ref={box} role="application" aria-label="Map" className="h-[360px] w-full overflow-hidden rounded-[16px] bg-[#f7f7f7] max-md:h-[300px]" />
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="absolute right-[12px] top-[12px] z-[1000] flex h-[36px] items-center rounded-[30px] bg-white px-[14px] text-[#007c53] text-[13px] leading-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.2)] disabled:opacity-60"
          style={jakarta(500)}
        >
          {locating ? 'Finding you…' : 'Use my location'}
        </button>
      </div>
      <p role="status" aria-live="polite" className={`text-[14px] leading-[22px] ${state === 'error' ? 'text-[#b13b3b]' : 'text-[#807e7e]'}`} style={jakarta(400)}>
        {message}
      </p>
      {found && (
        <div className="flex flex-col gap-[4px] rounded-[16px] bg-[#f7f7f7] px-[16px] py-[12px] text-[13px] leading-[20px]" style={jakarta(400)}>
          {(
            [
              ['Street', found.street],
              ['Area', found.area],
              ['State', found.region],
              ['Postal code', found.postalCode],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-[12px]">
              <span className="text-[#807e7e]">{k}</span>
              <span className={`text-right ${v ? 'text-[#101604]' : 'text-[#b13b3b]'}`} style={jakarta(500)}>
                {v || 'not on the map, type it'}
              </span>
            </div>
          ))}
        </div>
      )}
    </Shell>
  )
}
