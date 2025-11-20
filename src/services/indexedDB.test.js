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

const { resetDB } = testUtils

describe('IndexedDB Service', () => {
  let mockDB
  let mockTransaction
  let mockObjectStore
  let mockIndexedDB

  function createMockRequest() {
    const request = {
      result: null,
      error: null,
      onsuccess: null,
      onerror: null,
      readyState: 'done',
    }
    return request
  }

  beforeEach(() => {
    mockObjectStore = {
      add: vi.fn(() => createMockRequest()),
      get: vi.fn(() => createMockRequest()),
      getAll: vi.fn(() => createMockRequest()),
      put: vi.fn(() => createMockRequest()),
      delete: vi.fn(() => createMockRequest()),
      clear: vi.fn(() => createMockRequest()),
    }

    mockTransaction = {
      objectStore: vi.fn().mockReturnValue(mockObjectStore),
      oncomplete: null,
      onerror: null,
      onabort: null,
    }

    mockDB = {
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(true),
      },
      transaction: vi.fn().mockReturnValue(mockTransaction),
      close: vi.fn(),
    }

    mockIndexedDB = {
      open: vi.fn(),
    }

    global.indexedDB = mockIndexedDB
    global.window = { indexedDB: mockIndexedDB }
  })

  afterEach(() => {
    vi.clearAllMocks()
    resetDB()
  })

  describe('openDB', () => {
    it('opens database and creates object store if it does not exist', async () => {
      const mockOpenRequest = createMockRequest()
      mockOpenRequest.result = mockDB

      mockIndexedDB.open.mockReturnValue(mockOpenRequest)

      const openPromise = openDB()

      setTimeout(() => {
        if (mockOpenRequest.onupgradeneeded) {
          mockOpenRequest.onupgradeneeded({
            target: {
              result: {
                objectStoreNames: { contains: () => false },
                createObjectStore: vi.fn().mockReturnValue({
                  createIndex: vi.fn(),
                }),
              },
            },
          })
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } })
        }
      }, 0)

      const db = await openPromise

      expect(mockIndexedDB.open).toHaveBeenCalledWith('habit-tracker', 1)
      expect(db).toBe(mockDB)
    })

    it('handles database open errors', async () => {
      const mockOpenRequest = createMockRequest()
      const error = new Error('Database open failed')
      mockOpenRequest.error = error

      mockIndexedDB.open.mockReturnValue(mockOpenRequest)

      const openPromise = openDB()

      setTimeout(() => {
        if (mockOpenRequest.onerror) {
          mockOpenRequest.onerror({ target: { error } })
        }
      }, 0)

      await expect(openPromise).rejects.toThrow('Database open failed')
    })

    it('handles quota exceeded error', async () => {
      const mockOpenRequest = createMockRequest()
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError')
      mockOpenRequest.error = quotaError

      mockIndexedDB.open.mockReturnValue(mockOpenRequest)

      const openPromise = openDB()

      setTimeout(() => {
        if (mockOpenRequest.onerror) {
          mockOpenRequest.onerror({ target: { error: quotaError } })
        }
      }, 0)

      await expect(openPromise).rejects.toThrow('Storage quota exceeded')
    })
  })

  describe('addHabit', () => {
    let addRequest

    beforeEach(async () => {
      const mockOpenRequest = createMockRequest()
      mockOpenRequest.result = mockDB
      mockIndexedDB.open.mockReturnValue(mockOpenRequest)
      const openPromise = openDB()
      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } })
        }
      }, 0)
      await openPromise

      addRequest = createMockRequest()
      mockObjectStore.add.mockReturnValue(addRequest)
    })

    it('adds a habit to the database', async () => {
      const habit = {
        id: '1',
        name: 'Exercise',
        description: 'Daily exercise routine',
        createdAt: new Date().toISOString(),
      }

      const addPromise = addHabit(habit)

      await new Promise((resolve) => setTimeout(resolve, 10))
      addRequest.result = habit.id
      if (addRequest.onsuccess) {
        addRequest.onsuccess({ target: { result: habit.id } })
      }

      const result = await addPromise

      expect(mockObjectStore.add).toHaveBeenCalledWith(habit)
      expect(result).toBe(habit.id)
    })

    it('handles add errors', async () => {
      const habit = { id: '1', name: 'Exercise' }
      const error = new Error('Add failed')

      const addPromise = addHabit(habit)

      await new Promise((resolve) => setTimeout(resolve, 10))
      addRequest.error = error
      if (addRequest.onerror) {
        addRequest.onerror({ target: { error } })
      }

      await expect(addPromise).rejects.toThrow('Add failed')
    })

    it('handles quota exceeded error on add', async () => {
      const habit = { id: '1', name: 'Exercise' }
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError')

      const addPromise = addHabit(habit)

      await new Promise((resolve) => setTimeout(resolve, 10))
      addRequest.error = quotaError
      if (addRequest.onerror) {
        addRequest.onerror({ target: { error: quotaError } })
      }

      await expect(addPromise).rejects.toThrow('Storage quota exceeded')
    })
  })

  describe('getHabit', () => {
    let getRequest

    beforeEach(async () => {
      const mockOpenRequest = createMockRequest()
      mockOpenRequest.result = mockDB
      mockIndexedDB.open.mockReturnValue(mockOpenRequest)
      const openPromise = openDB()
      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } })
        }
      }, 0)
      await openPromise

      getRequest = createMockRequest()
      mockObjectStore.get.mockReturnValue(getRequest)
    })

    it('retrieves a habit by id', async () => {
      const habit = {
        id: '1',
        name: 'Exercise',
        description: 'Daily exercise routine',
        createdAt: new Date().toISOString(),
      }

      const getPromise = getHabit('1')

      await new Promise((resolve) => setTimeout(resolve, 10))
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

      await new Promise((resolve) => setTimeout(resolve, 10))
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

      await new Promise((resolve) => setTimeout(resolve, 10))
      getRequest.error = error
      if (getRequest.onerror) {
        getRequest.onerror({ target: { error } })
      }

      await expect(getPromise).rejects.toThrow('Get failed')
    })
  })

  describe('getAllHabits', () => {
    let getAllRequest

    beforeEach(async () => {
      const mockOpenRequest = createMockRequest()
      mockOpenRequest.result = mockDB
      mockIndexedDB.open.mockReturnValue(mockOpenRequest)
      const openPromise = openDB()
      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } })
        }
      }, 0)
      await openPromise

      getAllRequest = createMockRequest()
      mockObjectStore.getAll.mockReturnValue(getAllRequest)
    })

    it('retrieves all habits from the database', async () => {
      const habits = [
        { id: '1', name: 'Exercise', createdAt: new Date().toISOString() },
        { id: '2', name: 'Read', createdAt: new Date().toISOString() },
      ]

      const getAllPromise = getAllHabits()

      await new Promise((resolve) => setTimeout(resolve, 10))
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

      await new Promise((resolve) => setTimeout(resolve, 10))
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

      await new Promise((resolve) => setTimeout(resolve, 10))
      getAllRequest.error = error
      if (getAllRequest.onerror) {
        getAllRequest.onerror({ target: { error } })
      }

      await expect(getAllPromise).rejects.toThrow('GetAll failed')
    })
  })

  describe('updateHabit', () => {
    let updateRequest

    beforeEach(async () => {
      const mockOpenRequest = createMockRequest()
      mockOpenRequest.result = mockDB
      mockIndexedDB.open.mockReturnValue(mockOpenRequest)
      const openPromise = openDB()
      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } })
        }
      }, 0)
      await openPromise

      updateRequest = createMockRequest()
      mockObjectStore.put.mockReturnValue(updateRequest)
    })

    it('updates an existing habit', async () => {
      const habit = {
        id: '1',
        name: 'Exercise Updated',
        description: 'Updated description',
        createdAt: new Date().toISOString(),
      }

      const updatePromise = updateHabit(habit)

      await new Promise((resolve) => setTimeout(resolve, 10))
      updateRequest.result = habit.id
      if (updateRequest.onsuccess) {
        updateRequest.onsuccess({ target: { result: habit.id } })
      }

      const result = await updatePromise

      expect(mockObjectStore.put).toHaveBeenCalledWith(habit)
      expect(result).toBe(habit.id)
    })

    it('handles update errors', async () => {
      const habit = { id: '1', name: 'Exercise' }
      const error = new Error('Update failed')

      const updatePromise = updateHabit(habit)

      await new Promise((resolve) => setTimeout(resolve, 10))
      updateRequest.error = error
      if (updateRequest.onerror) {
        updateRequest.onerror({ target: { error } })
      }

      await expect(updatePromise).rejects.toThrow('Update failed')
    })

    it('handles quota exceeded error on update', async () => {
      const habit = { id: '1', name: 'Exercise' }
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError')

      const updatePromise = updateHabit(habit)

      await new Promise((resolve) => setTimeout(resolve, 10))
      updateRequest.error = quotaError
      if (updateRequest.onerror) {
        updateRequest.onerror({ target: { error: quotaError } })
      }

      await expect(updatePromise).rejects.toThrow('Storage quota exceeded')
    })
  })

  describe('deleteHabit', () => {
    let deleteRequest

    beforeEach(async () => {
      const mockOpenRequest = createMockRequest()
      mockOpenRequest.result = mockDB
      mockIndexedDB.open.mockReturnValue(mockOpenRequest)
      const openPromise = openDB()
      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDB } })
        }
      }, 0)
      await openPromise

      deleteRequest = createMockRequest()
      mockObjectStore.delete.mockReturnValue(deleteRequest)
    })

    it('deletes a habit by id', async () => {
      const deletePromise = deleteHabit('1')

      await new Promise((resolve) => setTimeout(resolve, 10))
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

      await new Promise((resolve) => setTimeout(resolve, 10))
      deleteRequest.error = error
      if (deleteRequest.onerror) {
        deleteRequest.onerror({ target: { error } })
      }

      await expect(deletePromise).rejects.toThrow('Delete failed')
    })
  })

  describe('closeDB', () => {
    it('closes the database connection', () => {
      closeDB(mockDB)
      expect(mockDB.close).toHaveBeenCalled()
    })
  })
})

