import { useLanguage } from '../../../contexts/LanguageContext'
import { formatMessage } from '../../../locale'
import { calculateGoalProgress } from '../../../utils/habit/statisticsCalculations'
import './GoalBadge.css'

interface GoalBadgeProps {
  goalDays: number[]
  completionDates: string[]
}

export function GoalBadge({ goalDays, completionDates }: GoalBadgeProps) {
  const { messages } = useLanguage()
  const progress = calculateGoalProgress(completionDates, goalDays)

  if (progress.percentage < 100) {
    return null
  }

  const ariaLabel = formatMessage(messages.goalBadge.goalMetAriaLabel, {
    completed: progress.completed,
    target: progress.target,
  })

  return (
    <span className="goal-badge" aria-label={ariaLabel}>
      {messages.statistics.goalMet}
    </span>
  )
}
