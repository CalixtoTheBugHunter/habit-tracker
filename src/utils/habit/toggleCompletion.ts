import { getTodayUTCDateString, getUTCDateString } from '../date/dateHelpers'
import { isTodayCompleted } from './isTodayCompleted'
import type { Habit } from '../../types/habit'

/**
 * Toggles completion for today's date for a habit.
 * 
 * If today is already completed, removes it from completionDates.
 * If today is not completed, adds it to completionDates.
 * Prevents duplicate completions for the same date.
 * 
 * @param habit - The habit to toggle completion for
 * @returns A new habit object with updated completionDates
 */
export function toggleCompletion(habit: Habit): Habit {
  const todayStr = getTodayUTCDateString()
  const todayISO = `${todayStr}T00:00:00.000Z`
  
  const isCompleted = isTodayCompleted(habit.completionDates)
  
  if (isCompleted) {
    const updatedCompletionDates = habit.completionDates.filter(dateStr => {
      return getUTCDateString(dateStr) !== todayStr
    })
    
    return {
      ...habit,
      completionDates: updatedCompletionDates,
    }
  } else {
    return {
      ...habit,
      completionDates: [...habit.completionDates, todayISO],
    }
  }
}

