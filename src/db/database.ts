import Dexie, { type Table } from 'dexie'
import type { Meal, WeeklyPlan, HistoryEntry } from '@/types'

class KuhinjaDB extends Dexie {
  meals!: Table<Meal>
  weeklyPlans!: Table<WeeklyPlan>
  history!: Table<HistoryEntry>

  constructor() {
    super('KuhinjaDB')
    this.version(1).stores({
      meals: 'id, category, duration',
      weeklyPlans: 'id, weekStart',
      history: 'id, weekStart',
    })
  }
}

export const db = new KuhinjaDB()
