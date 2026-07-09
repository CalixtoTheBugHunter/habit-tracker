import { describe, it, expect, beforeEach, vi } from 'vitest'
import { runMigrations, getCurrentDataVersion } from './migrationRunner'
import { migrations } from './migrations'
import type { Habit } from '../../types/habit'
import { createMockHabit } from '../../test/fixtures/habits'

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

describe('app migrations', () => {
  let settingsData: Map<string, { key: string; value: string }>
  let habitsData: Map<string, Habit>
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

  it('includes a categories-store-support migration at version 2', () => {
    const v2 = migrations.find(m => m.version === 2)
    expect(v2).toBeDefined()
    expect(v2?.name).toBe('categories-store-support')
  })

  it('v2 migration preserves existing habit data and advances the data version', async () => {
    // Already at version 1 so only the v2 migration runs in isolation.
    settingsData.set('dataVersion', { key: 'dataVersion', value: '1' })
    const habitA = createMockHabit({ id: '1', name: 'Exercise', sortOrder: 0 })
    const habitB = createMockHabit({ id: '2', name: 'Read', sortOrder: 1, categories: ['a'] })
    habitsData.set('1', habitA)
    habitsData.set('2', habitB)
    const snapshot = JSON.stringify(Array.from(habitsData.values()))

    await runMigrations(mockDB, migrations)

    expect(await getCurrentDataVersion(mockDB)).toBe(2)
    expect(JSON.stringify(Array.from(habitsData.values()))).toBe(snapshot)
  })

  it('advances a fresh database to version 2 without dropping any habits', async () => {
    habitsData.set('1', createMockHabit({ id: '1', name: 'Exercise' }))
    habitsData.set('2', createMockHabit({ id: '2', name: 'Read' }))

    await runMigrations(mockDB, migrations)

    expect(await getCurrentDataVersion(mockDB)).toBe(2)
    const ids = Array.from(habitsData.values()).map(h => h.id).sort()
    expect(ids).toEqual(['1', '2'])
  })
})
