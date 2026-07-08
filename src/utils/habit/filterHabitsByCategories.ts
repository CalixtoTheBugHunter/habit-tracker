import type { Habit } from '../../types/habit'

/**
 * Filters habits by a set of selected category IDs (OR semantics).
 *
 * @param habits - Habits to filter
 * @param selectedCategoryIds - Category IDs to filter by; an empty array disables filtering
 * @returns All habits when no category is selected, otherwise the habits that
 * reference at least one of the selected categories
 */
export function filterHabitsByCategories<T extends Pick<Habit, 'categories'>>(
  habits: T[],
  selectedCategoryIds: string[]
): T[] {
  if (selectedCategoryIds.length === 0) {
    return habits
  }
  const selected = new Set(selectedCategoryIds)
  return habits.filter(habit => (habit.categories ?? []).some(id => selected.has(id)))
}
