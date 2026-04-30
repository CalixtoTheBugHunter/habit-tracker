import { useState } from 'react'
import { useHabits } from '../../contexts/HabitContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { formatMessage } from '../../locale'
import { restoreHabit } from '../../utils/habit/restoreHabit'
import { ConfirmationModal } from '../modal/ConfirmationModal/ConfirmationModal'
import './ArchivedHabitsView.css'

export function ArchivedHabitsView() {
  const { messages } = useLanguage()
  const { archivedHabits, updateHabit, deleteHabit } = useHabits()
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [habitToDelete, setHabitToDelete] = useState<{ id: string; name?: string } | null>(null)

  const archivedMessages = messages.archivedHabits

  const handleRestore = async (habitId: string) => {
    const target = archivedHabits.find(h => h.id === habitId)
    if (!target) return

    setRestoringId(habitId)
    try {
      await updateHabit(restoreHabit(target))
    } catch {
      // Error is already handled in context
    } finally {
      setRestoringId(null)
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
      // Error is already handled in context
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteCancel = () => {
    setHabitToDelete(null)
  }

  const habitDisplayName = habitToDelete?.name || archivedMessages.aria.habitNameFallback

  return (
    <div className="archived-habits-view">
      <h2 className="archived-habits-view__title">{archivedMessages.title}</h2>
      {archivedHabits.length === 0 ? (
        <p className="archived-habits-view__empty">{archivedMessages.empty}</p>
      ) : (
        <ul className="archived-habits-view__list" aria-label={archivedMessages.aria.list}>
          {archivedHabits.map(habit => {
            const displayName = habit.name || archivedMessages.aria.habitNameFallback
            const archivedDate = new Date(habit.archivedAt!).toLocaleDateString()
            return (
              <li key={habit.id} className="archived-habits-view__item">
                <h3 className="archived-habits-view__name">{displayName}</h3>
                {habit.description && (
                  <p className="archived-habits-view__description">{habit.description}</p>
                )}
                <p className="archived-habits-view__date">
                  {formatMessage(archivedMessages.archivedOn, { date: archivedDate })}
                </p>
                <div className="archived-habits-view__actions">
                  <button
                    type="button"
                    className="archived-habits-view__restore-button"
                    onClick={() => handleRestore(habit.id)}
                    disabled={restoringId === habit.id}
                    aria-label={formatMessage(archivedMessages.aria.restoreHabit, { name: displayName })}
                    aria-busy={restoringId === habit.id}
                  >
                    {archivedMessages.buttons.restore}
                  </button>
                  <button
                    type="button"
                    className="archived-habits-view__delete-button"
                    onClick={() => handleDeleteClick(habit.id, habit.name)}
                    disabled={deletingId === habit.id}
                    aria-label={formatMessage(archivedMessages.aria.deleteHabit, { name: displayName })}
                    aria-busy={deletingId === habit.id}
                  >
                    {archivedMessages.buttons.delete}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <ConfirmationModal
        isOpen={habitToDelete !== null}
        title={archivedMessages.deleteModal.title}
        message={formatMessage(archivedMessages.deleteModal.message, { name: habitDisplayName })}
        confirmLabel={archivedMessages.deleteModal.confirm}
        cancelLabel={archivedMessages.deleteModal.cancel}
        confirmingLabel={archivedMessages.deleteModal.confirming}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isConfirming={deletingId !== null}
      />
    </div>
  )
}
