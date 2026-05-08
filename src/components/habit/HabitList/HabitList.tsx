import { useMemo, useState, useRef, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useHabits } from '../../../contexts/HabitContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { formatMessage } from '../../../locale'
import { calculateStreak } from '../../../utils/habit/calculateStreak'
import { isTodayCompleted } from '../../../utils/habit/isTodayCompleted'
import { getHabitsToPersistAfterStackingToggle } from '../../../utils/habit/stackingCompletionCoordinator'
import { archiveHabit } from '../../../utils/habit/archiveHabit'
import { ConfirmationModal } from '../../modal/ConfirmationModal/ConfirmationModal'
import { SortableHabitItem } from './SortableHabitItem'
import type { Habit } from '../../../types/habit'
import './HabitList.css'

interface HabitListProps {
  onEdit?: (habit: Habit) => void
}

export function HabitList({ onEdit }: HabitListProps) {
  const { messages } = useLanguage()
  const { habits, activeHabits, isLoading, error, toggleHabitCompletion, updateHabit, reorderActiveHabits } =
    useHabits()
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [habitToArchive, setHabitToArchive] = useState<{ id: string; name?: string } | null>(null)
  const [reorderAnnouncement, setReorderAnnouncement] = useState<string | null>(null)
  const announcementClearRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const habitsWithCalculations = useMemo(() => {
    return activeHabits.map(habit => ({
      ...habit,
      streak: calculateStreak(habit.completionDates),
      completedToday: isTodayCompleted(habit.completionDates),
    }))
  }, [activeHabits])

  const sortableItemIds = useMemo(() => habitsWithCalculations.map(h => h.id), [habitsWithCalculations])

  const scheduleClearAnnouncement = useCallback(() => {
    if (announcementClearRef.current !== null) {
      globalThis.clearTimeout(announcementClearRef.current)
    }
    announcementClearRef.current = globalThis.setTimeout(() => {
      setReorderAnnouncement(null)
      announcementClearRef.current = null
    }, 3000)
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }
    const oldIndex = sortableItemIds.indexOf(String(active.id))
    const newIndex = sortableItemIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) {
      return
    }
    const nextOrder = arrayMove(sortableItemIds, oldIndex, newIndex)
    try {
      await reorderActiveHabits(nextOrder)
      setReorderAnnouncement(messages.habitList.reorderAnnouncement)
      scheduleClearAnnouncement()
    } catch {
      // Error surfaced via HabitContext
    }
  }

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
      <div className="habit-list-wrapper">
        <div className="habit-list__sr-announcement" role="status" aria-live="polite" aria-atomic="true">
          {reorderAnnouncement}
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableItemIds} strategy={verticalListSortingStrategy}>
            <ul className="habit-list" aria-label={messages.habitList.aria.list}>
              {habitsWithCalculations.map(habit => (
                <SortableHabitItem
                  key={habit.id}
                  habit={habit}
                  habits={habits}
                  togglingId={togglingId}
                  archivingId={archivingId}
                  onEdit={onEdit}
                  onToggle={handleToggle}
                  onArchiveClick={handleArchiveClick}
                  onToggleStackingHabit={handleToggleStackingHabit}
                  updateHabit={updateHabit}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </>
  )
}
