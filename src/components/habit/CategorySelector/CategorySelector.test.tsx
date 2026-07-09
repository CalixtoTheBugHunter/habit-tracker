import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategorySelector } from './CategorySelector'
import { renderWithLangReady } from '../../../test/utils/renderWithLangReady'
import { createMockCategory } from '../../../test/fixtures/categories'

describe('CategorySelector', () => {
  it('shows an empty hint when there are no categories', () => {
    renderWithLangReady(<CategorySelector value={[]} onChange={() => {}} categories={[]} />)
    expect(screen.getByText(/no categories yet/i)).toBeInTheDocument()
  })

  it('renders a checkbox for each category', () => {
    const categories = [
      createMockCategory({ id: 'a', name: 'Health' }),
      createMockCategory({ id: 'b', name: 'Work' }),
    ]
    renderWithLangReady(<CategorySelector value={[]} onChange={() => {}} categories={categories} />)
    expect(screen.getByRole('checkbox', { name: /health/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /work/i })).toBeInTheDocument()
  })

  it('reflects selected categories as checked', () => {
    const categories = [createMockCategory({ id: 'a', name: 'Health' })]
    renderWithLangReady(<CategorySelector value={['a']} onChange={() => {}} categories={categories} />)
    expect(screen.getByRole('checkbox', { name: /health/i })).toBeChecked()
  })

  it('calls onChange with the toggled category id', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const categories = [createMockCategory({ id: 'a', name: 'Health' })]
    renderWithLangReady(<CategorySelector value={[]} onChange={onChange} categories={categories} />)
    await user.click(screen.getByRole('checkbox', { name: /health/i }))
    expect(onChange).toHaveBeenCalledWith(['a'])
  })

  it('calls onChange removing the category id when it is already selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const categories = [createMockCategory({ id: 'a', name: 'Health' })]
    renderWithLangReady(<CategorySelector value={['a']} onChange={onChange} categories={categories} />)
    await user.click(screen.getByRole('checkbox', { name: /health/i }))
    expect(onChange).toHaveBeenCalledWith([])
  })
})
