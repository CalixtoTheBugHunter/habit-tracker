import { useLanguage } from '../../../contexts/LanguageContext'
import { formatMessage } from '../../../locale'
import './CategoryBadge.css'

interface CategoryBadgeProps {
  name: string
}

export function CategoryBadge({ name }: CategoryBadgeProps) {
  const { messages } = useLanguage()
  const ariaLabel = formatMessage(messages.categoryBadge.ariaLabel, { name })

  return (
    <span className="category-badge" aria-label={ariaLabel}>
      {name}
    </span>
  )
}
