import { useMemo } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { formatMessage } from '../../locale'
import { calculateStreak } from '../../utils/habit/calculateStreak'
import {
  calculateLongestStreak,
  calculateCompletionRate,
  calculateTotalDaysTracked,
  calculateWeeklyCompletionRate,
  calculateMonthlyCompletionRate,
  calculateGoalProgress,
} from '../../utils/habit/statisticsCalculations'
import { AnnualCalendar } from '../habit/AnnualCalendar/AnnualCalendar'
import type { Habit } from '../../types/habit'
import './HabitStatisticsCard.css'

interface HabitStatisticsCardProps {
  habit: Habit
}

export function HabitStatisticsCard({ habit }: HabitStatisticsCardProps) {
  const { messages } = useLanguage()

  const stats = useMemo(() => ({
    currentStreak: calculateStreak(habit.completionDates),
    longestStreak: calculateLongestStreak(habit.completionDates),
    completionRate: calculateCompletionRate(habit.completionDates, habit.createdDate),
    weeklyRate: calculateWeeklyCompletionRate(habit.completionDates),
    monthlyRate: calculateMonthlyCompletionRate(habit.completionDates),
    totalDaysTracked: calculateTotalDaysTracked(habit.createdDate),
    goalProgress: habit.goalDays !== undefined && habit.goalDays.length > 0
      ? calculateGoalProgress(habit.completionDates, habit.goalDays)
      : null,
  }), [habit.completionDates, habit.createdDate, habit.goalDays])

  return (
    <article className="habit-stats-card">
      <h3 className="habit-stats-card__name">
        {habit.name || messages.habitList.unnamedHabit}
      </h3>

      <div className="habit-stats-card__grid">
        <div className="habit-stats-card__stat">
          <span className="habit-stats-card__stat-label">{messages.statistics.currentStreak}</span>
          <span className="habit-stats-card__stat-value">
            {stats.currentStreak} {messages.statistics.daysUnit}
          </span>
        </div>

        <div className="habit-stats-card__stat">
          <span className="habit-stats-card__stat-label">{messages.statistics.longestStreak}</span>
          <span className="habit-stats-card__stat-value">
            {stats.longestStreak} {messages.statistics.daysUnit}
          </span>
        </div>

        <div className="habit-stats-card__stat">
          <span className="habit-stats-card__stat-label">{messages.statistics.totalDaysTracked}</span>
          <span className="habit-stats-card__stat-value">
            {stats.totalDaysTracked} {messages.statistics.daysUnit}
          </span>
        </div>

        <div className="habit-stats-card__stat">
          <span className="habit-stats-card__stat-label">{messages.statistics.completionRate}</span>
          <span className="habit-stats-card__stat-value">{stats.completionRate}%</span>
          <div className="habit-stats-card__progress-bar" role="progressbar" aria-valuenow={stats.completionRate} aria-valuemin={0} aria-valuemax={100} aria-label={messages.statistics.completionRate}>
            <div className="habit-stats-card__progress-fill" style={{ width: `${stats.completionRate}%` }} />
          </div>
        </div>

        <div className="habit-stats-card__stat">
          <span className="habit-stats-card__stat-label">{messages.statistics.weeklyRate}</span>
          <span className="habit-stats-card__stat-value">{stats.weeklyRate}%</span>
          <div className="habit-stats-card__progress-bar" role="progressbar" aria-valuenow={stats.weeklyRate} aria-valuemin={0} aria-valuemax={100} aria-label={messages.statistics.weeklyRate}>
            <div className="habit-stats-card__progress-fill" style={{ width: `${stats.weeklyRate}%` }} />
          </div>
        </div>

        <div className="habit-stats-card__stat">
          <span className="habit-stats-card__stat-label">{messages.statistics.monthlyRate}</span>
          <span className="habit-stats-card__stat-value">{stats.monthlyRate}%</span>
          <div className="habit-stats-card__progress-bar" role="progressbar" aria-valuenow={stats.monthlyRate} aria-valuemin={0} aria-valuemax={100} aria-label={messages.statistics.monthlyRate}>
            <div className="habit-stats-card__progress-fill" style={{ width: `${stats.monthlyRate}%` }} />
          </div>
        </div>
      </div>

      {stats.goalProgress !== null && (
        <div className="habit-stats-card__goal">
          <span className="habit-stats-card__stat-label">{messages.statistics.goalProgress}</span>
          <span className="habit-stats-card__stat-value">
            {formatMessage(messages.statistics.goalProgressValue, {
              completed: stats.goalProgress.completed,
              target: stats.goalProgress.target,
            })}
          </span>
          <div className="habit-stats-card__progress-bar" role="progressbar" aria-valuenow={stats.goalProgress.percentage} aria-valuemin={0} aria-valuemax={100} aria-label={messages.statistics.goalProgress}>
            <div className="habit-stats-card__progress-fill" style={{ width: `${stats.goalProgress.percentage}%` }} />
          </div>
        </div>
      )}

      <AnnualCalendar habit={habit} />
    </article>
  )
}
