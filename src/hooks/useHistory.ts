import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'

export function useHistory(limit = 20) {
  return (
    useLiveQuery(
      () => db.history.orderBy('weekStart').reverse().limit(limit).toArray(),
      [limit]
    ) ?? []
  )
}
