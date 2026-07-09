import type { Habit } from '../../types/habit'
import type { Migration } from './types'
import { habitsGetAll, habitsClearAndRestore } from './migrationRunner'

function compareCreatedDateThenId(a: Habit, b: Habit): number {
  const byDate = a.createdDate.localeCompare(b.createdDate)
  if (byDate !== 0) return byDate
  return a.id.localeCompare(b.id)
}

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'backfill-sort-order',
    async migrate(db) {
      const habits = await habitsGetAll(db)
      const sorted = [...habits].sort(compareCreatedDateThenId)
      const withSortOrder = sorted.map((h, index) => ({ ...h, sortOrder: index }))
      await habitsClearAndRestore(db, withSortOrder)
    },
  },
  {
    version: 2,
    name: 'categories-store-support',
    async migrate(db) {
      // Non-destructive: the `categories` object store is created structurally in
      // openDB's onupgradeneeded, and `Habit.categories` is an optional additive
      // field, so no habit data needs to change. This read-only step verifies the
      // habits store is accessible before the runner advances the data version —
      // it performs no writes, so existing habit data cannot be lost here.
      await habitsGetAll(db)
    },
  },
]
