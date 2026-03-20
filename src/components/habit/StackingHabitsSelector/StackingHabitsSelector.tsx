import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { messages, formatMessage } from '../../../locale'
import { wouldCreateStackingCycle } from '../../../utils/habit/wouldCreateStackingCycle'
import type { Habit } from '../../../types/habit'
import './StackingHabitsSelector.css'

export interface StackingHabitsSelectorProps {
  value: string[]
  onChange: (ids: string[], newStepLabels?: Record<string, string>) => void
  habits: Habit[]
  stackingStepLabels?: Record<string, string>
  excludeId?: string
  disabled?: boolean
  id?: string
}

export function StackingHabitsSelector({
  value,
  onChange,
  habits,
  stackingStepLabels,
  excludeId,
  disabled = false,
  id = 'stacking-habits-selector',
}: StackingHabitsSelectorProps) {
  const [filterText, setFilterText] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const listboxRef = useRef<HTMLUListElement>(null)

  const options = habits.filter(h => {
    if (excludeId && h.id === excludeId) return false
    if (value.includes(h.id)) return false
    if (excludeId && wouldCreateStackingCycle(excludeId, h.id, habits)) return false
    const search = filterText.trim().toLowerCase()
    if (!search) return true
    const name = (h.name ?? '').toLowerCase()
    const desc = (h.description ?? '').toLowerCase()
    return name.includes(search) || desc.includes(search)
  })

  useEffect(() => {
    const el = listboxRef.current?.querySelector(`[data-index="${highlightedIndex}"]`)
    if (el && typeof (el as HTMLElement).scrollIntoView === 'function') {
      (el as HTMLElement).scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  const handleSelect = (habitId: string) => {
    onChange([...value, habitId])
    setFilterText('')
    setDropdownOpen(false)
  }

  const handleAddNewStep = () => {
    const label = filterText.trim()
    if (!label) return
    const newId = globalThis.crypto.randomUUID()
    onChange([...value, newId], { [newId]: label })
    setFilterText('')
    setDropdownOpen(false)
  }

  const handleRemove = (habitId: string) => {
    onChange(value.filter(id => id !== habitId))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Prevent Enter from ever submitting the form when focus is in this combobox
    if (e.key === 'Enter') {
      e.preventDefault()
    }
    if (!dropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setHighlightedIndex(0)
        setDropdownOpen(true)
        // When opening with Enter, select first option immediately so one Enter adds the habit
        // (avoids stale dropdownOpen state when keydown runs before re-render after focus)
        if (e.key === 'Enter') {
          if (options[0]) handleSelect(options[0].id)
          else if (filterText.trim()) handleAddNewStep()
        }
      }
      return
    }
    if (e.key === 'Escape') {
      setDropdownOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(i => (i < options.length - 1 ? i + 1 : i))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(i => (i > 0 ? i - 1 : 0))
      return
    }
    if (e.key === 'Enter') {
      if (options[highlightedIndex]) handleSelect(options[highlightedIndex].id)
      else if (filterText.trim()) handleAddNewStep()
    }
  }

  const displayNameForHabit = (h: Habit | undefined) =>
    h ? (h.name || messages.habitList.unnamedHabit) : messages.habitList.stacking.unknownHabit

  const displayNameForId = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (habit) return habit.name || messages.habitList.unnamedHabit
    return stackingStepLabels?.[habitId] ?? messages.habitList.stacking.unknownHabit
  }

  return (
    <div className="stacking-habits-selector">
      <label htmlFor={`${id}-input`} className="stacking-habits-selector__label">
        {messages.habitForm.stacking.label}
      </label>
      <div className="stacking-habits-selector__combobox">
        <div className="stacking-habits-selector__input-row">
          <input
            id={`${id}-input`}
            type="text"
            className="stacking-habits-selector__input"
            value={filterText}
          onChange={e => setFilterText(e.target.value)}
            onFocus={() => {
              setHighlightedIndex(0)
              setDropdownOpen(true)
            }}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder={messages.habitForm.stacking.placeholder}
            disabled={disabled}
            aria-label={messages.habitForm.stacking.addAria}
            aria-expanded={dropdownOpen}
            aria-controls={`${id}-listbox`}
            aria-autocomplete="list"
          />
          <button
            type="button"
            className="stacking-habits-selector__add-btn"
            disabled={disabled || (options.length === 0 && !filterText.trim())}
            onClick={() => {
              const toAdd = options[highlightedIndex] ?? options[0]
              if (toAdd) handleSelect(toAdd.id)
              else if (filterText.trim()) handleAddNewStep()
            }}
            aria-label={messages.habitForm.stacking.addButton}
          >
            {messages.habitForm.stacking.addButton}
          </button>
        </div>
        {dropdownOpen && options.length > 0 && (
          <ul
            id={`${id}-listbox`}
            ref={listboxRef}
            className="stacking-habits-selector__listbox"
            role="listbox"
            aria-label={messages.habitForm.stacking.addAria}
          >
            {options.map((habit, index) => (
              <li
                key={habit.id}
                role="option"
                data-index={index}
                className={`stacking-habits-selector__option ${index === highlightedIndex ? 'stacking-habits-selector__option--highlighted' : ''}`}
                onClick={() => handleSelect(habit.id)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {displayNameForHabit(habit)}
              </li>
            ))}
          </ul>
        )}
        {dropdownOpen && filterText.trim() && options.length === 0 && (
          <div className="stacking-habits-selector__empty" role="status">
            <p>{messages.habitForm.stacking.empty}</p>
            <p className="stacking-habits-selector__empty-hint">{messages.habitForm.stacking.addNewStepHint}</p>
          </div>
        )}
      </div>
      {value.length > 0 ? (
        <ul className="stacking-habits-selector__selected" aria-label={messages.habitForm.stacking.label}>
          {value.map(habitId => {
            const name = displayNameForId(habitId)
            return (
              <li key={habitId} className="stacking-habits-selector__selected-item">
                <span className="stacking-habits-selector__selected-name">{name}</span>
                <button
                  type="button"
                  className="stacking-habits-selector__remove"
                  onClick={() => handleRemove(habitId)}
                  disabled={disabled}
                  aria-label={formatMessage(messages.habitForm.stacking.removeAria, { name })}
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
