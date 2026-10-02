import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Button from '../components/ui/Button'

describe('Button (ui) — structure', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('primary variant renders arrow icon', () => {
    const { container } = render(<Button variant="primary">Go</Button>)
    const arrow = container.querySelector('img[src*="arrow-right"]')
    expect(arrow).toBeInTheDocument()
  })

  it('ghost variant has no arrow icon', () => {
    const { container } = render(<Button variant="ghost">Sign in</Button>)
    const arrow = container.querySelector('img[src*="arrow-right"]')
    expect(arrow).not.toBeInTheDocument()
  })

  it('passes through onClick', async () => {
    let clicked = false
    render(<Button onClick={() => { clicked = true }}>Click</Button>)
    screen.getByText('Click').click()
    expect(clicked).toBe(true)
  })

  it('accepts extra className', () => {
    const { container } = render(<Button className="mt-4">Test</Button>)
    expect(container.firstChild).toHaveClass('mt-4')
  })

  it('is a button element', () => {
    render(<Button>Submit</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
