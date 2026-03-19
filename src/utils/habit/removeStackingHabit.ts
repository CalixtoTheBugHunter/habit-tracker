import type { Habit } from '../../types/habit'

/**
 * Returns a new habit with the given stacking habit id removed from stackingHabits
 * and from stackingCompletions. Does not mutate the input.
 */
export function removeStackingHabit(
  parentHabit: Habit,
  stackingHabitId: string
): Habit {
  const nextStackingHabits = parentHabit.stackingHabits?.filter(id => id !== stackingHabitId)
  const nextStackingCompletions = parentHabit.stackingCompletions
    ? { ...parentHabit.stackingCompletions }
    : undefined
  if (nextStackingCompletions && stackingHabitId in nextStackingCompletions) {
    delete nextStackingCompletions[stackingHabitId]
  }
  const nextStackingStepLabels = parentHabit.stackingStepLabels
    ? { ...parentHabit.stackingStepLabels }
    : undefined
  if (nextStackingStepLabels && stackingHabitId in nextStackingStepLabels) {
    delete nextStackingStepLabels[stackingHabitId]
  }
  return {
    ...parentHabit,
    stackingHabits:
      nextStackingHabits && nextStackingHabits.length > 0 ? nextStackingHabits : undefined,
    stackingCompletions:
      nextStackingCompletions && Object.keys(nextStackingCompletions).length > 0
        ? nextStackingCompletions
        : undefined,
    stackingStepLabels:
      nextStackingStepLabels && Object.keys(nextStackingStepLabels).length > 0
        ? nextStackingStepLabels
        : undefined,
  }
}
