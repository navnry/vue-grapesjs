const DB_NAME = 'tooto-editor'
const STORE_NAME = 'web-projects'

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

export const getItem = async (key: string) => {
  const db = await openDb()
  return new Promise<any>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(key)
    req.onsuccess = () => {
      resolve(req.result)
      db.close()
    }
    req.onerror = () => {
      reject(req.error)
      db.close()
    }
  })
}

export const setItem = async (key: string, value: any) => {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.put(value, key)
    req.onsuccess = () => {
      resolve()
      db.close()
    }
    req.onerror = () => {
      reject(req.error)
      db.close()
    }
  })
}
