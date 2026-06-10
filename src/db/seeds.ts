import { db } from './database'
import { SEED_MEALS } from '@/data/seedMeals'

export async function runSeeds() {
  const count = await db.meals.count()
  if (count > 0) return

  const now = Date.now()
  await db.meals.bulkAdd(
    SEED_MEALS.map((m) => ({ ...m, createdAt: now, updatedAt: now }))
  )
}
