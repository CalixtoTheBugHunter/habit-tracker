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

      await expect(openPromise).rejects.toThrow('Database open failed')
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

      await expect(openPromise).rejects.toThrow('Storage quota exceeded')
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
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        description: 'Daily exercise routine',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }

      const addPromise = addHabit(habit)
      
      await Promise.resolve()
      await Promise.resolve()
      
      addRequest.result = habit.id
      if (addRequest.onsuccess) {
        addRequest.onsuccess({ target: { result: habit.id } })
      }

      const result = await addPromise

      expect(mockObjectStore.add).toHaveBeenCalledWith(habit)
      expect(result).toBe(habit.id)
    })

    it('handles add errors', async () => {
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }
      const error = new Error('Add failed')

      const addPromise = addHabit(habit)

      await Promise.resolve()
      await Promise.resolve()
      addRequest.error = error
      if (addRequest.onerror) {
        addRequest.onerror({ target: { error } })
      }

      await expect(addPromise).rejects.toThrow('Add failed')
    })

    it('handles quota exceeded error on add', async () => {
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError')

      const addPromise = addHabit(habit)

      await Promise.resolve()
      await Promise.resolve()
      addRequest.error = quotaError
      if (addRequest.onerror) {
        addRequest.onerror({ target: { error: quotaError } })
      }

      await expect(addPromise).rejects.toThrow('Storage quota exceeded')
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
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        description: 'Daily exercise routine',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }

      const getPromise = getHabit('1')

      await Promise.resolve()
      await Promise.resolve()
      getRequest.result = habit
      if (getRequest.onsuccess) {
        getRequest.onsuccess({ target: { result: habit } })
      }

      const result = await getPromise

      expect(mockObjectStore.get).toHaveBeenCalledWith('1')
      expect(result).toEqual(habit)
    })

    it('returns undefined if habit does not exist', async () => {
      const getPromise = getHabit('999')

      await Promise.resolve()
      await Promise.resolve()
      getRequest.result = undefined
      if (getRequest.onsuccess) {
        getRequest.onsuccess({ target: { result: undefined } })
      }

      const result = await getPromise

      expect(result).toBeUndefined()
    })

    it('handles get errors', async () => {
      const error = new Error('Get failed')

      const getPromise = getHabit('1')

      await Promise.resolve()
      await Promise.resolve()
      getRequest.error = error
      if (getRequest.onerror) {
        getRequest.onerror({ target: { error } })
      }

      await expect(getPromise).rejects.toThrow('Get failed')
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
        { id: '1', name: 'Exercise', createdDate: new Date().toISOString(), completionDates: [] },
        { id: '2', name: 'Read', createdDate: new Date().toISOString(), completionDates: [] },
      ]

      const getAllPromise = getAllHabits()

      await Promise.resolve()
      await Promise.resolve()
      getAllRequest.result = habits
      if (getAllRequest.onsuccess) {
        getAllRequest.onsuccess({ target: { result: habits } })
      }

      const result = await getAllPromise

      expect(mockObjectStore.getAll).toHaveBeenCalled()
      expect(result).toEqual(habits)
    })

    it('returns empty array if no habits exist', async () => {
      const getAllPromise = getAllHabits()

      await Promise.resolve()
      await Promise.resolve()
      getAllRequest.result = []
      if (getAllRequest.onsuccess) {
        getAllRequest.onsuccess({ target: { result: [] } })
      }

      const result = await getAllPromise

      expect(result).toEqual([])
    })

    it('handles getAll errors', async () => {
      const error = new Error('GetAll failed')

      const getAllPromise = getAllHabits()

      await Promise.resolve()
      await Promise.resolve()
      getAllRequest.error = error
      if (getAllRequest.onerror) {
        getAllRequest.onerror({ target: { error } })
      }

      await expect(getAllPromise).rejects.toThrow('GetAll failed')
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
      const habit: Habit = {
        id: '1',
        name: 'Exercise Updated',
        description: 'Updated description',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }

      const updatePromise = updateHabit(habit)

      await Promise.resolve()
      await Promise.resolve()
      updateRequest.result = habit.id
      if (updateRequest.onsuccess) {
        updateRequest.onsuccess({ target: { result: habit.id } })
      }

      const result = await updatePromise

      expect(mockObjectStore.put).toHaveBeenCalledWith(habit)
      expect(result).toBe(habit.id)
    })

    it('handles update errors', async () => {
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }
      const error = new Error('Update failed')

      const updatePromise = updateHabit(habit)

      await Promise.resolve()
      await Promise.resolve()
      updateRequest.error = error
      if (updateRequest.onerror) {
        updateRequest.onerror({ target: { error } })
      }

      await expect(updatePromise).rejects.toThrow('Update failed')
    })

    it('handles quota exceeded error on update', async () => {
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError')

      const updatePromise = updateHabit(habit)

      await Promise.resolve()
      await Promise.resolve()
      updateRequest.error = quotaError
      if (updateRequest.onerror) {
        updateRequest.onerror({ target: { error: quotaError } })
      }

      await expect(updatePromise).rejects.toThrow('Storage quota exceeded')
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

      await Promise.resolve()
      await Promise.resolve()
      deleteRequest.result = undefined
      if (deleteRequest.onsuccess) {
        deleteRequest.onsuccess({ target: { result: undefined } })
      }

      await deletePromise

      expect(mockObjectStore.delete).toHaveBeenCalledWith('1')
    })

    it('handles delete errors', async () => {
      const error = new Error('Delete failed')

      const deletePromise = deleteHabit('1')

      await Promise.resolve()
      await Promise.resolve()
      deleteRequest.error = error
      if (deleteRequest.onerror) {
        deleteRequest.onerror({ target: { error } })
      }

      await expect(deletePromise).rejects.toThrow('Delete failed')
    })
  })

  describe('Habit Validation', () => {
    beforeEach(async () => {
      await setupMockDB()
    })

    it('validates habit with all required fields', async () => {
      const habit: Habit = {
        id: '1',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }
      const addRequest = createMockRequest()
      ;(mockObjectStore.add as ReturnType<typeof vi.fn>).mockReturnValue(addRequest)

      const addPromise = addHabit(habit)
      await Promise.resolve()
      await Promise.resolve()
      addRequest.result = habit.id
      if (addRequest.onsuccess) {
        addRequest.onsuccess({ target: { result: habit.id } })
      }

      await expect(addPromise).resolves.toBe('1')
    })

    it('rejects habit without id', async () => {
      const invalidHabit = {
        createdDate: new Date().toISOString(),
        completionDates: [],
      } as unknown as Habit

      await expect(addHabit(invalidHabit)).rejects.toThrow('Habit must have a non-empty string id')
    })

    it('rejects habit without createdDate', async () => {
      const invalidHabit = {
        id: '1',
        completionDates: [],
      } as unknown as Habit

      await expect(addHabit(invalidHabit)).rejects.toThrow('Habit must have a non-empty string createdDate')
    })

    it('rejects habit without completionDates', async () => {
      const invalidHabit = {
        id: '1',
        createdDate: new Date().toISOString(),
      } as unknown as Habit

      await expect(addHabit(invalidHabit)).rejects.toThrow('Habit must have a completionDates array')
    })

    it('rejects habit with non-array completionDates', async () => {
      const invalidHabit = {
        id: '1',
        createdDate: new Date().toISOString(),
        completionDates: 'not-an-array',
      } as unknown as Habit

      await expect(addHabit(invalidHabit)).rejects.toThrow('Habit must have a completionDates array')
    })

    it('rejects habit with non-string completion dates', async () => {
      const invalidHabit = {
        id: '1',
        createdDate: new Date().toISOString(),
        completionDates: [123, 456],
      } as unknown as Habit

      await expect(addHabit(invalidHabit)).rejects.toThrow('All completionDates must be strings')
    })

    it('validates habit with all fields including optional ones', async () => {
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        description: 'Daily exercise routine',
        createdDate: new Date().toISOString(),
        completionDates: ['2025-01-01T00:00:00.000Z'],
      }
      const addRequest = createMockRequest()
      ;(mockObjectStore.add as ReturnType<typeof vi.fn>).mockReturnValue(addRequest)

      const addPromise = addHabit(habit)
      await Promise.resolve()
      await Promise.resolve()
      addRequest.result = habit.id
      if (addRequest.onsuccess) {
        addRequest.onsuccess({ target: { result: habit.id } })
      }

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

