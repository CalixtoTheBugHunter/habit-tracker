import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  runMigrations,
  getCurrentDataVersion,
  getMigrationLog,
  restoreFromBackup,
  createBackup,
} from './migrationRunner'
import type { Migration } from './types'

function createMockStoreBackedByMap(data: Map<string, unknown>) {
  return {
    get: vi.fn((key: string) => {
      const request = {
        result: undefined as unknown,
        error: null as Error | null,
        onsuccess: null as ((event: unknown) => void) | null,
        onerror: null as ((event: unknown) => void) | null,
      }
      globalThis.queueMicrotask(() => {
        request.result = data.has(key) ? data.get(key) : undefined
        request.onsuccess?.({ target: { result: request.result } })
      })
      return request
    }),
    put: vi.fn((record: Record<string, unknown>) => {
      const request = {
        result: undefined as unknown,
        error: null as Error | null,
        onsuccess: null as ((event: unknown) => void) | null,
        onerror: null as ((event: unknown) => void) | null,
      }
      const mapKey = (record.key ?? record.id ?? JSON.stringify(record)) as string
      globalThis.queueMicrotask(() => {
        data.set(mapKey, record)
        request.result = mapKey
        request.onsuccess?.({ target: { result: request.result } })
      })
      return request
    }),
    getAll: vi.fn(() => {
      const request = {
        result: undefined as unknown,
        error: null as Error | null,
        onsuccess: null as ((event: unknown) => void) | null,
        onerror: null as ((event: unknown) => void) | null,
      }
      globalThis.queueMicrotask(() => {
        request.result = Array.from(data.values())
        request.onsuccess?.({ target: { result: request.result } })
      })
      return request
    }),
    clear: vi.fn(() => {
      const request = {
        result: undefined as unknown,
        error: null as Error | null,
        onsuccess: null as ((event: unknown) => void) | null,
        onerror: null as ((event: unknown) => void) | null,
      }
      globalThis.queueMicrotask(() => {
        data.clear()
        request.onsuccess?.({ target: { result: undefined } })
      })
      return request
    }),
  }
}

