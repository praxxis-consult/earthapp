import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EarthMarkets from '../pages/Home/EarthMarkets'

describe('EarthMarkets — structure', () => {
  it('renders background image', () => {
    const { container } = render(<EarthMarkets />)
    const bg = container.querySelector('img[src*="earth-markets-bg"]')
    expect(bg).toBeInTheDocument()
  })

  it('renders "Where Earth\'s" text', () => {
    render(<EarthMarkets />)
    expect(screen.getByText(/where earth/i)).toBeInTheDocument()
  })

  it('renders "natural resources meet" text', () => {
    render(<EarthMarkets />)
    expect(screen.getByText(/natural resources meet/i)).toBeInTheDocument()
  })

  it('renders "markets." text', () => {
    render(<EarthMarkets />)
    expect(screen.getByText(/markets\./)).toBeInTheDocument()
  })

  it('renders handshake icon', () => {
    render(<EarthMarkets />)
    expect(screen.getByAltText('handshake')).toBeInTheDocument()
  })

  it('renders globe icon', () => {
    const { container } = render(<EarthMarkets />)
    const globe = container.querySelector('img[src*="globe-frame"]')
    expect(globe).toBeInTheDocument()
  })

  it('section has correct height class', () => {
    const { container } = render(<EarthMarkets />)
    const section = container.querySelector('section')
    // 189.5 spacing units = 758px, the frame's height (the class moved off the arbitrary value)
    expect(section?.className).toContain('h-189.5')
  })

  it('gradient overlay is present', () => {
    const { container } = render(<EarthMarkets />)
    const overlay = container.querySelector('[style*="linear-gradient"]')
    expect(overlay).toBeInTheDocument()
  })
})
