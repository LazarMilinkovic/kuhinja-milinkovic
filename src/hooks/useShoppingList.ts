import { useMemo } from 'react'
import type { WeeklyPlan, ShoppingItem } from '@/types'
import type { Meal } from '@/types'

export function useShoppingList(plan: WeeklyPlan | undefined, meals: Meal[]): ShoppingItem[] {
  return useMemo(() => {
    if (!plan) return []
    const items: ShoppingItem[] = []
    for (const slot of plan.slots) {
      if (!slot.mealId || slot.isCatering) continue
      const meal = meals.find((m) => m.id === slot.mealId)
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
