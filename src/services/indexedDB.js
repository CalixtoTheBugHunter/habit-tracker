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
  if (!habit || !habit.id) {
    throw new Error('Habit must have an id')
  }

  const { objectStore } = await getObjectStore('readwrite')

  return new Promise((resolve, reject) => {
    const request = objectStore.add(habit)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      const error = request.error || new Error('Failed to add habit')
      if (isQuotaExceededError(error)) {
        reject(new Error('Storage quota exceeded. Please free up some space.'))
      } else {
        reject(error)
      }
    }
  })
}

export async function getHabit(id) {
  if (!id) {
    throw new Error('Habit id is required')
  }

  const { objectStore } = await getObjectStore('readonly')

  return new Promise((resolve, reject) => {
    const request = objectStore.get(id)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error || new Error('Failed to get habit'))
    }
  })
}

export async function getAllHabits() {
  const { objectStore } = await getObjectStore('readonly')

  return new Promise((resolve, reject) => {
    const request = objectStore.getAll()

    request.onsuccess = () => {
      resolve(request.result || [])
    }

    request.onerror = () => {
      reject(request.error || new Error('Failed to get all habits'))
    }
  })
}

export async function updateHabit(habit) {
  if (!habit || !habit.id) {
    throw new Error('Habit must have an id')
  }

  const { objectStore } = await getObjectStore('readwrite')

  return new Promise((resolve, reject) => {
    const request = objectStore.put(habit)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      const error = request.error || new Error('Failed to update habit')
      if (isQuotaExceededError(error)) {
        reject(new Error('Storage quota exceeded. Please free up some space.'))
      } else {
        reject(error)
      }
    }
  })
}

export async function deleteHabit(id) {
  if (!id) {
    throw new Error('Habit id is required')
  }

  const { objectStore } = await getObjectStore('readwrite')

  return new Promise((resolve, reject) => {
    const request = objectStore.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(request.error || new Error('Failed to delete habit'))
    }
  })
}

export function closeDB(db) {
  if (db && typeof db.close === 'function') {
    db.close()
    if (db === dbInstance) {
      dbInstance = null
    }
  }
}

export function resetDB() {
  if (dbInstance) {
    dbInstance.close()
  }
  dbInstance = null
}

