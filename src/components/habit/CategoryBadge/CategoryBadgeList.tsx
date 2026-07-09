import { CategoryBadge } from './CategoryBadge'
import type { Category } from '../../../types/category'
import './CategoryBadge.css'

interface CategoryBadgeListProps {
  categoryIds: string[]
  categories: Category[]
}

export function CategoryBadgeList({ categoryIds, categories }: CategoryBadgeListProps) {
  const byId = new Map(categories.map(c => [c.id, c]))
  const resolved = categoryIds
    .map(id => byId.get(id))
    .filter((c): c is Category => c !== undefined)

  if (resolved.length === 0) {
    return null
  }

  return (
    <div className="category-badge-list">
      {resolved.map(category => (
        <CategoryBadge key={category.id} name={category.name} />
      ))}
    </div>
  )
}
