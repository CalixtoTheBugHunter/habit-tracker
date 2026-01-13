import type { Habit } from '../types/habit'
import { isQuotaExceededError } from '../utils/error/isQuotaExceededError'
import { IndexedDBError } from '../utils/error/errorTypes'
import { logError } from '../utils/error/errorLogger'
import { validateHabit } from '../utils/validation/validateHabit'
import { validateId } from '../utils/validation/validateId'

const DB_NAME = 'habit-tracker'
const DB_VERSION = 1
const STORE_NAME = 'habits'

let dbInstance: IDBDatabase | null = null

interface ObjectStoreResult {
  objectStore: IDBObjectStore
  transaction: IDBTransaction
}

function handleRequestError<T>(request: IDBRequest<T>, defaultMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      const error = request.error || new Error(defaultMessage)
      if (isQuotaExceededError(error)) {
        const indexedDBError = new IndexedDBError(
          'INDEXEDDB_QUOTA_EXCEEDED',
          'Storage is full. Please free up space and try again.',
          error instanceof Error ? error.message : String(error)
        )
        logError(indexedDBError)
        reject(indexedDBError)
      } else {
        const indexedDBError = new IndexedDBError(
          'INDEXEDDB_OPERATION_FAILED',
          'Unable to access storage. Please refresh the page.',
          error instanceof Error ? error.message : String(error)
        )
        logError(indexedDBError)
        reject(indexedDBError)
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
      const indexedDBError = new IndexedDBError(
        'INDEXEDDB_OPEN_FAILED',
        'Unable to access storage. Please refresh the page.',
        'IndexedDB is not supported in this browser'
      )
      logError(indexedDBError)
      reject(indexedDBError)
      return
    }

    const request = idb.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      const error = request.error || new Error('Failed to open database')
      if (isQuotaExceededError(error)) {
        const indexedDBError = new IndexedDBError(
          'INDEXEDDB_QUOTA_EXCEEDED',
          'Storage is full. Please free up space and try again.',
          error instanceof Error ? error.message : String(error)
        )
        logError(indexedDBError)
        reject(indexedDBError)
      } else {
        const indexedDBError = new IndexedDBError(
          'INDEXEDDB_OPEN_FAILED',
          'Unable to access storage. Please refresh the page.',
          error instanceof Error ? error.message : String(error)
        )
        logError(indexedDBError)
        reject(indexedDBError)
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
        objectStore.createIndex('createdDate', 'createdDate', { unique: false })
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
          const indexedDBError = new IndexedDBError(
            'INDEXEDDB_TRANSACTION_FAILED',
            'Unable to access storage. Please refresh the page.',
            `Object store "${STORE_NAME}" does not exist`
          )
          logError(indexedDBError)
          reject(indexedDBError)
          return
        }

        const transaction = db.transaction([STORE_NAME], mode)
        const objectStore = transaction.objectStore(STORE_NAME)

        transaction.onerror = () => {
          const error = transaction.error || new Error('Transaction failed')
          const indexedDBError = new IndexedDBError(
            'INDEXEDDB_TRANSACTION_FAILED',
            'Unable to access storage. Please refresh the page.',
            error instanceof Error ? error.message : String(error)
          )
          logError(indexedDBError)
          reject(indexedDBError)
        }

        resolve({ objectStore, transaction })
      })
      .catch((error) => {
        if (error instanceof IndexedDBError) {
          reject(error)
        } else {
          const indexedDBError = new IndexedDBError(
            'INDEXEDDB_TRANSACTION_FAILED',
            'Unable to access storage. Please refresh the page.',
            error instanceof Error ? error.message : String(error)
          )
          logError(indexedDBError)
          reject(indexedDBError)
        }
      })
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

