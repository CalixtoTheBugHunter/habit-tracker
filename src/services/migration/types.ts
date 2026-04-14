import type { Habit } from '../../types/habit'

export interface Migration {
  version: number
  name: string
  migrate: (db: IDBDatabase) => Promise<void>
}

export interface MigrationLogEntry {
  version: number
  name: string
  timestamp: string
  status: 'success' | 'failed'
  error?: string
  durationMs: number
}

export interface MigrationBackup {
  version: number
  timestamp: string
  habits: Habit[]
}
