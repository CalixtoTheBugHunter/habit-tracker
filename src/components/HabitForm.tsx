import { useState, FormEvent, useEffect, useRef } from 'react'
import { useHabits } from '../contexts/HabitContext'
import { addHabit, updateHabit } from '../services/indexedDB'
import type { Habit } from '../types/habit'
import './HabitForm.css'

interface HabitFormProps {
  habit?: Habit
  onSuccess?: () => void
  onCancel?: () => void
}

export function HabitForm({ habit, onSuccess, onCancel }: HabitFormProps) {
  const { refreshHabits } = useHabits()
  const [name, setName] = useState(habit?.name || '')
  const [description, setDescription] = useState(habit?.description || '')
  const [nameError, setNameError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showDescription, setShowDescription] = useState(!!habit)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isEditMode = !!habit

  useEffect(() => {
    if (habit) {
      setName(habit.name || '')
      setDescription(habit.description || '')
      setShowDescription(true)
    } else {
      setName('')
      setDescription('')
      setShowDescription(false)
    }
  }, [habit])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea && showDescription) {
      textarea.style.height = 'auto'
      const newHeight = textarea.scrollHeight
      textarea.style.height = `${newHeight}px`
      if (newHeight >= 200) {
        textarea.style.overflowY = 'auto'
      } else {
        textarea.style.overflowY = 'hidden'
      }
    }
  }, [description, habit, showDescription])

  const validateForm = (): boolean => {
    setNameError(null)
    
    if (!name.trim()) {
      setNameError('Name is required')
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const habitData: Habit = {
        id: habit?.id || globalThis.crypto.randomUUID(),
        name: name.trim(),
        description: description.trim() || undefined,
        createdDate: habit?.createdDate || new Date().toISOString(),
        completionDates: habit?.completionDates || [],
      }

      if (isEditMode) {
        await updateHabit(habitData)
      } else {
        await addHabit(habitData)
      }

      await refreshHabits()
      setSubmitSuccess(true)
      
      if (!isEditMode) {
        setName('')
        setDescription('')
        setShowDescription(false)
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save habit'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (habit) {
      setName(habit.name || '')
      setDescription(habit.description || '')
    } else {
      setName('')
      setDescription('')
      setShowDescription(false)
    }
    setNameError(null)
    setSubmitError(null)
    setSubmitSuccess(false)
    
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <form className="habit-form" onSubmit={handleSubmit} aria-label={isEditMode ? 'Edit habit form' : 'Create habit form'}>
      <h2 className="habit-form-title">{isEditMode ? 'Edit Habit' : 'Create New Habit'}</h2>
      
      <div className="habit-form-field">
        <label htmlFor="habit-name" className="habit-form-label">
          Name <span className="required">*</span>
        </label>
        <input
          id="habit-name"
          type="text"
          className={`habit-form-input ${nameError ? 'error' : ''}`}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError) {
              setNameError(null)
            }
          }}
          onFocus={() => {
            if (!isEditMode) {
              setShowDescription(true)
            }
          }}
          aria-required="true"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'name-error' : undefined}
          disabled={isSubmitting}
        />
        {nameError && (
          <span id="name-error" className="habit-form-error" role="alert">
            {nameError}
          </span>
        )}
      </div>

      {showDescription && (
        <div className="habit-form-field">
          <label htmlFor="habit-description" className="habit-form-label">
            Description
          </label>
          <textarea
            ref={textareaRef}
            id="habit-description"
            className="habit-form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={1}
            disabled={isSubmitting}
          />
        </div>
      )}

      {submitError && (
        <div className="habit-form-message habit-form-error-message" role="alert" aria-live="assertive">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="habit-form-message habit-form-success-message" role="status" aria-live="polite">
          {isEditMode ? 'Habit updated successfully!' : 'Habit created successfully!'}
        </div>
      )}

      <div className="habit-form-actions">
        <button
          type="submit"
          className="habit-form-button habit-form-button-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Habit' : 'Create Habit'}
        </button>
        {onCancel && (
          <button
            type="button"
            className="habit-form-button habit-form-button-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

