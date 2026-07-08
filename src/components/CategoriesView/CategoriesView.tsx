import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { CategoryForm, CategoryList } from '../category'
import type { Category } from '../../types/category'
import './CategoriesView.css'

export function CategoriesView() {
  const { messages } = useLanguage()
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)

  return (
    <div className="categories-view">
      <h1 className="categories-view-title">{messages.categories.title}</h1>
      <CategoryForm
        category={editingCategory}
        onSuccess={() => setEditingCategory(undefined)}
        onCancel={() => setEditingCategory(undefined)}
      />
      <CategoryList onEdit={setEditingCategory} />
    </div>
  )
}
