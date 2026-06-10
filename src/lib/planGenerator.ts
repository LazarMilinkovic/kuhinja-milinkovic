import type { Meal, WeeklyPlan, HistoryEntry, DaySlot, SlotIndex } from '@/types'
import { getSeason, isMealAvailable } from './seasonUtils'
import { getWeekStart } from './dateUtils'
import { newId } from './idUtils'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getMealIdsFromLastNWeeks(history: HistoryEntry[], n: number): Set<string> {
  const recent = [...history].sort((a, b) => b.weekStart - a.weekStart).slice(0, n)
  const ids = new Set<string>()
  for (const week of recent) {
    for (const slot of week.slotSummaries) {
      if (slot.mealId) ids.add(slot.mealId)
    }
  }
  return ids
}

function pickMeal(
  candidates: Meal[],
  usedCategories: Set<string>,
  fallback: Meal[]
): Meal | null {
  // Prefer different category
  const preferred = candidates.filter((m) => !usedCategories.has(m.category))
  const pool = preferred.length > 0 ? preferred : candidates
  if (pool.length > 0) return pool[0]
  // Ultimate fallback — pick from all 2-day meals regardless of recency
  const fallbackPool = fallback.filter((m) => !usedCategories.has(m.category))
  return fallbackPool.length > 0 ? fallbackPool[0] : fallback[0] ?? null
}

export interface GenerateOptions {
  meals: Meal[]
  history: HistoryEntry[]
  slotsToRegenerate: SlotIndex[]
  existingPlan?: WeeklyPlan
}

export function generateWeeklyPlan(options: GenerateOptions): WeeklyPlan {
  const { meals, history, slotsToRegenerate, existingPlan } = options

  const season = getSeason()
  const recentIds = getMealIdsFromLastNWeeks(history, 2)

  // Pool for 2-day meals: season-available, not used recently
  const candidates = shuffle(
    meals.filter(
      (m) => m.duration === 2 && isMealAvailable(m, season) && !recentIds.has(m.id)
    )
  )
  // Fallback pool: all 2-day seasonal meals (ignore recency)
  const fallbackPool = shuffle(
    meals.filter((m) => m.duration === 2 && isMealAvailable(m, season))
  )

  const usedCategories = new Set<string>()
  const pickedMealIds = new Set<string>()

  // Pre-populate usedCategories/pickedMealIds from slots NOT being regenerated
  if (existingPlan) {
    for (const slot of existingPlan.slots) {
      if (!slotsToRegenerate.includes(slot.slotIndex) && slot.mealId) {
        usedCategories.add(
          meals.find((m) => m.id === slot.mealId)?.category ?? ''
        )
        pickedMealIds.add(slot.mealId)
      }
    }
  }

  const newSlots: DaySlot[] = [0, 1, 2].map((i) => {
    const idx = i as SlotIndex

    // Preserve slot if not in regeneration list
    if (existingPlan && !slotsToRegenerate.includes(idx)) {
      return existingPlan.slots[idx]
    }

    const available = candidates.filter(
      (m) => !pickedMealIds.has(m.id)
    )
    const fallback = fallbackPool.filter((m) => !pickedMealIds.has(m.id))

    const picked = pickMeal(available, usedCategories, fallback)

    if (picked) {
      usedCategories.add(picked.category)
      pickedMealIds.add(picked.id)
      return {
        slotIndex: idx,
        mealId: picked.id,
        isCatering: false,
        cateringNote: '',
      }
    }

    return {
      slotIndex: idx,
      mealId: null,
      isCatering: false,
      cateringNote: '',
    }
  })

  return {
    id: existingPlan?.id ?? newId(),
    weekStart: getWeekStart(),
    slots: newSlots as [DaySlot, DaySlot, DaySlot],
    generatedAt: Date.now(),
    isCurrentWeek: true,
    notes: existingPlan?.notes ?? '',
  }
}
