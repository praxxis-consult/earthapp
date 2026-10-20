import { describe, it, expect } from 'vitest'
import { galleryView, step } from '../lib/gallery'

const four = ['a', 'b', 'c', 'd']

describe('galleryView', () => {
  it('shows the first photo in front and the other three in the strip', () => {
    const v = galleryView(four, 0)
    expect(v.main).toBe('a')
    expect(v.thumbs.map((t) => t.src)).toEqual(['b', 'c', 'd'])
    expect(v.extra).toBe(0)
  })
  it('brings a chosen photo to the front and keeps the strip free of it', () => {
    const v = galleryView(four, 2)
    expect(v.main).toBe('c')
    expect(v.thumbs.map((t) => t.index)).toEqual([0, 1, 3])
  })
  it('counts the photos the strip has no room for', () => {
    const v = galleryView(['a', 'b', 'c', 'd', 'e', 'f'], 0)
    expect(v.thumbs.map((t) => t.src)).toEqual(['b', 'c', 'd'])
    expect(v.extra).toBe(2)
  })
  it('copes with a single photo, none at all, and an index past the end', () => {
    expect(galleryView(['a'], 0)).toEqual({ main: 'a', selected: 0, thumbs: [], extra: 0 })
    expect(galleryView([], 3)).toEqual({ main: null, selected: 0, thumbs: [], extra: 0 })
    expect(galleryView(four, 9).main).toBe('d')
  })
})

describe('step', () => {
  it('wraps at both ends', () => {
    expect(step(4, 3, 1)).toBe(0)
    expect(step(4, 0, -1)).toBe(3)
    expect(step(0, 0, 1)).toBe(0)
  })
})
