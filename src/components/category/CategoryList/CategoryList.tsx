import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useCategories } from '../../../contexts/CategoryContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { formatMessage } from '../../../locale'
import { ConfirmationModal } from '../../modal/ConfirmationModal/ConfirmationModal'
import type { Category } from '../../../types/category'
import './CategoryList.css'

interface CategoryListProps {
  onEdit?: (category: Category) => void
}

export function CategoryList({ onEdit }: CategoryListProps) {
  const { messages } = useLanguage()
  const { categories, deleteCategory } = useCategories()
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return
    setDeletingId(categoryToDelete.id)
    try {
      await deleteCategory(categoryToDelete.id)
      setCategoryToDelete(null)
    } catch {
      // Error is surfaced via CategoryContext
    } finally {
      setDeletingId(null)
    }
  }

  if (categories.length === 0) {
    return <p className="category-list-empty">{messages.categories.empty}</p>
  }

  const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <ConfirmationModal
        isOpen={categoryToDelete !== null}
        title={messages.categories.deleteModal.title}
        message={formatMessage(messages.categories.deleteModal.message, {
          name: categoryToDelete?.name ?? '',
        })}
        confirmLabel={messages.categories.deleteModal.confirm}
        cancelLabel={messages.categories.deleteModal.cancel}
        confirmingLabel={messages.categories.deleteModal.confirming}
        buttonVariant="warning"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCategoryToDelete(null)}
        isConfirming={deletingId !== null}
      />
      <ul className="category-list" aria-label={messages.categories.list.aria}>
        {sorted.map((category) => (
          <li key={category.id} className="category-list-item">
            <span className="category-list-name">{category.name}</span>
            <div className="category-list-actions">
              {onEdit && (
                <button
                  type="button"
                  className="category-list-button category-list-edit"
                  onClick={() => onEdit(category)}
                  aria-label={formatMessage(messages.categories.list.editAria, { name: category.name })}
                >
                  <Pencil size={16} aria-hidden="true" />
                  <span>{messages.categories.list.edit}</span>
                </button>
              )}
              <button
                type="button"
                className="category-list-button category-list-delete"
                onClick={() => setCategoryToDelete(category)}
                disabled={deletingId === category.id}
                aria-label={formatMessage(messages.categories.list.deleteAria, { name: category.name })}
              >
                <Trash2 size={16} aria-hidden="true" />
                <span>{messages.categories.list.delete}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
