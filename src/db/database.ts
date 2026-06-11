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
    // v2: planovi i istorija prelaze na strukturu po danima (days[] umesto slots[])
    this.version(2).stores({
      meals: 'id, category, duration',
      weeklyPlans: 'id, weekStart',
      history: 'id, weekStart',
    }).upgrade(async (trans) => {
      await trans.table('weeklyPlans').clear()
      await trans.table('history').clear()
    })
  }
}

export const db = new KuhinjaDB()
