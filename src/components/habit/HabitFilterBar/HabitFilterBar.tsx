import { useHabitFilter } from '../../../contexts/HabitFilterContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { formatMessage } from '../../../locale'
import {
  COMPLETION_STATUS_FILTERS,
  STREAK_RANGE_FILTERS,
  HABIT_SORT_OPTIONS,
  type CompletionStatusFilter,
  type StreakRangeFilter,
  type HabitSortBy,
} from '../../../types/habitFilter'
import './HabitFilterBar.css'

export function HabitFilterBar() {
  const { messages } = useLanguage()
  const {
    criteria,
    setSearchQuery,
    setCompletionStatus,
    setStreakRange,
    setSortBy,
    clearFilters,
    hasActiveFilters,
  } = useHabitFilter()

  const statusLabels: Record<CompletionStatusFilter, string> = {
    all: messages.habitFilter.status.all,
    'completed-today': messages.habitFilter.status.completedToday,
    'not-completed-today': messages.habitFilter.status.notCompletedToday,
    'active-streak': messages.habitFilter.status.activeStreak,
  }

  const streakLabels: Record<StreakRangeFilter, string> = {
    all: messages.habitFilter.streak.all,
    '0': messages.habitFilter.streak.zero,
    '1-7': messages.habitFilter.streak.oneToSeven,
    '8-30': messages.habitFilter.streak.eightToThirty,
    '30+': messages.habitFilter.streak.thirtyPlus,
  }

  const sortLabels: Record<HabitSortBy, string> = {
    manual: messages.habitFilter.sort.manual,
    name: messages.habitFilter.sort.name,
    streak: messages.habitFilter.sort.streak,
    createdDate: messages.habitFilter.sort.createdDate,
  }

  return (
    <div className="habit-filter" role="group" aria-label={messages.habitFilter.label}>
      <input
        type="search"
        className="habit-filter__search"
        value={criteria.searchQuery}
        onChange={event => setSearchQuery(event.target.value)}
        placeholder={messages.habitFilter.searchPlaceholder}
        aria-label={messages.habitFilter.searchLabel}
      />

      <div className="habit-filter__filters">
        <span className="habit-filter__select-wrap">
          <select
            className="habit-filter__select"
            value={criteria.completionStatus}
            onChange={event => setCompletionStatus(event.target.value as CompletionStatusFilter)}
            aria-label={messages.habitFilter.statusLabel}
          >
            {COMPLETION_STATUS_FILTERS.map(status => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </span>

        <div className="habit-filter__group" role="group" aria-label={messages.habitFilter.streakLabel}>
          {STREAK_RANGE_FILTERS.map(range => {
            const active = criteria.streakRange === range
            return (
              <button
                key={range}
                type="button"
                className={`habit-filter__chip${active ? ' habit-filter__chip--active' : ''}`}
                onClick={() => setStreakRange(range)}
                aria-pressed={active}
                aria-label={formatMessage(messages.habitFilter.streakChipAria, {
                  label: streakLabels[range],
                })}
              >
                {streakLabels[range]}
              </button>
            )
          })}
        </div>
      </div>

      <span className="habit-filter__select-wrap">
        <select
          className="habit-filter__select"
          value={criteria.sortBy}
          onChange={event => setSortBy(event.target.value as HabitSortBy)}
          aria-label={messages.habitFilter.sortLabel}
        >
          {HABIT_SORT_OPTIONS.map(option => (
            <option key={option} value={option}>
              {sortLabels[option]}
            </option>
          ))}
        </select>
      </span>

      <button
        type="button"
        className="habit-filter__clear"
        onClick={clearFilters}
        disabled={!hasActiveFilters}
        aria-label={messages.habitFilter.clearAria}
      >
        {messages.habitFilter.clear}
      </button>
    </div>
  )
}
