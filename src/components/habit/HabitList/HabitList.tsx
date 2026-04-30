import { useMemo, useState } from 'react'
import { useHabits } from '../../../contexts/HabitContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { formatMessage } from '../../../locale'
import { calculateStreak } from '../../../utils/habit/calculateStreak'
import { isTodayCompleted } from '../../../utils/habit/isTodayCompleted'
import { getHabitsToPersistAfterStackingToggle } from '../../../utils/habit/stackingCompletionCoordinator'
import { archiveHabit } from '../../../utils/habit/archiveHabit'
import { HabitStackingAccordion } from '../HabitStackingAccordion/HabitStackingAccordion'
import { ConfirmationModal } from '../../modal/ConfirmationModal/ConfirmationModal'
import { StreakBadge } from '../StreakBadge/StreakBadge'
import { GoalBadge } from '../GoalBadge/GoalBadge'
import type { Habit } from '../../../types/habit'
import './HabitList.css'

interface HabitListProps {
  onEdit?: (habit: Habit) => void
}

export function HabitList({ onEdit }: HabitListProps) {
  const { messages } = useLanguage()
  const { habits, activeHabits, isLoading, error, toggleHabitCompletion, updateHabit } = useHabits()
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [habitToArchive, setHabitToArchive] = useState<{ id: string; name?: string } | null>(null)

  const habitsWithCalculations = useMemo(() => {
    return activeHabits.map(habit => ({
      ...habit,
      streak: calculateStreak(habit.completionDates),
      completedToday: isTodayCompleted(habit.completionDates),
    }))
  }, [activeHabits])

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

  const handleArchiveClick = (habitId: string, habitName?: string) => {
    setHabitToArchive({ id: habitId, name: habitName })
  }

  const handleArchiveConfirm = async () => {
    if (!habitToArchive) return

    const target = habits.find(h => h.id === habitToArchive.id)
    if (!target) {
      setHabitToArchive(null)
      return
    }

    setArchivingId(habitToArchive.id)
    try {
      await updateHabit(archiveHabit(target))
      setHabitToArchive(null)
    } catch {
      // Error is already handled in context, but we catch to prevent unhandled promise rejection
    } finally {
      setArchivingId(null)
    }
  }

  const handleArchiveCancel = () => {
    setHabitToArchive(null)
  }

  const handleToggleStackingHabit = async (parentHabitId: string, stackingHabitId: string) => {
    if (!habits.find(h => h.id === parentHabitId)) return
    const toPersist = getHabitsToPersistAfterStackingToggle(habits, parentHabitId, stackingHabitId)
    if (toPersist.length === 0) return
    try {
      for (const h of toPersist) {
        await updateHabit(h)
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

  const habitDisplayName = habitToArchive?.name || messages.habitList.thisHabit

  return (
    <>
      <ConfirmationModal
        isOpen={habitToArchive !== null}
        title={messages.habitList.archiveModal.title}
        message={formatMessage(messages.habitList.archiveModal.message, { name: habitDisplayName })}
        confirmLabel={messages.habitList.archiveModal.confirm}
        cancelLabel={messages.habitList.archiveModal.cancel}
        confirmingLabel={messages.habitList.archiveModal.confirming}
        buttonVariant="warning"
        onConfirm={handleArchiveConfirm}
        onCancel={handleArchiveCancel}
        isConfirming={archivingId !== null}
      />
      <ul className="habit-list" aria-label={messages.habitList.aria.list}>
        {habitsWithCalculations.map(habit => (
          <li key={habit.id} className="habit-item">
            <div className="habit-header">
              <h3 className="habit-name">{habit.name || messages.habitList.unnamedHabit}</h3>
              <StreakBadge streak={habit.streak} />
              {habit.goalDays !== undefined && habit.goalDays.length > 0 && (
                <GoalBadge goalDays={habit.goalDays} completionDates={habit.completionDates} />
              )}
            </div>
            {habit.description && (
              <p className="habit-description">{habit.description}</p>
            )}
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
                className="habit-archive-button"
                onClick={() => handleArchiveClick(habit.id, habit.name)}
                disabled={archivingId === habit.id}
                aria-label={formatMessage(messages.habitList.aria.archiveHabit, { name: habit.name || messages.habitList.aria.habitNameFallback })}
                aria-busy={archivingId === habit.id}
              >
                {messages.habitList.buttons.archive}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

