import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { describe, it, expect } from 'vitest'
import Navbar from '../components/layout/Navbar'
import { store } from '../app/store'

// The navbar reads who is signed in from the store, so it renders inside the app's Provider.
function renderNavbar() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </Provider>
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
    expect(screen.getByText('ABOUT')).toBeInTheDocument()
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

  it('Sign in opens the sign-in dialog in place', () => {
    renderNavbar()
    expect(screen.getByText('Sign in').closest('button')).not.toBeNull()
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
