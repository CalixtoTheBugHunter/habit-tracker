import type { Habit } from '../types/habit'

const DB_NAME = 'habit-tracker'
const DB_VERSION = 1
const STORE_NAME = 'habits'

let dbInstance: IDBDatabase | null = null

interface ObjectStoreResult {
  objectStore: IDBObjectStore
  transaction: IDBTransaction
}

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      (error as { code?: number }).code === 22)
  )
}

function validateHabit(habit: unknown): asserts habit is Habit {
  if (!habit || typeof habit !== 'object') {
    throw new Error('Habit must be an object')
  }
  const habitObj = habit as Record<string, unknown>
  if (!habitObj.id || typeof habitObj.id !== 'string' || habitObj.id.trim() === '') {
    throw new Error('Habit must have a non-empty string id')
  }
  
  const stringFields = ['name', 'description', 'createdAt']
  for (const field of stringFields) {
    if (habitObj[field] !== undefined && typeof habitObj[field] !== 'string') {
      throw new Error(`Habit field "${field}" must be a string if provided`)
    }
  }
  
  const habitSize = JSON.stringify(habit).length
  if (habitSize > 100000) {
    throw new Error('Habit data exceeds maximum size')
  }
}

function validateId(id: unknown): asserts id is string {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('Habit id must be a non-empty string')
  }
}

function handleRequestError<T>(request: IDBRequest<T>, defaultMessage: string): Promise<T> {
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

export function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance)
  }

  return new Promise((resolve, reject) => {
    const idb = typeof window !== 'undefined' ? window.indexedDB : globalThis.indexedDB
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
      const db = (event.target as IDBOpenDBRequest).result

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
 * 
 * @param mode - The transaction mode ('readonly' or 'readwrite'). Defaults to 'readonly'
 * @returns A promise that resolves to an object containing the object store and transaction
 * @throws Error if the object store does not exist or if the transaction fails
 */
function getObjectStore(mode: IDBTransactionMode = 'readonly'): Promise<ObjectStoreResult> {
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

export async function addHabit(habit: Habit): Promise<string> {
  validateHabit(habit)

  const { objectStore } = await getObjectStore('readwrite')
  const request = objectStore.add(habit)
  const result = await handleRequestError<IDBValidKey>(request, 'Failed to add habit')
  return String(result)
}

export async function getHabit(id: string): Promise<Habit | undefined> {
  validateId(id)

  const { objectStore } = await getObjectStore('readonly')
  const request = objectStore.get(id)
  return handleRequestError(request, 'Failed to get habit')
}

/**
 * Retrieves all habits from the database.
 * 
 * @returns A promise that resolves to an array of all habits
 * @remarks This function loads all habits into memory at once. For applications
 * with many habits, consider implementing pagination in a future update.
 */
export async function getAllHabits(): Promise<Habit[]> {
  const { objectStore } = await getObjectStore('readonly')
  const request = objectStore.getAll()
  const result = await handleRequestError(request, 'Failed to get all habits')
  return result || []
}

export async function updateHabit(habit: Habit): Promise<string> {
  validateHabit(habit)

  const { objectStore } = await getObjectStore('readwrite')
  const request = objectStore.put(habit)
  const result = await handleRequestError<IDBValidKey>(request, 'Failed to update habit')
  return String(result)
}

export async function deleteHabit(id: string): Promise<void> {
  validateId(id)

  const { objectStore } = await getObjectStore('readwrite')
  const request = objectStore.delete(id)
  await handleRequestError(request, 'Failed to delete habit')
}

export function closeDB(db: IDBDatabase | null): void {
  if (db && typeof db.close === 'function') {
    db.close()
    if (db === dbInstance) {
      dbInstance = null
    }
  }
}

export const testUtils = {
  resetDB(): void {
    if (dbInstance) {
      dbInstance.close()
    }
    dbInstance = null
  },
}

