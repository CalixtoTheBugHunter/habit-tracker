import { addHabit, deleteHabit, getAllHabits, openDB, updateHabit } from '../../services/indexedDB'
import type { Habit } from '../../types/habit'

const ACCEPTANCE_HABIT_IDS = [
  'acceptance-goal-a',
  'acceptance-goal-b',
  'acceptance-daily-c',
] as const

function createDateStringFromNow(now: Date, daysAgo: number): string {
  const date = new Date(now)
  date.setDate(date.getDate() - daysAgo)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

/** Days ago for the most recent occurrence of a JS weekday (0=Sun … 6=Sat). */
function daysAgoForJsWeekday(now: Date, jsWeekday: number, maxLookback = 14): number {
  for (let daysAgo = 0; daysAgo <= maxLookback; daysAgo++) {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    if (date.getDay() === jsWeekday) {
      return daysAgo
    }
  }
  throw new Error(`No ${jsWeekday} weekday found within ${maxLookback} days`)
}

async function upsertHabits(habits: Habit[]): Promise<void> {
  await openDB()
  for (const habit of habits) {
    try {
      await addHabit(habit)
      console.log(`✓ Added habit: ${habit.name}`)
    } catch {
      await updateHabit(habit)
      console.log(`✓ Updated habit: ${habit.name}`)
    }
  }
}

/**
 * Seeds habits for Cursor Browser acceptance of goal-days streak (AC1–AC4).
 * Call from dev console: `await window.seedGoalDaysStreakAcceptance()` then refresh.
 */
export async function seedGoalDaysStreakAcceptance(): Promise<void> {
  const now = new Date()
  const weekdayGoalDays = [1, 2, 3, 4, 5] // Mon–Fri
  const wed = daysAgoForJsWeekday(now, 3)
  const thu = daysAgoForJsWeekday(now, 4)
  const fri = daysAgoForJsWeekday(now, 5)
  const created = createDateStringFromNow(now, 30)

  const habits: Habit[] = [
    {
      id: 'acceptance-goal-a',
      name: 'PR Review',
      description: 'AC1: Mon–Fri goal; Wed–Fri done; weekend skipped',
      createdDate: created,
      goalDays: weekdayGoalDays,
      completionDates: [
        createDateStringFromNow(now, wed),
        createDateStringFromNow(now, thu),
        createDateStringFromNow(now, fri),
      ],
    },
    {
      id: 'acceptance-goal-b',
      name: 'PR Review (Fri missed)',
      description: 'AC2: Mon–Fri goal; Wed–Thu only',
      createdDate: created,
      goalDays: weekdayGoalDays,
      completionDates: [
        createDateStringFromNow(now, wed),
        createDateStringFromNow(now, thu),
      ],
    },
    {
      id: 'acceptance-daily-c',
      name: 'Daily Habit',
      description: 'AC4: no goalDays; today + yesterday',
      createdDate: created,
      completionDates: [
        createDateStringFromNow(now, 0),
        createDateStringFromNow(now, 1),
      ],
    },
  ]

  const existing = await getAllHabits()
  for (const habit of existing) {
    await deleteHabit(habit.id)
  }

  await upsertHabits(habits)
  console.log('\n✅ Goal-days streak acceptance data seeded (AC1–AC4).')
  console.log('Refresh the page to verify streak badges and Statistics.')
}

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
      stackingHabits: ['habit-2'],
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
    await upsertHabits(mockHabits)
    console.log(`\n✅ Successfully seeded ${mockHabits.length} mock habits!`)
    console.log('Refresh the page to see them in the HabitList component.')
  } catch (error) {
    console.error('❌ Error seeding mock habits:', error)
    throw error
  }
}

