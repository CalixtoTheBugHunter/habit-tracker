import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  openDB,
  addHabit,
  getHabit,
  getAllHabits,
  updateHabit,
  deleteHabit,
  closeDB,
  testUtils,
} from './indexedDB'
import type { Habit } from '../types/habit'
import { createMockHabit, mockHabits } from '../test/fixtures/habits'
import {
  triggerIDBRequestSuccess,
  triggerIDBRequestError,
} from '../test/utils/indexedDB-test-helpers'

const { resetDB } = testUtils

interface MockRequest {
  result: unknown
  error: Error | null
  onsuccess: ((event: { target: { result: unknown } }) => void) | null
  onerror: ((event: { target: { error: Error } }) => void) | null
  readyState: string
}

describe('IndexedDB Service', () => {
  let mockDB: IDBDatabase
  let mockTransaction: IDBTransaction
  let mockObjectStore: IDBObjectStore
  let mockIndexedDB: IDBFactory

  function createMockRequest(): MockRequest {
    const request: MockRequest = {
      result: null,
      error: null,
      onsuccess: null,
      onerror: null,
      readyState: 'done',
    }
    return request
  }

  function createMockIDBRequest<T>(): IDBRequest<T> {
    return createMockRequest() as unknown as IDBRequest<T>
  }


  async function setupMockDB(): Promise<void> {
    const mockOpenRequest = createMockRequest()
    mockOpenRequest.result = mockDB
    ;(mockIndexedDB.open as ReturnType<typeof vi.fn>).mockReturnValue(mockOpenRequest)
    const openPromise = openDB()
    await Promise.resolve()
    if (mockOpenRequest.onsuccess) {
      mockOpenRequest.onsuccess({ target: { result: mockDB } })
    }
    await openPromise
  }

  beforeEach(() => {
    mockObjectStore = {
      add: vi.fn(() => createMockIDBRequest<string>()),
      get: vi.fn(() => createMockIDBRequest<Habit | undefined>()),
      getAll: vi.fn(() => createMockIDBRequest<Habit[]>()),
      put: vi.fn(() => createMockIDBRequest<string>()),
      delete: vi.fn(() => createMockIDBRequest<void>()),
      clear: vi.fn(() => createMockIDBRequest<void>()),
    } as unknown as IDBObjectStore

    mockTransaction = {
      objectStore: vi.fn().mockReturnValue(mockObjectStore),
      oncomplete: null,
      onerror: null,
      onabort: null,
    } as unknown as IDBTransaction

    mockDB = {
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(true),
      },
      transaction: vi.fn().mockReturnValue(mockTransaction),
      close: vi.fn(),
    } as unknown as IDBDatabase

    mockIndexedDB = {
      open: vi.fn(),
    } as unknown as IDBFactory

    globalThis.indexedDB = mockIndexedDB
    globalThis.window = { indexedDB: mockIndexedDB } as unknown as Window & typeof globalThis
  })

  afterEach(() => {
    vi.clearAllMocks()
    resetDB()
  })

  describe('openDB', () => {
    it('opens database and creates object store if it does not exist', async () => {
      const mockOpenRequest = createMockRequest()
      mockOpenRequest.result = mockDB

      ;(mockIndexedDB.open as ReturnType<typeof vi.fn>).mockReturnValue(mockOpenRequest)

      const openPromise = openDB()

      await Promise.resolve()
      const openRequest = mockOpenRequest as unknown as IDBOpenDBRequest
      if (openRequest.onupgradeneeded) {
        openRequest.onupgradeneeded({
          target: {
            result: {
              objectStoreNames: { contains: () => false },
              createObjectStore: vi.fn().mockReturnValue({
                createIndex: vi.fn(),
              }),
            },
          },
        } as unknown as IDBVersionChangeEvent)
      }
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess({ target: { result: mockDB } })
      }

      const db = await openPromise

      expect(mockIndexedDB.open).toHaveBeenCalledWith('habit-tracker', 1)
      expect(db).toBe(mockDB)
    })

    it('handles database open errors', async () => {
      const mockOpenRequest = createMockRequest()
      const error = new Error('Database open failed')
      mockOpenRequest.error = error

      ;(mockIndexedDB.open as ReturnType<typeof vi.fn>).mockReturnValue(mockOpenRequest)

      const openPromise = openDB()

      await Promise.resolve()
      if (mockOpenRequest.onerror) {
        mockOpenRequest.onerror({ target: { error } })
      }

      await expect(openPromise).rejects.toThrow('Unable to access storage. Please refresh the page.')
    })

    it('handles quota exceeded error', async () => {
      const mockOpenRequest = createMockRequest()
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError')
      mockOpenRequest.error = quotaError

      ;(mockIndexedDB.open as ReturnType<typeof vi.fn>).mockReturnValue(mockOpenRequest)

      const openPromise = openDB()

      await Promise.resolve()
      if (mockOpenRequest.onerror) {
        mockOpenRequest.onerror({ target: { error: quotaError } })
      }

      await expect(openPromise).rejects.toThrow('Storage is full. Please free up space and try again.')
    })
  })

  describe('addHabit', () => {
    let addRequest: MockRequest

    beforeEach(async () => {
      await setupMockDB()
      addRequest = createMockRequest()
      ;(mockObjectStore.add as ReturnType<typeof vi.fn>).mockReturnValue(addRequest)
    })

    it('adds a habit to the database', async () => {
      const habit = createMockHabit()

      const addPromise = addHabit(habit)
      await triggerIDBRequestSuccess(addRequest, habit.id)
      const result = await addPromise

      expect(mockObjectStore.add).toHaveBeenCalledWith(habit)
      expect(result).toBe(habit.id)
    })

    it.each([
      ['Add failed', new Error('Add failed'), 'Unable to access storage. Please refresh the page.'],
      [
        'Storage quota exceeded',
        new DOMException('QuotaExceededError', 'QuotaExceededError'),
        'Storage is full. Please free up space and try again.',
      ],
    ])('handles %s error on add', async (_, error, expectedMessage) => {
      const habit = createMockHabit()

      const addPromise = addHabit(habit)
      await triggerIDBRequestError(addRequest, error)

      await expect(addPromise).rejects.toThrow(expectedMessage)
    })
  })

  describe('getHabit', () => {
    let getRequest: MockRequest

    beforeEach(async () => {
      await setupMockDB()
      getRequest = createMockRequest()
      ;(mockObjectStore.get as ReturnType<typeof vi.fn>).mockReturnValue(getRequest)
    })

    it('retrieves a habit by id', async () => {
      const habit = createMockHabit()

      const getPromise = getHabit('1')
      await triggerIDBRequestSuccess(getRequest, habit)

      const result = await getPromise

      expect(mockObjectStore.get).toHaveBeenCalledWith('1')
      expect(result).toEqual(habit)
    })

    it('returns undefined if habit does not exist', async () => {
      const getPromise = getHabit('999')
      await triggerIDBRequestSuccess(getRequest, undefined)

      const result = await getPromise

      expect(result).toBeUndefined()
    })

    it('handles get errors', async () => {
      const error = new Error('Get failed')

      const getPromise = getHabit('1')
      await triggerIDBRequestError(getRequest, error)

      await expect(getPromise).rejects.toThrow('Unable to access storage. Please refresh the page.')
    })
  })

  describe('getAllHabits', () => {
    let getAllRequest: MockRequest

    beforeEach(async () => {
      await setupMockDB()
      getAllRequest = createMockRequest()
      ;(mockObjectStore.getAll as ReturnType<typeof vi.fn>).mockReturnValue(getAllRequest)
    })

    it('retrieves all habits from the database', async () => {
      const habits: Habit[] = [
        createMockHabit({ id: '1', name: 'Exercise' }),
        createMockHabit({ id: '2', name: 'Read' }),
      ]

      const getAllPromise = getAllHabits()
      await triggerIDBRequestSuccess(getAllRequest, habits)

      const result = await getAllPromise

      expect(mockObjectStore.getAll).toHaveBeenCalled()
      expect(result).toEqual(habits)
    })

    it('returns empty array if no habits exist', async () => {
      const getAllPromise = getAllHabits()
      await triggerIDBRequestSuccess(getAllRequest, [])

      const result = await getAllPromise

      expect(result).toEqual([])
    })

    it('handles getAll errors', async () => {
      const error = new Error('GetAll failed')

      const getAllPromise = getAllHabits()
      await triggerIDBRequestError(getAllRequest, error)

      await expect(getAllPromise).rejects.toThrow('Unable to access storage. Please refresh the page.')
    })
  })

  describe('updateHabit', () => {
    let updateRequest: MockRequest

    beforeEach(async () => {
      await setupMockDB()
      updateRequest = createMockRequest()
      ;(mockObjectStore.put as ReturnType<typeof vi.fn>).mockReturnValue(updateRequest)
    })

    it('updates an existing habit', async () => {
      const habit = createMockHabit({
        name: 'Exercise Updated',
        description: 'Updated description',
      })

      const updatePromise = updateHabit(habit)
      await triggerIDBRequestSuccess(updateRequest, habit.id)

      const result = await updatePromise

      expect(mockObjectStore.put).toHaveBeenCalledWith(habit)
      expect(result).toBe(habit.id)
    })

    it.each([
      ['Update failed', new Error('Update failed'), 'Unable to access storage. Please refresh the page.'],
      [
        'Storage quota exceeded',
        new DOMException('QuotaExceededError', 'QuotaExceededError'),
        'Storage is full. Please free up space and try again.',
      ],
    ])('handles %s error on update', async (_, error, expectedMessage) => {
      const habit = createMockHabit()

      const updatePromise = updateHabit(habit)
      await triggerIDBRequestError(updateRequest, error)

      await expect(updatePromise).rejects.toThrow(expectedMessage)
    })
  })

  describe('deleteHabit', () => {
    let deleteRequest: MockRequest

    beforeEach(async () => {
      await setupMockDB()
      deleteRequest = createMockRequest()
      ;(mockObjectStore.delete as ReturnType<typeof vi.fn>).mockReturnValue(deleteRequest)
    })

    it('deletes a habit by id', async () => {
      const deletePromise = deleteHabit('1')
      await triggerIDBRequestSuccess(deleteRequest, undefined)

      await deletePromise

      expect(mockObjectStore.delete).toHaveBeenCalledWith('1')
    })

    it('handles delete errors', async () => {
      const error = new Error('Delete failed')

      const deletePromise = deleteHabit('1')
      await triggerIDBRequestError(deleteRequest, error)

      await expect(deletePromise).rejects.toThrow('Unable to access storage. Please refresh the page.')
    })
  })

  describe('Habit Validation', () => {
    beforeEach(async () => {
      await setupMockDB()
    })

    it('validates habit with all required fields', async () => {
      const habit = mockHabits.minimal()
      const addRequest = createMockRequest()
      ;(mockObjectStore.add as ReturnType<typeof vi.fn>).mockReturnValue(addRequest)

      const addPromise = addHabit(habit)
      await triggerIDBRequestSuccess(addRequest, habit.id)

      await expect(addPromise).resolves.toBe('1')
    })

    it.each([
      [
        'id',
        { createdDate: new Date().toISOString(), completionDates: [] },
        'Habit must have a non-empty string id',
      ],
      [
        'createdDate',
        { id: '1', completionDates: [] },
        'Habit must have a non-empty string createdDate',
      ],
      [
        'completionDates',
        { id: '1', createdDate: new Date().toISOString() },
        'Habit must have a completionDates array',
      ],
      [
        'completionDates (non-array)',
        { id: '1', createdDate: new Date().toISOString(), completionDates: 'not-an-array' },
        'Habit must have a completionDates array',
      ],
      [
        'completionDates (non-string elements)',
        { id: '1', createdDate: new Date().toISOString(), completionDates: [123, 456] },
        'All completionDates must be strings',
      ],
      [
        'createdDate (invalid ISO 8601)',
        { id: '1', createdDate: 'not-a-date', completionDates: [] },
        'Habit createdDate must be a valid ISO 8601 date string',
      ],
      [
        'completionDates (invalid ISO 8601)',
        { id: '1', createdDate: new Date().toISOString(), completionDates: ['not-a-date'] },
        'All completionDates must be valid ISO 8601 date strings',
      ],
      [
        'name (exceeds max length)',
        {
          id: '1',
          name: 'a'.repeat(256),
          createdDate: new Date().toISOString(),
          completionDates: [],
        },
        'Habit name must not exceed 255 characters',
      ],
      [
        'description (exceeds max length)',
        {
          id: '1',
          description: 'a'.repeat(5001),
          createdDate: new Date().toISOString(),
          completionDates: [],
        },
        'Habit description must not exceed 5000 characters',
      ],
    ])('rejects habit without valid %s', async (_, invalidHabit, expectedError) => {
      await expect(addHabit(invalidHabit as unknown as Habit)).rejects.toThrow(expectedError)
    })

    it('validates habit with all fields including optional ones', async () => {
      const habit = mockHabits.withCompletions(['2025-01-01T00:00:00.000Z'])
      const addRequest = createMockRequest()
      ;(mockObjectStore.add as ReturnType<typeof vi.fn>).mockReturnValue(addRequest)

      const addPromise = addHabit(habit)
      await triggerIDBRequestSuccess(addRequest, habit.id)

      await expect(addPromise).resolves.toBe('1')
    })
  })

  describe('closeDB', () => {
    it('closes the database connection', () => {
      closeDB(mockDB)
      expect(mockDB.close).toHaveBeenCalled()
    })
  })
})

