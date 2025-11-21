import { useHabits } from '../contexts/HabitContext'
import { calculateStreak } from '../utils/habit/calculateStreak'
import { isTodayCompleted } from '../utils/habit/isTodayCompleted'
import './HabitList.css'

export function HabitList() {
  const { habits, isLoading, error } = useHabits()

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
      {habits.map(habit => {
        const streak = calculateStreak(habit.completionDates)
        const completedToday = isTodayCompleted(habit.completionDates)

        return (
          <li key={habit.id} className="habit-item">
            <div className="habit-header">
              <h3 className="habit-name">{habit.name || 'Unnamed Habit'}</h3>
              <div className="habit-status">
                <span className={`completion-badge ${completedToday ? 'completed' : 'not-completed'}`}>
                  {completedToday ? 'Completed today' : 'Not completed today'}
                </span>
              </div>
            </div>
            {habit.description && (
              <p className="habit-description">{habit.description}</p>
            )}
            <div className="habit-stats">
              <span className="streak">Streak: {streak}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

