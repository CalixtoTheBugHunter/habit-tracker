import type { Habit } from '../../types/habit'

/**
 * Removes a category ID from every habit that references it.
 *
 * @param habits - All habits to inspect
 * @param categoryId - The category ID to strip
 * @returns Only the habits that changed, each with the category ID removed
 * (the `categories` field becomes `undefined` when no categories remain)
 */
export function removeCategoryFromHabits(habits: Habit[], categoryId: string): Habit[] {
  const changed: Habit[] = []
  for (const habit of habits) {
    if (habit.categories?.includes(categoryId)) {
      const next = habit.categories.filter(id => id !== categoryId)
      changed.push({ ...habit, categories: next.length > 0 ? next : undefined })
    }
  }
  return changed
}
