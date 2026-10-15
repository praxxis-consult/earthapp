import { useId, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'

export interface ChartPoint {
  /** Pixel position inside the chart. */
  x: number
  y: number
  index: number
  value: number
}

interface LineChartProps {
  values: number[]
  /** Horizontal position of each value in the design's 539px-wide graph (the day label centres). */
  xs: number[]
  /** The line's colour (2px stroke). */
  color: string
  /** The colour the area under the line fades from (to white, at 15%). */
  areaColor: string
  /** The point that carries the tooltip until the pointer picks another. */
  highlight: number
  /** Renders the tooltip for the active point. */
  pin: (point: ChartPoint) => ReactNode
  className?: string
}

/** The design's graph box (464:8226): 539 wide, 270 tall, the plot clipped to the lower 211px. */
export const CHART_W = 539
export const CHART_H = 270
const PLOT_TOP = 59
/** The area's bottom edge sits 12px under the box in the frame; the clip hides the overrun. */
const AREA_BOTTOM = 282
/** The highest value sits 70% up the plot, as the frame's peak does. */
const PEAK = 0.7
/** A week with nothing in it draws as a flat line a third of the way up, with the tooltip on it. */
const FLAT = 0.35

/** Catmull-Rom through the points, as cubic Béziers, extended to both edges of the box. */
function curve(pts: { x: number; y: number }[], width: number): string {
  if (pts.length === 0) return ''
  const first = pts[0]
  const last = pts[pts.length - 1]
  const slope = (a: { x: number; y: number }, b: { x: number; y: number }) => (b.y - a.y) / (b.x - a.x || 1)
  const ext = [
    { x: -1, y: first.y - slope(first, pts[1] ?? first) * (first.x + 1) },
    ...pts,
    { x: width + 1, y: last.y + slope(pts[pts.length - 2] ?? last, last) * (width + 1 - last.x) },
  ]
  let d = `M${ext[0].x} ${ext[0].y}`
  for (let i = 0; i < ext.length - 1; i++) {
    const p0 = ext[i - 1] ?? ext[i]
    const p1 = ext[i]
    const p2 = ext[i + 1]
    const p3 = ext[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`
  }
  return d
}

/**
 * The overview's sales and views graphs (dashboard 459:1048, "Graph"): a smooth line through
 * one value per day, a 15% fade from the line colour to white beneath it, both clipped to the
 * plot area, and a tooltip on the active point. Drawn from the values, so the endpoint's
 * numbers slot straight in; the pointer moves the tooltip across the days.
 */
export default function LineChart({ values, xs, color, areaColor, highlight, pin, className = '' }: LineChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(CHART_W)
  const [hover, setHover] = useState<number | null>(null)
  const id = useId()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width || CHART_W))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scale = width / CHART_W
  const max = Math.max(0, ...values)
  const plotHeight = CHART_H - PLOT_TOP
  const points: ChartPoint[] = values.map((value, index) => ({
    index,
    value,
    x: (xs[index] ?? 0) * scale,
    y: max > 0 ? CHART_H - (value / max) * PEAK * plotHeight : CHART_H - FLAT * plotHeight,
  }))
  const top = Math.min(...points.map((p) => p.y), CHART_H)
  const line = curve(points, width)
  const area = line ? `${line} L${width + 1} ${AREA_BOTTOM} L-1 ${AREA_BOTTOM} Z` : ''
  const active = points[hover ?? highlight] ?? points[0]

  function onMove(e: PointerEvent<SVGSVGElement>) {
    const box = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - box.left
    let nearest = 0
    points.forEach((p, i) => {
      if (Math.abs(p.x - x) < Math.abs(points[nearest].x - x)) nearest = i
    })
    setHover(nearest)
  }

  return (
    <div ref={ref} className={`relative ${className}`} style={{ height: CHART_H }}>
      <svg
        width={width}
        height={CHART_H}
        viewBox={`0 0 ${width} ${CHART_H}`}
        className="absolute left-0 top-0 block"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`${id}-plot`}>
            <rect x="0" y={PLOT_TOP} width={width} height={plotHeight} />
          </clipPath>
          {/* The frame's fill: a vertical fade starting 95% of the area's height above it, down to its bottom */}
          <linearGradient
            id={`${id}-area`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
            y1={top - 0.95 * (AREA_BOTTOM - top)}
            y2={AREA_BOTTOM}
          >
            <stop offset="0" stopColor={areaColor} />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>
        <g clipPath={`url(#${id}-plot)`}>
          <path d={area} fill={`url(#${id}-area)`} opacity="0.15" />
          <path d={line} fill="none" stroke={color} strokeWidth="2" />
        </g>
      </svg>
      {active && pin(active)}
    </div>
  )
}
