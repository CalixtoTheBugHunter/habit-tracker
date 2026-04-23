import { useState, FormEvent, useEffect, useRef } from 'react'
import { useHabits } from '../../../contexts/HabitContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { addHabit, updateHabit } from '../../../services/indexedDB'
import { track } from '../../../analytics/umami'
import type { Habit } from '../../../types/habit'
import { MAX_NAME_LENGTH, MAX_DESCRIPTION_LENGTH } from '../../../utils/validation/validateHabit'
import { StackingHabitsSelector } from '../StackingHabitsSelector/StackingHabitsSelector'
import './HabitForm.css'

const TEXTAREA_MAX_HEIGHT = 200

interface HabitFormProps {
  habit?: Habit
  onSuccess?: () => void
  onCancel?: () => void
}

export function HabitForm({ habit, onSuccess, onCancel }: HabitFormProps) {
  const { messages } = useLanguage()
  const { habits, refreshHabits } = useHabits()
  const [name, setName] = useState(habit?.name || '')
  const [description, setDescription] = useState(habit?.description || '')
  const [stackingHabitIds, setStackingHabitIds] = useState<string[]>(habit?.stackingHabits ?? [])
  const [stackingStepLabels, setStackingStepLabels] = useState<Record<string, string>>(habit?.stackingStepLabels ?? {})
  const [goalDays, setGoalDays] = useState<number[]>(habit?.goalDays ?? [])
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
      setStackingHabitIds(habit.stackingHabits ?? [])
      setStackingStepLabels(habit.stackingStepLabels ?? {})
      setGoalDays(habit.goalDays ?? [])
      setShowDescription(true)
    } else {
      setName('')
      setDescription('')
      setStackingHabitIds([])
      setStackingStepLabels({})
      setGoalDays([])
      setShowDescription(false)
    }
  }, [habit])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea && showDescription) {
      textarea.style.height = 'auto'
      const newHeight = textarea.scrollHeight
      textarea.style.height = `${newHeight}px`
      if (newHeight >= TEXTAREA_MAX_HEIGHT) {
        textarea.style.overflowY = 'auto'
      } else {
        textarea.style.overflowY = 'hidden'
      }
    }
  }, [description, habit, showDescription])

  const validateForm = (): boolean => {
    setNameError(null)
    
    if (!name.trim()) {
      setNameError(messages.habitForm.validation.nameRequired)
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
      const stackingCompletions =
        isEditMode && habit?.stackingCompletions
          ? Object.fromEntries(
              Object.entries(habit.stackingCompletions).filter(([id]) => stackingHabitIds.includes(id))
            )
          : undefined
      const hasStacking = stackingHabitIds.length > 0
      const labelsForStack = hasStacking
        ? Object.fromEntries(Object.entries(stackingStepLabels).filter(([id]) => stackingHabitIds.includes(id)))
        : undefined
      const habitData: Habit = {
        id: habit?.id || globalThis.crypto.randomUUID(),
        name: name.trim(),
        description: description.trim() || undefined,
        createdDate: habit?.createdDate || new Date().toISOString(),
        completionDates: habit?.completionDates || [],
        stackingHabits: hasStacking ? stackingHabitIds : undefined,
        stackingCompletions: hasStacking && Object.keys(stackingCompletions ?? {}).length > 0 ? stackingCompletions : undefined,
        stackingStepLabels: labelsForStack && Object.keys(labelsForStack).length > 0 ? labelsForStack : undefined,
        autoCompletedDates: hasStacking ? habit?.autoCompletedDates : undefined,
        goalDays: goalDays.length > 0 ? goalDays : undefined,
      }

      if (isEditMode) {
        await updateHabit(habitData)
      } else {
        await addHabit(habitData)
      }

      await refreshHabits()
      if (!isEditMode) {
        track('habit_created')
      }
      setSubmitSuccess(true)

      if (!isEditMode) {
        setName('')
        setDescription('')
        setStackingHabitIds([])
        setStackingStepLabels({})
        setShowDescription(false)
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? messages.habitForm.error.saveFailed
          : messages.habitForm.error.saveFailedGeneric
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (habit) {
      setName(habit.name || '')
      setDescription(habit.description || '')
      setStackingHabitIds(habit.stackingHabits ?? [])
      setStackingStepLabels(habit.stackingStepLabels ?? {})
      setGoalDays(habit.goalDays ?? [])
    } else {
      setName('')
      setDescription('')
      setStackingHabitIds([])
      setStackingStepLabels({})
      setGoalDays([])
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
    <form className="habit-form" onSubmit={handleSubmit} aria-label={isEditMode ? messages.habitForm.aria.editForm : messages.habitForm.aria.createForm}>
      <h2 className="habit-form-title">{isEditMode ? messages.habitForm.title.edit : messages.habitForm.title.create}</h2>
      
      <div className="habit-form-field">
        <label htmlFor="habit-name" className="habit-form-label">
          {messages.habitForm.labels.name} <span className="required">{messages.habitForm.labels.required}</span>
        </label>
        <input
          id="habit-name"
          type="text"
          className={`habit-form-input ${nameError ? 'error' : ''}`}
          value={name}
          maxLength={MAX_NAME_LENGTH}
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
        <>
          <div className="habit-form-field">
            <label htmlFor="habit-description" className="habit-form-label">
              {messages.habitForm.labels.description}
            </label>
            <textarea
              ref={textareaRef}
              id="habit-description"
              className="habit-form-textarea"
              value={description}
              maxLength={MAX_DESCRIPTION_LENGTH}
              onChange={(e) => setDescription(e.target.value)}
              rows={1}
              disabled={isSubmitting}
            />
          </div>
          <StackingHabitsSelector
            id="habit-form-stacking"
            value={stackingHabitIds}
            onChange={(ids, newStepLabels) => {
              setStackingHabitIds(ids)
              if (newStepLabels) setStackingStepLabels(prev => ({ ...prev, ...newStepLabels }))
            }}
            habits={habits}
            stackingStepLabels={stackingStepLabels}
            excludeId={habit?.id}
            disabled={isSubmitting}
          />
          <fieldset className="habit-form-field habit-form-goaldays" disabled={isSubmitting}>
            <legend className="habit-form-label">{messages.habitForm.labels.goalDays}</legend>
            <div className="habit-form-goaldays__grid">
              {([1, 2, 3, 4, 5, 6, 0] as const).map((jsDay) => {
                const labelKey = (['weekdaySun', 'weekdayMon', 'weekdayTue', 'weekdayWed', 'weekdayThu', 'weekdayFri', 'weekdaySat'] as const)[jsDay]
                const label = messages.habitForm.labels[labelKey]
                const checked = goalDays.includes(jsDay)
                return (
                  <label key={jsDay} className={`habit-form-goaldays__day${checked ? ' habit-form-goaldays__day--checked' : ''}`}>
                    <input
                      type="checkbox"
                      className="habit-form-goaldays__checkbox"
                      checked={checked}
                      onChange={() => {
                        setGoalDays(prev =>
                          prev.includes(jsDay) ? prev.filter(d => d !== jsDay) : [...prev, jsDay]
                        )
                      }}
                    />
                    {label}
                  </label>
                )
              })}
            </div>
          </fieldset>
        </>
      )}

      {submitError && (
        <div className="habit-form-message habit-form-error-message" role="alert" aria-live="assertive">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="habit-form-message habit-form-success-message" role="status" aria-live="polite">
          {isEditMode ? messages.habitForm.success.updated : messages.habitForm.success.created}
        </div>
      )}

      <div className="habit-form-actions">
        <button
          type="submit"
          className="habit-form-button habit-form-button-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? messages.habitForm.buttons.saving : isEditMode ? messages.habitForm.buttons.update : messages.habitForm.buttons.create}
        </button>
        {onCancel && (
          <button
            type="button"
            className="habit-form-button habit-form-button-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {messages.habitForm.buttons.cancel}
          </button>
        )}
      </div>
    </form>
  )
}

