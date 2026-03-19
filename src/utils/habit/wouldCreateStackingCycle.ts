import type { Habit } from '../../types/habit'

/**
 * Returns true if adding candidateId to currentHabitId's stacking list would create a cycle.
 * Uses BFS from candidateId following stackingHabits; if currentHabitId is reachable, adding would create a cycle.
 */
export function wouldCreateStackingCycle(
  currentHabitId: string,
  candidateId: string,
  habits: Habit[]
): boolean {
  if (candidateId === currentHabitId) {
    return true
  }
  const habitById = new Map(habits.map(h => [h.id, h]))
  if (!habitById.has(candidateId)) {
    return false
  }
  const visited = new Set<string>()
  const queue: string[] = [candidateId]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    if (id === currentHabitId) return true
    const habit = habitById.get(id)
    const nextIds = habit?.stackingHabits ?? []
    for (const nextId of nextIds) {
      if (!visited.has(nextId)) queue.push(nextId)
    }
  }
  return false
}
