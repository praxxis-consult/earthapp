import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Footer from '../components/layout/Footer'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  )
}

describe('Footer — structure', () => {
  it('renders the Earth logo image', () => {
    renderFooter()
    expect(screen.getByAltText('Earth logo mark')).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    renderFooter()
    expect(screen.getByText(/premier international natural resource/i)).toBeInTheDocument()
  })

  it('renders all 4 column headings', () => {
    renderFooter()
    expect(screen.getByText('PLATFORM')).toBeInTheDocument()
    expect(screen.getByText('COMPANY')).toBeInTheDocument()
    expect(screen.getByText('RESOURCES')).toBeInTheDocument()
    expect(screen.getByText('LEGAL')).toBeInTheDocument()
  })

  it('renders platform links', () => {
    renderFooter()
    expect(screen.getByText('Marketplace')).toBeInTheDocument()
    expect(screen.getByText('Commodity Tracking')).toBeInTheDocument()
    expect(screen.getByText('Bounty System')).toBeInTheDocument()
  })

  it('renders company links', () => {
    renderFooter()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Careers')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders resources links', () => {
    renderFooter()
    expect(screen.getByText('Documentations')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('Release Note')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
  })

  it('renders legal links', () => {
    renderFooter()
    expect(screen.getByText('Terms')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('DPA')).toBeInTheDocument()
  })

  it('renders copyright bar', () => {
    renderFooter()
    expect(screen.getByText(/Copyright 2026 Earth Trading Group/i)).toBeInTheDocument()
  })

  it('renders escrow tagline', () => {
    renderFooter()
    expect(screen.getByText(/marketplace, never the escrow/i)).toBeInTheDocument()
  })

  it('renders all social icons', () => {
    renderFooter()
    expect(screen.getByAltText('X (Twitter)')).toBeInTheDocument()
    expect(screen.getByAltText('Facebook')).toBeInTheDocument()
    expect(screen.getByAltText('Instagram')).toBeInTheDocument()
    expect(screen.getByAltText('LinkedIn')).toBeInTheDocument()
  })

  it('renders inside a <footer> element', () => {
    const { container } = renderFooter()
    expect(container.querySelector('footer')).toBeInTheDocument()
  })
})
