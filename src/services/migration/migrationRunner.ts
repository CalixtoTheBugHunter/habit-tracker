import type { Habit } from '../../types/habit'
import type { Migration, MigrationLogEntry, MigrationBackup } from './types'
import { STORE_NAME, SETTINGS_STORE } from '../indexedDB'
import { IndexedDBError } from '../../utils/error/errorTypes'
import { logError } from '../../utils/error/errorLogger'

const DATA_VERSION_KEY = 'dataVersion'
const MIGRATION_LOG_KEY = 'migrationLog'
const MIGRATION_BACKUP_KEY = 'migrationBackup'

function settingsGet(db: IDBDatabase, key: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SETTINGS_STORE], 'readonly')
    const store = transaction.objectStore(SETTINGS_STORE)
    const request = store.get(key)

    request.onsuccess = () => {
      const row = request.result as { key: string; value: string } | undefined
      resolve(row?.value)
    }
    request.onerror = () => {
      reject(request.error ?? new Error(`Failed to read setting: ${key}`))
    }
  })
}

function settingsPut(db: IDBDatabase, key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SETTINGS_STORE], 'readwrite')
    const store = transaction.objectStore(SETTINGS_STORE)
    const request = store.put({ key, value })

    request.onsuccess = () => resolve()
    request.onerror = () => {
      reject(request.error ?? new Error(`Failed to write setting: ${key}`))
    }
  })
}

export function habitsGetAll(db: IDBDatabase): Promise<Habit[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result ?? [])
    request.onerror = () => {
      reject(request.error ?? new Error('Failed to read all habits'))
    }
  })
}

export function habitsClearAndRestore(db: IDBDatabase, habits: Habit[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const clearRequest = store.clear()

    clearRequest.onsuccess = () => {
      let putCount = 0
      if (habits.length === 0) {
        resolve()
        return
      }
      for (const habit of habits) {
        const putRequest = store.put(habit)
        putRequest.onsuccess = () => {
          putCount++
          if (putCount === habits.length) {
            resolve()
          }
        }
        putRequest.onerror = () => {
          reject(putRequest.error ?? new Error('Failed to restore habit'))
        }
      }
    }
    clearRequest.onerror = () => {
      reject(clearRequest.error ?? new Error('Failed to clear habits store'))
    }
  })
}

export async function getCurrentDataVersion(db: IDBDatabase): Promise<number> {
  const raw = await settingsGet(db, DATA_VERSION_KEY)
  if (raw === undefined) return 0
  const parsed = parseInt(raw, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

export async function createBackup(db: IDBDatabase, currentVersion: number): Promise<void> {
  const habits = await habitsGetAll(db)
  const backup: MigrationBackup = {
    version: currentVersion,
    timestamp: new Date().toISOString(),
    habits,
  }
  await settingsPut(db, MIGRATION_BACKUP_KEY, JSON.stringify(backup))
}

export async function restoreFromBackup(db: IDBDatabase): Promise<void> {
  const raw = await settingsGet(db, MIGRATION_BACKUP_KEY)
  if (!raw) return

  const backup: MigrationBackup = JSON.parse(raw)
  await habitsClearAndRestore(db, backup.habits)
  await settingsPut(db, DATA_VERSION_KEY, String(backup.version))
}

export async function getMigrationLog(db: IDBDatabase): Promise<MigrationLogEntry[]> {
  const raw = await settingsGet(db, MIGRATION_LOG_KEY)
  if (!raw) return []
  return JSON.parse(raw) as MigrationLogEntry[]
}

async function addMigrationLog(db: IDBDatabase, entry: MigrationLogEntry): Promise<void> {
  const log = await getMigrationLog(db)
  log.push(entry)
  await settingsPut(db, MIGRATION_LOG_KEY, JSON.stringify(log))
}

export async function runMigrations(db: IDBDatabase, migrations: Migration[]): Promise<void> {
  const sorted = [...migrations].sort((a, b) => a.version - b.version)
  const currentVersion = await getCurrentDataVersion(db)
  const pending = sorted.filter((m) => m.version > currentVersion)

  if (pending.length === 0) return

  try {
    await createBackup(db, currentVersion)
  } catch (backupError) {
    const error = backupError instanceof Error ? backupError : new Error(String(backupError))
    const warning = new IndexedDBError(
      'INDEXEDDB_MIGRATION_FAILED',
      'Backup before migration failed, proceeding without backup.',
      error.message
    )
    logError(warning)
  }

  for (const migration of pending) {
    const startTime = Date.now()
    try {
      await migration.migrate(db)

      await settingsPut(db, DATA_VERSION_KEY, String(migration.version))

      await addMigrationLog(db, {
        version: migration.version,
        name: migration.name,
        timestamp: new Date().toISOString(),
        status: 'success',
        durationMs: Date.now() - startTime,
      })
    } catch (migrationError) {
      const errorMessage =
        migrationError instanceof Error ? migrationError.message : String(migrationError)

      await addMigrationLog(db, {
        version: migration.version,
        name: migration.name,
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: errorMessage,
        durationMs: Date.now() - startTime,
      })

      try {
        await restoreFromBackup(db)
      } catch {
        // Restore failed — data may be in an inconsistent state
      }

      const indexedDBError = new IndexedDBError(
        'INDEXEDDB_MIGRATION_FAILED',
        'Data migration failed. Your data has been restored from backup.',
        `Migration "${migration.name}" (v${migration.version}) failed: ${errorMessage}`
      )
      logError(indexedDBError)
      throw indexedDBError
    }
  }
}
