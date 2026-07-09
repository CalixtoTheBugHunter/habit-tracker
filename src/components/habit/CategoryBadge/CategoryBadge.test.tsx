import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { CategoryBadge } from './CategoryBadge'
import { CategoryBadgeList } from './CategoryBadgeList'
import { renderWithLangReady } from '../../../test/utils/renderWithLangReady'
import { createMockCategory } from '../../../test/fixtures/categories'

describe('CategoryBadge', () => {
  it('renders the category name with an aria-label', () => {
    renderWithLangReady(<CategoryBadge name="Health" />)
    const badge = screen.getByText('Health')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', 'Category: Health')
  })
})

describe('CategoryBadgeList', () => {
  const categories = [
    createMockCategory({ id: 'a', name: 'Health' }),
    createMockCategory({ id: 'b', name: 'Work' }),
  ]

  it('renders a badge for each known category id', () => {
    renderWithLangReady(<CategoryBadgeList categoryIds={['a', 'b']} categories={categories} />)
    expect(screen.getByText('Health')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('ignores unknown category ids', () => {
    renderWithLangReady(<CategoryBadgeList categoryIds={['a', 'zzz']} categories={categories} />)
    expect(screen.getByText('Health')).toBeInTheDocument()
    expect(screen.queryByText('zzz')).not.toBeInTheDocument()
  })

  it('renders nothing when no ids resolve to a known category', () => {
    const { container } = renderWithLangReady(
      <CategoryBadgeList categoryIds={['zzz']} categories={categories} />
    )
    expect(container.querySelector('.category-badge-list')).toBeNull()
  })
})
