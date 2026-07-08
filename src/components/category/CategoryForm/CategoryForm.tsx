import { useState, FormEvent, useEffect } from 'react'
import { useCategories } from '../../../contexts/CategoryContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { MAX_CATEGORY_NAME_LENGTH } from '../../../utils/validation/validateCategory'
import type { Category } from '../../../types/category'
import './CategoryForm.css'

interface CategoryFormProps {
  category?: Category
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const { messages } = useLanguage()
  const { categories, addCategory, updateCategory } = useCategories()
  const [name, setName] = useState(category?.name ?? '')
  const [nameError, setNameError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const isEditMode = !!category

  useEffect(() => {
    setName(category?.name ?? '')
    setNameError(null)
    setSubmitError(null)
    setSubmitSuccess(false)
  }, [category])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError(messages.categories.form.nameRequired)
      return
    }

    const isDuplicate = categories.some(
      existing =>
        existing.id !== category?.id &&
        existing.name.trim().toLowerCase() === trimmedName.toLowerCase()
    )
    if (isDuplicate) {
      setNameError(messages.categories.form.nameDuplicate)
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode && category) {
        await updateCategory({ ...category, name: trimmedName })
      } else {
        await addCategory(trimmedName)
      }
      setSubmitSuccess(true)
      if (!isEditMode) {
        setName('')
      }
      if (onSuccess) {
        onSuccess()
      }
    } catch {
      setSubmitError(messages.categories.form.saveFailed)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setName(category?.name ?? '')
    setNameError(null)
    setSubmitError(null)
    setSubmitSuccess(false)
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <form
      className="category-form"
      onSubmit={handleSubmit}
      aria-label={isEditMode ? messages.categories.form.editAria : messages.categories.form.createAria}
    >
      <h2 className="category-form-title">
        {isEditMode ? messages.categories.form.titleEdit : messages.categories.form.titleCreate}
      </h2>

      <div className="category-form-field">
        <label htmlFor="category-name" className="category-form-label">
          {messages.categories.form.nameLabel} <span className="required">{messages.categories.form.required}</span>
        </label>
        <input
          id="category-name"
          type="text"
          className={`category-form-input ${nameError ? 'error' : ''}`}
          value={name}
          maxLength={MAX_CATEGORY_NAME_LENGTH}
          placeholder={messages.categories.form.namePlaceholder}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError) {
              setNameError(null)
            }
          }}
          aria-required="true"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'category-name-error' : undefined}
          disabled={isSubmitting}
        />
        {nameError && (
          <span id="category-name-error" className="category-form-error" role="alert">
            {nameError}
          </span>
        )}
      </div>

      {submitError && (
        <div className="category-form-message category-form-error-message" role="alert" aria-live="assertive">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="category-form-message category-form-success-message" role="status" aria-live="polite">
          {isEditMode ? messages.categories.form.updatedSuccess : messages.categories.form.createdSuccess}
        </div>
      )}

      <div className="category-form-actions">
        <button
          type="submit"
          className="category-form-button category-form-button-primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? messages.categories.form.saving
            : isEditMode
              ? messages.categories.form.update
              : messages.categories.form.create}
        </button>
        {onCancel && (
          <button
            type="button"
            className="category-form-button category-form-button-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {messages.categories.form.cancel}
          </button>
        )}
      </div>
    </form>
  )
}
