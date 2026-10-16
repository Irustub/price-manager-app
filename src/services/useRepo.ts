import { useCallback, useEffect, useState } from 'react'
import type { Entity } from '../lib/types'
import type { Repository } from './repository'

export function useRepo<T extends Entity>(repo: Repository<T>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const reload = useCallback(async () => {
    setItems(await repo.list())
    setLoading(false)
  }, [repo])
  useEffect(() => {
    void reload()
  }, [reload])
  return { items, loading, reload }
}
