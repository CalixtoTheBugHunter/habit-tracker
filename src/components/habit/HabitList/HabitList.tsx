import { useMemo, useState } from 'react'
import { useHabits } from '../../../contexts/HabitContext'
import { calculateStreak } from '../../../utils/habit/calculateStreak'
import { isTodayCompleted } from '../../../utils/habit/isTodayCompleted'
import { AnnualCalendar } from '../AnnualCalendar/AnnualCalendar'
import { ConfirmationModal } from '../../modal/ConfirmationModal/ConfirmationModal'
import type { Habit } from '../../../types/habit'
import './HabitList.css'

interface HabitListProps {
  onEdit?: (habit: Habit) => void
}

export function HabitList({ onEdit }: HabitListProps) {
  const { habits, isLoading, error, toggleHabitCompletion, deleteHabit } = useHabits()
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

  if (isLoading) {
    return (
      <div className="habit-list" role="status" aria-live="polite" aria-atomic="true">
        <p>Loading habits...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="habit-list" role="alert" aria-live="assertive" aria-atomic="true">
        <p className="error">Error loading habits: {error}</p>
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="habit-list">
        <p className="empty-state">No habits yet. Start by creating your first habit!</p>
      </div>
    )
  }

  const habitDisplayName = habitToDelete?.name || 'this habit'

  return (
    <>
      <ConfirmationModal
        isOpen={habitToDelete !== null}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habitDisplayName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmingLabel="Deleting..."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isConfirming={deletingId !== null}
      />
      <ul className="habit-list" aria-label="List of habits">
        {habitsWithCalculations.map(habit => (
          <li key={habit.id} className="habit-item">
            <div className="habit-header">
              <h3 className="habit-name">{habit.name || 'Unnamed Habit'}</h3>
              <div className="habit-status">
                <button
                  type="button"
                  className={`completion-toggle ${habit.completedToday ? 'completed' : 'not-completed'}`}
                  onClick={() => handleToggle(habit.id)}
                  disabled={togglingId === habit.id}
                  aria-label={habit.completedToday ? 'Mark as not completed today' : 'Mark as completed today'}
                  aria-pressed={habit.completedToday}
                  aria-busy={togglingId === habit.id}
                >
                  {togglingId === habit.id ? 'Updating...' : habit.completedToday ? '✓ Completed' : 'Mark as done'}
                </button>
                {onEdit && (
                  <button
                    type="button"
                    className="habit-edit-button"
                    onClick={() => onEdit(habit)}
                    aria-label={`Edit ${habit.name || 'habit'}`}
                  >
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  className="habit-delete-button"
                  onClick={() => handleDeleteClick(habit.id, habit.name)}
                  disabled={deletingId === habit.id}
                  aria-label={`Delete ${habit.name || 'habit'}`}
                  aria-busy={deletingId === habit.id}
                >
                  Delete
                </button>
              </div>
            </div>
            {habit.description && (
              <p className="habit-description">{habit.description}</p>
            )}
            <div className="habit-stats">
              <span className="streak">Streak: {habit.streak}</span>
            </div>
            <AnnualCalendar habit={habit} />
          </li>
        ))}
      </ul>
    </>
  )
}

