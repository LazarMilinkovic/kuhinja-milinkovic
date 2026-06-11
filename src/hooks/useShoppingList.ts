import { useMemo } from 'react'
import type { WeeklyPlan, ShoppingItem } from '@/types'
import type { Meal } from '@/types'

export function useShoppingList(plan: WeeklyPlan | undefined, meals: Meal[]): ShoppingItem[] {
  return useMemo(() => {
    if (!plan) return []
    const items: ShoppingItem[] = []
    const seenMealIds = new Set<string>()
    for (const day of plan.days) {
      if (!day.mealId || day.isCatering) continue
      if (seenMealIds.has(day.mealId)) continue  // isti obrok za oba dana → jednom u listi
      seenMealIds.add(day.mealId)
      const meal = meals.find((m) => m.id === day.mealId)
      if (!meal) continue
      for (const ing of meal.ingredients) {
        items.push({
          ingredientId: ing.id,
          ingredientName: ing.name,
          quantity: ing.quantity,
          mealId: meal.id,
          mealName: meal.name,
        })
      }
    }
    return items
  }, [plan, meals])
}
