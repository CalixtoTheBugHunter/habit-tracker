import type { Habit } from '../../types/habit'
import { toggleCompletion } from './toggleCompletion'
import { toggleStackingHabitCompletion } from './toggleStackingHabitCompletion'
import { syncParentMainCompletionWithStackingState } from './checkAutoCompletion'

function resolveStackingHabits(
  parent: Habit,
  habits: Habit[]
): (Habit | undefined)[] {
  const ids = parent.stackingHabits ?? []
  return ids.map(id => habits.find(h => h.id === id))
}

/**
 * Computes which habits must be persisted after toggling one stacked step.
 * When both parent and child update, the child appears first in the array.
 */
export function getHabitsToPersistAfterStackingToggle(
  habits: Habit[],
  parentHabitId: string,
  stackingHabitId: string
): Habit[] {
  const parentHabit = habits.find(h => h.id === parentHabitId)
  if (!parentHabit) {
    return []
  }

  const stackingHabit = habits.find(h => h.id === stackingHabitId)

  if (stackingHabit) {
    const toggledChild = toggleCompletion(stackingHabit)
    const habitsNext = habits.map(h => (h.id === stackingHabitId ? toggledChild : h))
    const parentAfter = habitsNext.find(h => h.id === parentHabitId)
    if (!parentAfter?.stackingHabits?.length) {
      return [toggledChild]
    }
    const resolved = resolveStackingHabits(parentAfter, habitsNext)
    const parentFinal = syncParentMainCompletionWithStackingState(parentAfter, resolved)
    if (parentFinal === parentAfter) {
      return [toggledChild]
    }
    return [toggledChild, parentFinal]
  }

  const toggledParent = toggleStackingHabitCompletion(parentHabit, stackingHabitId)
  const habitsNext = habits.map(h => (h.id === parentHabitId ? toggledParent : h))
  if (!toggledParent.stackingHabits?.length) {
    return [toggledParent]
  }
  const resolved = resolveStackingHabits(toggledParent, habitsNext)
  const parentFinal = syncParentMainCompletionWithStackingState(toggledParent, resolved)
  return [parentFinal]
}
