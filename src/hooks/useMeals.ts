import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'
import type { Meal } from '@/types'
import { newId } from '@/lib/idUtils'

export function useMeals() {
  const meals = useLiveQuery(() => db.meals.toArray(), []) ?? []
  return [...meals].sort((a, b) => a.name.localeCompare(b.name, 'sr'))
}

export async function addMeal(data: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = Date.now()
  await db.meals.add({ ...data, id: newId(), createdAt: now, updatedAt: now })
}

export async function updateMeal(id: string, data: Partial<Omit<Meal, 'id' | 'createdAt'>>) {
  await db.meals.update(id, { ...data, updatedAt: Date.now() })
}

export async function deleteMeal(id: string) {
  await db.meals.delete(id)
}
