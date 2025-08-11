// Simple IndexedDB wrapper for storing EPUBs and reading positions

export interface StoredEbookMeta {
  id: string
  title: string
  author?: string
  addedAt: number
  sizeBytes: number
}

export interface StoredEbook extends StoredEbookMeta {
  blob: Blob
}

const DB_NAME = 'smooth-read-bookshelf'
const DB_VERSION = 1
const STORE_EBOOKS = 'ebooks'
const STORE_POSITIONS = 'positions'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_EBOOKS)) {
        const ebooks = db.createObjectStore(STORE_EBOOKS, { keyPath: 'id' })
        ebooks.createIndex('addedAt', 'addedAt', { unique: false })
      }
      if (!db.objectStoreNames.contains(STORE_POSITIONS)) {
        db.createObjectStore(STORE_POSITIONS, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveEbook(ebook: StoredEbook): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_EBOOKS], 'readwrite')
    tx.objectStore(STORE_EBOOKS).put(ebook)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function listEbooks(): Promise<StoredEbookMeta[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_EBOOKS], 'readonly')
    const store = tx.objectStore(STORE_EBOOKS)
    const request = store.getAll()
    request.onsuccess = () => {
      const items = (request.result as StoredEbook[] | StoredEbookMeta[]).map((e: any) => ({
        id: e.id,
        title: e.title,
        author: e.author,
        addedAt: e.addedAt,
        sizeBytes: e.sizeBytes,
      }))
      resolve(items)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getEbook(id: string): Promise<StoredEbook | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_EBOOKS], 'readonly')
    const request = tx.objectStore(STORE_EBOOKS).get(id)
    request.onsuccess = () => resolve((request.result as StoredEbook) || null)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteEbook(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_EBOOKS], 'readwrite')
    tx.objectStore(STORE_EBOOKS).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function saveReadingPosition(id: string, cfi: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_POSITIONS], 'readwrite')
    tx.objectStore(STORE_POSITIONS).put({ id, cfi, updatedAt: Date.now() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getReadingPosition(id: string): Promise<string | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_POSITIONS], 'readonly')
    const request = tx.objectStore(STORE_POSITIONS).get(id)
    request.onsuccess = () => resolve(request.result?.cfi || null)
    request.onerror = () => reject(request.error)
  })
}

export function generateEbookId(title: string): string {
  try {
    if ('randomUUID' in crypto) {
      // @ts-ignore
      return crypto.randomUUID()
    }
  } catch {}
  return `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`
}

