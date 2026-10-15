import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FormDropdown from '../components/ui/FormDropdown'

const MANY = Array.from({ length: 20 }, (_, i) => `Option ${i + 1}`)

describe('FormDropdown', () => {
  it('offers a type-to-filter box on long lists and narrows the rows', () => {
    const onSelect = vi.fn()
    render(<FormDropdown id="c" label="Country" value="" placeholder="Select country" options={MANY} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button'))
    const box = screen.getByLabelText('Find country')
    fireEvent.change(box, { target: { value: 'option 2' } })
    const rows = screen.getAllByRole('option')
    expect(rows.map((r) => r.textContent)).toEqual(['Option 2', 'Option 20'])
    fireEvent.click(rows[0])
    expect(onSelect).toHaveBeenCalledWith('Option 2')
  })
  it('has no filter box on a short list', () => {
    render(<FormDropdown id="s" label="Sold as" value="" placeholder="Pick" options={['Kg', 'Tonne']} onSelect={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByLabelText('Find sold as')).toBeNull()
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })
  it('explains an empty list', () => {
    render(<FormDropdown id="r" label="Region/State" value="" placeholder="Select a country first" options={[]} emptyHint="Select a country first." onSelect={() => {}} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Select a country first.')).toBeInTheDocument()
  })
})
