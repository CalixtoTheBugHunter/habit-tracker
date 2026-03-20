import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { messages, formatMessage } from '../../../locale'
import { isTodayCompleted } from '../../../utils/habit/isTodayCompleted'
import { isStackingHabitCompletedToday } from '../../../utils/habit/isStackingHabitCompletedToday'
import { removeStackingHabit } from '../../../utils/habit/removeStackingHabit'
import { ConfirmationModal } from '../../modal/ConfirmationModal/ConfirmationModal'
import type { Habit } from '../../../types/habit'
import './HabitStackingAccordion.css'

export interface HabitStackingAccordionProps {
  parentHabit: Habit
  stackingHabitsResolved: (Habit | undefined)[]
  onToggleStackingHabit: (parentHabitId: string, stackingHabitId: string) => Promise<void>
  updateHabit?: (habit: Habit) => Promise<void>
}

export function HabitStackingAccordion({
  parentHabit,
  stackingHabitsResolved,
  onToggleStackingHabit,
  updateHabit,
}: HabitStackingAccordionProps) {
  const [expanded, setExpanded] = useState(false)
  const [togglingStackingId, setTogglingStackingId] = useState<string | null>(null)
  const [removalPending, setRemovalPending] = useState<{ stackingHabitId: string; displayName: string } | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const panelId = `habit-stacking-panel-${parentHabit.id}`
  const triggerId = `habit-stacking-trigger-${parentHabit.id}`

  const handleTriggerClick = () => {
    setExpanded(prev => !prev)
  }

  const handleCheckboxChange = async (stackingHabitId: string) => {
    setTogglingStackingId(stackingHabitId)
    try {
      await onToggleStackingHabit(parentHabit.id, stackingHabitId)
    } finally {
      setTogglingStackingId(null)
    }
  }

  const handleRemoveClick = (stackingHabitId: string, displayName: string) => {
    setRemovalPending({ stackingHabitId, displayName })
  }

  const handleRemoveConfirm = async () => {
    if (!removalPending || !updateHabit) return
    setIsRemoving(true)
    try {
      const updated = removeStackingHabit(parentHabit, removalPending.stackingHabitId)
      await updateHabit(updated)
      setRemovalPending(null)
    } finally {
      setIsRemoving(false)
    }
  }

  const handleRemoveCancel = () => {
    setRemovalPending(null)
  }

  const removeModal = messages.habitList.stacking.removeModal
  const parentDisplayName = parentHabit.name || messages.habitList.unnamedHabit
  const expandCollapseLabel = expanded
    ? formatMessage(messages.habitList.stacking.collapseAria, { name: parentDisplayName })
    : formatMessage(messages.habitList.stacking.expandAria, { name: parentDisplayName })

  return (
    <div className="habit-stacking-accordion">
      <button
        type="button"
        id={triggerId}
        className="habit-stacking-accordion__trigger"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={handleTriggerClick}
      >
        {expandCollapseLabel}
        {expanded ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        aria-label={formatMessage(messages.habitList.stacking.regionAria, { name: parentDisplayName })}
        className={`habit-stacking-accordion__panel ${expanded ? 'habit-stacking-accordion__panel--open' : ''}`}
        aria-hidden={!expanded}
        {...(!expanded ? { inert: '' as const } : {})}
      >
        <h4 className="habit-stacking-accordion__heading">{messages.habitList.stacking.title}</h4>
        <ul className="habit-stacking-accordion__list">
          {stackingHabitsResolved.map((habit, index) => {
            const stackingHabitId = parentHabit.stackingHabits?.[index] ?? ''
            const displayName = habit === undefined
              ? (parentHabit.stackingStepLabels?.[stackingHabitId] ?? messages.habitList.stacking.unknownHabit)
              : (habit.name || messages.habitList.unnamedHabit)
            if (habit === undefined) {
              const stackingOnlyCompleted = isStackingHabitCompletedToday(
                parentHabit.stackingCompletions,
                stackingHabitId
              )
              return (
                <li key={stackingHabitId || index} className="habit-stacking-accordion__item">
                  <input
                    type="checkbox"
                    id={`${panelId}-cb-${stackingHabitId}`}
                    checked={stackingOnlyCompleted}
                    disabled={togglingStackingId === stackingHabitId}
                    aria-label={formatMessage(messages.habitList.stacking.checkboxAria, { name: displayName })}
                    onChange={() => handleCheckboxChange(stackingHabitId)}
                  />
                  <label htmlFor={`${panelId}-cb-${stackingHabitId}`}>
                    {displayName}
                  </label>
                  {updateHabit && (
                    <button
                      type="button"
                      className="habit-stacking-accordion__remove"
                      aria-label={formatMessage(messages.habitList.stacking.removeButtonAria, { name: displayName })}
                      onClick={() => handleRemoveClick(stackingHabitId, displayName)}
                    >
                      <Trash2 aria-hidden size={16} />
                    </button>
                  )}
                </li>
              )
            }
            const completedToday = isTodayCompleted(habit.completionDates)
            const checkboxId = `${panelId}-cb-${habit.id}`
            return (
              <li key={habit.id} className="habit-stacking-accordion__item">
                <input
                  type="checkbox"
                  id={checkboxId}
                  checked={completedToday}
                  disabled={togglingStackingId === habit.id}
                  aria-label={formatMessage(messages.habitList.stacking.checkboxAria, { name: displayName })}
                  onChange={() => handleCheckboxChange(habit.id)}
                />
                <label htmlFor={checkboxId}>{displayName}</label>
                {updateHabit && (
                  <button
                    type="button"
                    className="habit-stacking-accordion__remove"
                    aria-label={formatMessage(messages.habitList.stacking.removeButtonAria, { name: displayName })}
                    onClick={() => handleRemoveClick(habit.id, displayName)}
                  >
                    <Trash2 aria-hidden size={16} />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
      {updateHabit && (
        <ConfirmationModal
          isOpen={!!removalPending}
          title={removeModal.title}
          message={removalPending ? formatMessage(removeModal.message, { name: removalPending.displayName }) : ''}
          confirmLabel={removeModal.confirm}
          cancelLabel={removeModal.cancel}
          confirmingLabel={removeModal.confirming}
          onConfirm={handleRemoveConfirm}
          onCancel={handleRemoveCancel}
          isConfirming={isRemoving}
        />
      )}
    </div>
  )
}
