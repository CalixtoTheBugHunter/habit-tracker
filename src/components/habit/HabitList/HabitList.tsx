import { useMemo, useState } from 'react'
import { useHabits } from '../../../contexts/HabitContext'
import { messages, formatMessage } from '../../../locale'
import { calculateStreak } from '../../../utils/habit/calculateStreak'
import { isTodayCompleted } from '../../../utils/habit/isTodayCompleted'
import { toggleStackingHabitCompletion } from '../../../utils/habit/toggleStackingHabitCompletion'
import { AnnualCalendar } from '../AnnualCalendar/AnnualCalendar'
import { HabitStackingAccordion } from '../HabitStackingAccordion/HabitStackingAccordion'
import { ConfirmationModal } from '../../modal/ConfirmationModal/ConfirmationModal'
import { StreakBadge } from '../StreakBadge/StreakBadge'
import type { Habit } from '../../../types/habit'
import './HabitList.css'

interface HabitListProps {
  onEdit?: (habit: Habit) => void
}

export function HabitList({ onEdit }: HabitListProps) {
  const { habits, isLoading, error, toggleHabitCompletion, updateHabit, deleteHabit } = useHabits()
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [habitToDelete, setHabitToDelete] = useState<{ id: string; name?: string } | null>(null)

  const habitsWithCalculations = useMemo(() => {
    return habits.map(habit => ({
      ...habit,
      streak: calculateStreak(habit.completionDates),
      completedToday: isTodayCompleted(habit.completionDates),
    }))
  }, [habits])

  const handleToggle = async (habitId: string) => {
    setTogglingId(habitId)
    try {
      await toggleHabitCompletion(habitId)
    } catch {
      // Error is already handled in context, but we catch to prevent unhandled promise rejection
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteClick = (habitId: string, habitName?: string) => {
    setHabitToDelete({ id: habitId, name: habitName })
  }

  const handleDeleteConfirm = async () => {
    if (!habitToDelete) return

    setDeletingId(habitToDelete.id)
    try {
      await deleteHabit(habitToDelete.id)
      setHabitToDelete(null)
    } catch {
      // Error is already handled in context, but we catch to prevent unhandled promise rejection
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteCancel = () => {
    setHabitToDelete(null)
  }

  const handleToggleStackingHabit = async (parentHabitId: string, stackingHabitId: string) => {
    const parentHabit = habits.find(h => h.id === parentHabitId)
    const stackingHabit = habits.find(h => h.id === stackingHabitId)
    if (!parentHabit) return
    try {
      if (stackingHabit) {
        await toggleHabitCompletion(stackingHabitId)
      } else {
        const updated = toggleStackingHabitCompletion(parentHabit, stackingHabitId)
        await updateHabit(updated)
      }
    } catch {
      // Error is already handled in context, but we catch to prevent unhandled promise rejection
    }
  }

  if (isLoading) {
    return (
      <div className="habit-list" role="status" aria-live="polite" aria-atomic="true">
        <p>{messages.habitList.loading}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="habit-list" role="alert" aria-live="assertive" aria-atomic="true">
        <p className="error">{formatMessage(messages.habitList.error, { error })}</p>
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="habit-list">
        <p className="empty-state">{messages.habitList.empty}</p>
      </div>
    )
  }

  const habitDisplayName = habitToDelete?.name || messages.habitList.thisHabit

  return (
    <>
      <ConfirmationModal
        isOpen={habitToDelete !== null}
        title={messages.habitList.deleteModal.title}
        message={formatMessage(messages.habitList.deleteModal.message, { name: habitDisplayName })}
        confirmLabel={messages.habitList.deleteModal.confirm}
        cancelLabel={messages.habitList.deleteModal.cancel}
        confirmingLabel={messages.habitList.deleteModal.confirming}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isConfirming={deletingId !== null}
      />
      <ul className="habit-list" aria-label={messages.habitList.aria.list}>
        {habitsWithCalculations.map(habit => (
          <li key={habit.id} className="habit-item">
            <div className="habit-header">
              <h3 className="habit-name">{habit.name || messages.habitList.unnamedHabit}</h3>
              <StreakBadge streak={habit.streak} />
            </div>
            {habit.description && (
              <p className="habit-description">{habit.description}</p>
            )}
            <AnnualCalendar habit={habit} />
            {habit.stackingHabits && habit.stackingHabits.length > 0 && (
              <HabitStackingAccordion
                parentHabit={habit}
                stackingHabitsResolved={habit.stackingHabits.map(id => habits.find(h => h.id === id))}
                onToggleStackingHabit={handleToggleStackingHabit}
                updateHabit={updateHabit}
              />
            )}
            <div className="habit-actions">
              <button
                type="button"
                className={`completion-toggle ${habit.completedToday ? 'completed' : 'not-completed'}`}
                onClick={() => handleToggle(habit.id)}
                disabled={togglingId === habit.id}
                aria-label={habit.completedToday ? messages.habitList.aria.markNotCompleted : messages.habitList.aria.markCompleted}
                aria-pressed={habit.completedToday}
                aria-busy={togglingId === habit.id}
              >
                {togglingId === habit.id ? messages.habitList.buttons.updating : habit.completedToday ? messages.habitList.buttons.completed : messages.habitList.buttons.markDone}
              </button>
              {onEdit && (
                <button
                  type="button"
                  className="habit-edit-button"
                  onClick={() => onEdit(habit)}
                  aria-label={formatMessage(messages.habitList.aria.editHabit, { name: habit.name || messages.habitList.aria.habitNameFallback })}
                >
                  {messages.habitList.buttons.edit}
                </button>
              )}
              <button
                type="button"
                className="habit-delete-button"
                onClick={() => handleDeleteClick(habit.id, habit.name)}
                disabled={deletingId === habit.id}
                aria-label={formatMessage(messages.habitList.aria.deleteHabit, { name: habit.name || messages.habitList.aria.habitNameFallback })}
                aria-busy={deletingId === habit.id}
              >
                {messages.habitList.buttons.delete}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

