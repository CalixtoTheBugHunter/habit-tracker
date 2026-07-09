import { useLanguage } from '../../../contexts/LanguageContext'
import type { Category } from '../../../types/category'
import './CategorySelector.css'

interface CategorySelectorProps {
  id?: string
  value: string[]
  onChange: (ids: string[]) => void
  categories: Category[]
  disabled?: boolean
}

export function CategorySelector({ id, value, onChange, categories, disabled }: CategorySelectorProps) {
  const { messages } = useLanguage()

  if (categories.length === 0) {
    return (
      <div className="category-selector">
        <span className="category-selector__label">{messages.habitForm.labels.categories}</span>
        <p className="category-selector__empty">{messages.habitForm.categories.empty}</p>
      </div>
    )
  }

  const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name))

  const toggle = (categoryId: string) => {
    onChange(
      value.includes(categoryId) ? value.filter(v => v !== categoryId) : [...value, categoryId]
    )
  }

  return (
    <fieldset id={id} className="category-selector" disabled={disabled}>
      <legend className="category-selector__label">{messages.habitForm.labels.categories}</legend>
      <div className="category-selector__grid">
        {sorted.map((category) => {
          const checked = value.includes(category.id)
          return (
            <label
              key={category.id}
              className={`category-selector__option${checked ? ' category-selector__option--checked' : ''}`}
            >
              <input
                type="checkbox"
                className="category-selector__checkbox"
                checked={checked}
                onChange={() => toggle(category.id)}
              />
              {category.name}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
