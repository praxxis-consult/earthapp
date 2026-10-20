/**
 * The product page's gallery: one main photo and up to three thumbnails, the last of which counts
 * the photos beyond those four. Any photo can be brought to the front; the thumbnails then show the
 * others in their listing order, so the one in front never repeats in the strip.
 */
export interface GalleryView {
  /** The photo in front, or null when the listing has none. */
  main: string | null
  /** Index into `images` of the photo in front. */
  selected: number
  /** The strip: at most three of the other photos, each with its index into `images`. */
  thumbs: { src: string; index: number }[]
  /** How many photos the strip has no room for (shown as +N on the last tile). */
  extra: number
}

export function galleryView(images: string[], selected: number): GalleryView {
  const at = images.length ? Math.min(Math.max(0, selected), images.length - 1) : 0
  const others = images.map((src, index) => ({ src, index })).filter((t) => t.index !== at)
  return { main: images[at] ?? null, selected: at, thumbs: others.slice(0, 3), extra: Math.max(0, others.length - 3) }
}

/** The next index when stepping through every photo, wrapping at both ends. */
export const step = (count: number, from: number, by: 1 | -1): number => (count ? (from + by + count) % count : 0)