describe('Migration Runner', () => {
  let settingsData: Map<string, unknown>
  let habitsData: Map<string, unknown>
  let mockDB: IDBDatabase

  beforeEach(() => {
    settingsData = new Map()
    habitsData = new Map()

    const settingsStore = createMockStoreBackedByMap(settingsData)
    const habitsStore = createMockStoreBackedByMap(habitsData)

    mockDB = {
      transaction: vi.fn((storeNames: string[]) => {
        const storeName = storeNames[0]
        const store = storeName === 'settings' ? settingsStore : habitsStore
        return {
          objectStore: vi.fn(() => store),
          oncomplete: null,
          onerror: null,
          onabort: null,
        }
      }),
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(true),
      },
      close: vi.fn(),
    } as unknown as IDBDatabase
  })

  describe('getCurrentDataVersion', () => {
    it('returns 0 when no version is stored', async () => {
      const version = await getCurrentDataVersion(mockDB)
      expect(version).toBe(0)
    })

    it('returns the stored version number', async () => {
      settingsData.set('dataVersion', { key: 'dataVersion', value: '3' })

      const version = await getCurrentDataVersion(mockDB)
      expect(version).toBe(3)
    })
  })

  describe('runMigrations', () => {
    it('returns early when no pending migrations', async () => {
      const migrateFn = vi.fn()
      const migrations: Migration[] = []
      await runMigrations(mockDB, migrations)

      expect(migrateFn).not.toHaveBeenCalled()
    })

    it('executes pending migrations in version order', async () => {
      const executionOrder: number[] = []
      const migrations: Migration[] = [
        {
          version: 2,
          name: 'second',
          migrate: async () => { executionOrder.push(2) },
        },
        {
          version: 1,
          name: 'first',
          migrate: async () => { executionOrder.push(1) },
        },
      ]

      await runMigrations(mockDB, migrations)

      expect(executionOrder).toEqual([1, 2])
    })

    it('skips already-applied migrations', async () => {
      settingsData.set('dataVersion', { key: 'dataVersion', value: '1' })

      const migrateFn = vi.fn()
      const migrations: Migration[] = [
        { version: 1, name: 'already-applied', migrate: migrateFn },
        { version: 2, name: 'pending', migrate: vi.fn() },
      ]

      await runMigrations(mockDB, migrations)

      expect(migrateFn).not.toHaveBeenCalled()
    })

    it('creates backup before running migrations', async () => {
      habitsData.set('h1', { id: 'h1', name: 'Exercise' })

      const migrations: Migration[] = [
        { version: 1, name: 'test-migration', migrate: vi.fn() },
      ]

      await runMigrations(mockDB, migrations)

      const backupRow = settingsData.get('migrationBackup') as { value: string }
      expect(backupRow).toBeDefined()
      const backup = JSON.parse(backupRow.value)
      expect(backup.version).toBe(0)
      expect(backup.habits).toHaveLength(1)
      expect(backup.habits[0]).toEqual({ id: 'h1', name: 'Exercise' })
    })

    it('updates data version after each successful migration', async () => {
      const migrations: Migration[] = [
        { version: 1, name: 'first', migrate: vi.fn() },
        { version: 2, name: 'second', migrate: vi.fn() },
      ]

      await runMigrations(mockDB, migrations)

      const versionRow = settingsData.get('dataVersion') as { value: string }
      expect(versionRow.value).toBe('2')
    })

    it('adds success log entries', async () => {
      const migrations: Migration[] = [
        { version: 1, name: 'test-migration', migrate: vi.fn() },
      ]

      await runMigrations(mockDB, migrations)

      const log = await getMigrationLog(mockDB)
      expect(log).toHaveLength(1)
      const entry = log[0]!
      expect(entry.version).toBe(1)
      expect(entry.name).toBe('test-migration')
      expect(entry.status).toBe('success')
      expect(entry.durationMs).toBeGreaterThanOrEqual(0)
      expect(entry.timestamp).toBeDefined()
    })

    it('stops execution on migration failure', async () => {
      const secondMigrate = vi.fn()
      const migrations: Migration[] = [
        {
          version: 1,
          name: 'failing',
          migrate: async () => { throw new Error('Migration error') },
        },
        { version: 2, name: 'should-not-run', migrate: secondMigrate },
      ]

      await expect(runMigrations(mockDB, migrations)).rejects.toThrow(
        'Data migration failed. Your data has been restored from backup.'
      )
      expect(secondMigrate).not.toHaveBeenCalled()
    })

    it('adds failed log entry on error', async () => {
      const migrations: Migration[] = [
        {
          version: 1,
          name: 'failing',
          migrate: async () => { throw new Error('Something broke') },
        },
      ]

      await expect(runMigrations(mockDB, migrations)).rejects.toThrow()

      const log = await getMigrationLog(mockDB)
      expect(log).toHaveLength(1)
      const entry = log[0]!
      expect(entry.status).toBe('failed')
      expect(entry.error).toBe('Something broke')
    })

    it('attempts restore from backup on failure', async () => {
      habitsData.set('h1', { id: 'h1', name: 'Original' })

      const migrations: Migration[] = [
        {
          version: 1,
          name: 'destructive-failing',
          migrate: async (db) => {
            const tx = db.transaction(['habits'], 'readwrite')
            const store = tx.objectStore('habits')
            store.clear()
            await new Promise<void>((resolve) => {
              globalThis.queueMicrotask(resolve)
            })
            throw new Error('Failed after clearing')
          },
        },
      ]

      await expect(runMigrations(mockDB, migrations)).rejects.toThrow()

      const restored = Array.from(habitsData.values())
      expect(restored).toHaveLength(1)
      expect(restored[0]).toEqual({ id: 'h1', name: 'Original' })
    })

    it('continues even if backup creation fails', async () => {
      const originalTransaction = mockDB.transaction
      let callCount = 0
      ;(mockDB as unknown as { transaction: typeof originalTransaction }).transaction = vi.fn(
        (storeNames: string[], mode?: IDBTransactionMode) => {
          callCount++
          // Fail the first habits readonly transaction (backup read)
          if (storeNames[0] === 'habits' && mode !== 'readwrite' && callCount <= 2) {
            const failStore = {
              getAll: vi.fn(() => {
                const request = {
                  result: undefined as unknown,
                  error: new Error('Backup read failed'),
                  onsuccess: null as ((event: unknown) => void) | null,
                  onerror: null as ((event: unknown) => void) | null,
                }
                globalThis.queueMicrotask(() => {
                  request.onerror?.({ target: { error: request.error } })
                })
                return request
              }),
            }
            return {
              objectStore: vi.fn(() => failStore),
              oncomplete: null,
              onerror: null,
              onabort: null,
            }
          }
          return (originalTransaction as (...args: unknown[]) => unknown).call(mockDB, storeNames, mode)
        }
      ) as unknown as typeof originalTransaction

      const migrateFn = vi.fn()
      const migrations: Migration[] = [
        { version: 1, name: 'runs-despite-backup-fail', migrate: migrateFn },
      ]

      await runMigrations(mockDB, migrations)

      expect(migrateFn).toHaveBeenCalled()
    })
  })

  describe('createBackup and restoreFromBackup', () => {
    it('round-trips backup and restore preserving data', async () => {
      habitsData.set('h1', { id: 'h1', name: 'Exercise' })
      habitsData.set('h2', { id: 'h2', name: 'Read' })

      await createBackup(mockDB, 0)

      habitsData.clear()
      expect(Array.from(habitsData.values())).toHaveLength(0)

      await restoreFromBackup(mockDB)

      const restored = Array.from(habitsData.values())
      expect(restored).toHaveLength(2)
    })

    it('handles missing backup gracefully', async () => {
      await expect(restoreFromBackup(mockDB)).resolves.toBeUndefined()
    })
  })

  describe('getMigrationLog', () => {
    it('returns empty array when no log exists', async () => {
      const log = await getMigrationLog(mockDB)
      expect(log).toEqual([])
    })

    it('returns parsed log entries', async () => {
      const entries = [
        { version: 1, name: 'test', timestamp: '2026-01-01T00:00:00.000Z', status: 'success', durationMs: 10 },
      ]
      settingsData.set('migrationLog', { key: 'migrationLog', value: JSON.stringify(entries) })

      const log = await getMigrationLog(mockDB)
      expect(log).toHaveLength(1)
      const entry = log[0]!
      expect(entry.version).toBe(1)
      expect(entry.status).toBe('success')
    })
  })
})
