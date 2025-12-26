import { addHabit } from '../../services/indexedDB'
import type { Habit } from '../../types/habit'

/**
 * Creates mock habits with various completion patterns for testing.
 * This utility is intended for development use only.
 */
export async function seedMockHabits(): Promise<void> {
  const now = new Date()
  
  // Helper to create date strings
  const getDateString = (daysAgo: number): string => {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    date.setHours(0, 0, 0, 0)
    return date.toISOString()
  }

  const mockHabits: Habit[] = [
    {
      id: 'habit-1',
      name: 'Exercise',
      description: 'Daily workout routine - 30 minutes of cardio',
      createdDate: getDateString(30),
      completionDates: [
        getDateString(0),  // Today
        getDateString(1),  // Yesterday
        getDateString(2),  // 2 days ago
        getDateString(3),  // 3 days ago
        getDateString(5),  // 5 days ago (gap on day 4)
        getDateString(6),
        getDateString(7),
      ],
    },
    {
      id: 'habit-2',
      name: 'Read',
      description: 'Read for at least 30 minutes',
      createdDate: getDateString(15),
      completionDates: [
        getDateString(0),  // Today
        getDateString(1),
        getDateString(2),
        getDateString(3),
        getDateString(4),
        getDateString(5),
        getDateString(6),
        getDateString(7),
        getDateString(8),
        getDateString(9),
        getDateString(10),
        getDateString(11),
        getDateString(12),
        getDateString(13),
        getDateString(14),
      ],
    },
    {
      id: 'habit-3',
      name: 'Meditation',
      description: '10 minutes of mindfulness meditation',
      createdDate: getDateString(20),
      completionDates: [
        getDateString(1),  // Yesterday (not today)
        getDateString(2),
        getDateString(3),
      ],
    },
    {
      id: 'habit-4',
      name: 'Drink Water',
      description: 'Drink 8 glasses of water',
      createdDate: getDateString(7),
      completionDates: [], // No completions yet
    },
    {
      id: 'habit-5',
      name: 'Journal',
      description: 'Write in journal before bed',
      createdDate: getDateString(5),
      completionDates: [
        getDateString(0),  // Today
      ],
    },
  ]

  try {
    // Open DB first
    const { openDB } = await import('../../services/indexedDB')
    await openDB()

    // Add all habits
    for (const habit of mockHabits) {
      try {
        await addHabit(habit)
        console.log(`✓ Added habit: ${habit.name}`)
      } catch {
        // If habit already exists, try to update it
        const { updateHabit } = await import('../../services/indexedDB')
        await updateHabit(habit)
        console.log(`✓ Updated habit: ${habit.name}`)
      }
    }

    console.log(`\n✅ Successfully seeded ${mockHabits.length} mock habits!`)
    console.log('Refresh the page to see them in the HabitList component.')
  } catch (error) {
    console.error('❌ Error seeding mock habits:', error)
    throw error
  }
}

