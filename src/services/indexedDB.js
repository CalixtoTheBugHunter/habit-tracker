const DB_NAME = 'habit-tracker'
const DB_VERSION = 1
const STORE_NAME = 'habits'

let dbInstance = null

function isQuotaExceededError(error) {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22)
  )
}

/**
 * Validates habit object structure and data types.
 */
function validateHabit(habit) {
  if (!habit || typeof habit !== 'object') {
    throw new Error('Habit must be an object')
  }
  if (!habit.id || typeof habit.id !== 'string' || habit.id.trim() === '') {
    throw new Error('Habit must have a non-empty string id')
  }
  
  const stringFields = ['name', 'description', 'createdAt']
  for (const field of stringFields) {
    if (habit[field] !== undefined && typeof habit[field] !== 'string') {
      throw new Error(`Habit field "${field}" must be a string if provided`)
    }
  }
  
  const habitSize = JSON.stringify(habit).length
  if (habitSize > 100000) {
    throw new Error('Habit data exceeds maximum size')
  }
  return true
}

function validateId(id) {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('Habit id must be a non-empty string')
  }
}

function handleRequestError(request, defaultMessage) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      const error = request.error || new Error(defaultMessage)
      if (isQuotaExceededError(error)) {
        reject(new Error('Storage quota exceeded. Please free up some space.'))
      } else {
        reject(error)
      }
    }
  })
}

export function openDB() {
  if (dbInstance) {
    return Promise.resolve(dbInstance)
  }

  return new Promise((resolve, reject) => {
    const idb = typeof window !== 'undefined' ? window.indexedDB : global.indexedDB
    if (!idb) {
      reject(new Error('IndexedDB is not supported in this browser'))
      return
    }

    const request = idb.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      const error = request.error || new Error('Failed to open database')
      if (isQuotaExceededError(error)) {
        reject(new Error('Storage quota exceeded. Please free up some space.'))
      } else {
        reject(error)
      }
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        })

        objectStore.createIndex('name', 'name', { unique: false })
        objectStore.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

/**
 * Gets an object store for database operations.
 * Note: A new transaction is created for each operation.
 */
function getObjectStore(mode = 'readonly') {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          reject(new Error(`Object store "${STORE_NAME}" does not exist`))
          return
        }

        const transaction = db.transaction([STORE_NAME], mode)
        const objectStore = transaction.objectStore(STORE_NAME)

        transaction.onerror = () => {
          reject(transaction.error || new Error('Transaction failed'))
        }

        resolve({ objectStore, transaction })
      })
      .catch(reject)
  })
}

export async function addHabit(habit) {
  validateHabit(habit)

  const { objectStore } = await getObjectStore('readwrite')
  const request = objectStore.add(habit)
  return handleRequestError(request, 'Failed to add habit')
}

export async function getHabit(id) {
  validateId(id)

  const { objectStore } = await getObjectStore('readonly')
  const request = objectStore.get(id)
  return handleRequestError(request, 'Failed to get habit')
}

/**
 * Retrieves all habits from the database.
 * Note: Loads all habits into memory at once.
 */
export async function getAllHabits() {
  const { objectStore } = await getObjectStore('readonly')
  const request = objectStore.getAll()
  const result = await handleRequestError(request, 'Failed to get all habits')
  return result || []
}

export async function updateHabit(habit) {
  validateHabit(habit)

  const { objectStore } = await getObjectStore('readwrite')
  const request = objectStore.put(habit)
  return handleRequestError(request, 'Failed to update habit')
}

export async function deleteHabit(id) {
  validateId(id)

  const { objectStore } = await getObjectStore('readwrite')
  const request = objectStore.delete(id)
  return handleRequestError(request, 'Failed to delete habit')
}

export function closeDB(db) {
  if (db && typeof db.close === 'function') {
    db.close()
    if (db === dbInstance) {
      dbInstance = null
    }
  }
}

/**
 * Test utilities for IndexedDB service.
 * @internal
 */
export const testUtils = {
  /**
   * Resets the database connection for test cleanup.
   */
  resetDB() {
    if (dbInstance) {
      dbInstance.close()
    }
    dbInstance = null
  },
}

