import { useCategories } from '../../../contexts/CategoryContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { formatMessage } from '../../../locale'
import './CategoryFilterBar.css'

export function CategoryFilterBar() {
  const { messages } = useLanguage()
  const { categories, selectedCategoryIds, toggleCategoryFilter, clearCategoryFilter } = useCategories()

  if (categories.length === 0) {
    return null
  }

  const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name))
  const noneSelected = selectedCategoryIds.length === 0

  return (
    <div className="category-filter" role="group" aria-label={messages.categoryFilter.label}>
      <button
        type="button"
        className={`category-filter__chip${noneSelected ? ' category-filter__chip--active' : ''}`}
        onClick={clearCategoryFilter}
        aria-pressed={noneSelected}
        aria-label={messages.categoryFilter.allAria}
      >
        {messages.categoryFilter.all}
      </button>
      {sorted.map((category) => {
        const active = selectedCategoryIds.includes(category.id)
        return (
          <button
            key={category.id}
            type="button"
            className={`category-filter__chip${active ? ' category-filter__chip--active' : ''}`}
            onClick={() => toggleCategoryFilter(category.id)}
            aria-pressed={active}
            aria-label={formatMessage(messages.categoryFilter.chipAria, { name: category.name })}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
