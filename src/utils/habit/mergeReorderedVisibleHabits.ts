/**
 * Merges a reordered subset of visible habit IDs back into the full active
 * habit ordering, preserving the positions of habits hidden by a filter.
 *
 * When a category filter is active only a subset of active habits is shown, so a
 * drag reorders just that subset. The visible habits occupy a fixed set of
 * "slots" within the full active ordering; the reordered IDs are placed back
 * into those same slots in order, leaving filtered-out habits untouched.
 *
 * @param activeIds - All active habit IDs in their current display order
 * @param reorderedVisibleIds - The visible subset IDs in their new (post-drag) order
 * @returns A full ordering of `activeIds` with the visible slots reordered
 */
export function mergeReorderedVisibleHabits(
  activeIds: string[],
  reorderedVisibleIds: string[]
): string[] {
  const visible = new Set(reorderedVisibleIds)
  let cursor = 0
  return activeIds.map(id => {
    if (!visible.has(id)) {
      return id
    }
    return reorderedVisibleIds[cursor++] ?? id
  })
}
