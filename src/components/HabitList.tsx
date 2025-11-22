import { useMemo } from 'react'
import { useHabits } from '../contexts/HabitContext'
import { calculateStreak } from '../utils/habit/calculateStreak'
import { isTodayCompleted } from '../utils/habit/isTodayCompleted'
import type { Habit } from '../types/habit'
import './HabitList.css'

interface HabitListProps {
  onEdit?: (habit: Habit) => void
}

export function HabitList({ onEdit }: HabitListProps) {
  const { habits, isLoading, error } = useHabits()

  const habitsWithCalculations = useMemo(() => {
    return habits.map(habit => ({
      ...habit,
      streak: calculateStreak(habit.completionDates),
      completedToday: isTodayCompleted(habit.completionDates),
    }))
  }, [habits])

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

  return (
    <ul className="habit-list" aria-label="List of habits">
      {habitsWithCalculations.map(habit => (
        <li key={habit.id} className="habit-item">
          <div className="habit-header">
            <h3 className="habit-name">{habit.name || 'Unnamed Habit'}</h3>
            <div className="habit-status">
              <span
                className={`completion-badge ${habit.completedToday ? 'completed' : 'not-completed'}`}
                role="status"
                aria-label={habit.completedToday ? 'Completed today' : 'Not completed today'}
              >
                {habit.completedToday ? 'Completed today' : 'Not completed today'}
              </span>
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
            </div>
          </div>
          {habit.description && (
            <p className="habit-description">{habit.description}</p>
          )}
          <div className="habit-stats">
            <span className="streak">Streak: {habit.streak}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

