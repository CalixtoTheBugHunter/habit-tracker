import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { formatMessage } from '../../../locale'
import { HabitStackingAccordion } from '../HabitStackingAccordion/HabitStackingAccordion'
import { StreakBadge } from '../StreakBadge/StreakBadge'
import { GoalBadge } from '../GoalBadge/GoalBadge'
import { CategoryBadgeList } from '../CategoryBadge/CategoryBadgeList'
import type { Habit } from '../../../types/habit'
import type { Category } from '../../../types/category'

export type HabitWithListFields = Habit & { streak: number; completedToday: boolean }

interface SortableHabitItemProps {
  habit: HabitWithListFields
  habits: Habit[]
  categories: Category[]
  togglingId: string | null
  archivingId: string | null
  onEdit?: (habit: Habit) => void
  onToggle: (habitId: string) => void
  onArchiveClick: (habitId: string, habitName?: string) => void
  onToggleStackingHabit: (parentHabitId: string, stackingHabitId: string) => Promise<void>
  updateHabit: (habit: Habit) => Promise<void>
  /** Manual drag-to-reorder only makes sense in `manual` sort; disabled otherwise. */
  reorderDisabled?: boolean
}

export function SortableHabitItem({
  habit,
  habits,
  categories,
  togglingId,
  archivingId,
  onEdit,
  onToggle,
  onArchiveClick,
  onToggleStackingHabit,
  updateHabit,
  reorderDisabled = false,
}: SortableHabitItemProps) {
  const { messages } = useLanguage()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
    disabled: reorderDisabled,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 1 : undefined,
    opacity: isDragging ? 0.92 : undefined,
  }

  const handleLabel = formatMessage(messages.habitList.aria.reorderHandle, {
    name: habit.name || messages.habitList.aria.habitNameFallback,
  })

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`habit-item${isDragging ? ' habit-item--dragging' : ''}`}
      {...(reorderDisabled ? {} : attributes)}
      role="listitem"
    >
      <div className={`habit-header${reorderDisabled ? '' : ' habit-header--with-handle'}`}>
        {!reorderDisabled && (
          <button
            type="button"
            ref={setActivatorNodeRef}
            className="habit-drag-handle"
            {...listeners}
            aria-label={handleLabel}
          >
            <GripVertical size={20} aria-hidden />
          </button>
        )}
        <h3 className="habit-name">{habit.name || messages.habitList.unnamedHabit}</h3>
        <StreakBadge streak={habit.streak} />
        {habit.goalDays !== undefined && habit.goalDays.length > 0 && (
          <GoalBadge goalDays={habit.goalDays} completionDates={habit.completionDates} />
        )}
      </div>
      {habit.description && <p className="habit-description">{habit.description}</p>}
      <CategoryBadgeList categoryIds={habit.categories ?? []} categories={categories} />
      {habit.stackingHabits && habit.stackingHabits.length > 0 && (
        <HabitStackingAccordion
          parentHabit={habit}
          stackingHabitsResolved={habit.stackingHabits.map(id => habits.find(h => h.id === id))}
          onToggleStackingHabit={onToggleStackingHabit}
          updateHabit={updateHabit}
        />
      )}
      <div className="habit-actions">
        <button
          type="button"
          className={`completion-toggle ${habit.completedToday ? 'completed' : 'not-completed'}`}
          onClick={() => onToggle(habit.id)}
          disabled={togglingId === habit.id}
          aria-label={
            habit.completedToday ? messages.habitList.aria.markNotCompleted : messages.habitList.aria.markCompleted
          }
          aria-pressed={habit.completedToday}
          aria-busy={togglingId === habit.id}
        >
          {togglingId === habit.id
            ? messages.habitList.buttons.updating
            : habit.completedToday
              ? messages.habitList.buttons.completed
              : messages.habitList.buttons.markDone}
        </button>
        {onEdit && (
          <button
            type="button"
            className="habit-edit-button"
            onClick={() => onEdit(habit)}
            aria-label={formatMessage(messages.habitList.aria.editHabit, {
              name: habit.name || messages.habitList.aria.habitNameFallback,
            })}
          >
            {messages.habitList.buttons.edit}
          </button>
        )}
        <button
          type="button"
          className="habit-archive-button"
          onClick={() => onArchiveClick(habit.id, habit.name)}
          disabled={archivingId === habit.id}
          aria-label={formatMessage(messages.habitList.aria.archiveHabit, {
            name: habit.name || messages.habitList.aria.habitNameFallback,
          })}
          aria-busy={archivingId === habit.id}
        >
          {messages.habitList.buttons.archive}
        </button>
      </div>
    </li>
  )
}
