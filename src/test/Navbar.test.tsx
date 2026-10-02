import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Navbar from '../components/layout/Navbar'

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )
}

describe('Navbar — structure', () => {
  it('renders the Earth logo image', () => {
    renderNavbar()
    expect(screen.getByAltText('Earth logo mark')).toBeInTheDocument()
  })

  it('renders all 4 nav links', () => {
    renderNavbar()
    expect(screen.getByText('HOME')).toBeInTheDocument()
    expect(screen.getByText('MARKETPLACE')).toBeInTheDocument()
    expect(screen.getByText('LENDING')).toBeInTheDocument()
    expect(screen.getByText('HOW IT WORKS')).toBeInTheDocument()
  })

  it('renders Sign in link', () => {
    renderNavbar()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('renders Start Trading link', () => {
    renderNavbar()
    expect(screen.getByText('Start Trading')).toBeInTheDocument()
  })

  it('Sign in links to /signin', () => {
    renderNavbar()
    expect(screen.getByText('Sign in').closest('a')).toHaveAttribute('href', '/signin')
  })

  it('Start Trading links to /signup', () => {
    renderNavbar()
    expect(screen.getByText('Start Trading').closest('a')).toHaveAttribute('href', '/signup')
  })

  it('renders inside a <nav> element', () => {
    const { container } = renderNavbar()
    expect(container.querySelector('nav')).toBeInTheDocument()
  })
})
