import { addDoc, collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { Entity } from '../lib/types'

export interface Repository<T extends Entity> {
  list(): Promise<T[]>
  add(data: Omit<T, 'id'>): Promise<T>
  update(item: T): Promise<void>
  remove(id: string): Promise<void>
}

/** Firestore when configured, otherwise localStorage (handy for local development). */
export function createRepository<T extends Entity>(name: string): Repository<T> {
  if (db) {
    const col = collection(db, name)
    return {
      async list() {
        const snap = await getDocs(col)
        return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as T)
      },
      async add(data) {
        const ref = await addDoc(col, data)
        return { ...data, id: ref.id } as T
      },
      async update(item) {
        const { id, ...rest } = item
        await setDoc(doc(col, id), rest)
      },
      async remove(id) {
        await deleteDoc(doc(col, id))
      },
    }
  }
  const key = `pm_${name}`
  const read = (): T[] => JSON.parse(localStorage.getItem(key) ?? '[]')
  const write = (items: T[]) => localStorage.setItem(key, JSON.stringify(items))
  return {
    async list() { return read() },
    async add(data) {
      const item = { ...data, id: crypto.randomUUID() } as T
      write([...read(), item])
      return item
    },
    async update(item) { write(read().map((x) => (x.id === item.id ? item : x))) },
    async remove(id) { write(read().filter((x) => x.id !== id)) },
  }
}
