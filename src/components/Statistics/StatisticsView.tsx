import { useHabits } from '../../contexts/HabitContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { HabitStatisticsCard } from './HabitStatisticsCard'
import './StatisticsView.css'

export function StatisticsView() {
  const { messages } = useLanguage()
  const { activeHabits } = useHabits()

  if (activeHabits.length === 0) {
    return (
      <div className="statistics-view">
        <h2 className="statistics-view__title">{messages.statistics.title}</h2>
        <p className="statistics-view__empty">{messages.statistics.empty}</p>
      </div>
    )
  }

  return (
    <div className="statistics-view">
      <h2 className="statistics-view__title">{messages.statistics.title}</h2>
      {activeHabits.map(habit => (
        <HabitStatisticsCard key={habit.id} habit={habit} />
      ))}
    </div>
  )
}
