import type { Meal, WeeklyPlan, HistoryEntry, DayEntry, DayIndex } from '@/types'
import { DAY_PAIRS } from '@/types'
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
    for (const day of week.daySummaries) {
      if (day.mealId) ids.add(day.mealId)
    }
  }
  return ids
}

function pickMeal(
  candidates: Meal[],
  usedCategories: Set<string>,
  fallback: Meal[]
): Meal | null {
  const preferred = candidates.filter((m) => !usedCategories.has(m.category))
  const pool = preferred.length > 0 ? preferred : candidates
  if (pool.length > 0) return pool[0]
  const fallbackPool = fallback.filter((m) => !usedCategories.has(m.category))
  return fallbackPool.length > 0 ? fallbackPool[0] : fallback[0] ?? null
}

export interface GenerateOptions {
  meals: Meal[]
  history: HistoryEntry[]
  // Koji parovi se regenerišu: 0=Pon-Uto, 1=Sre-Čet, 2=Pet-Sub
  pairsToRegenerate: number[]
  existingPlan?: WeeklyPlan
}

export function generateWeeklyPlan(options: GenerateOptions): WeeklyPlan {
  const { meals, history, pairsToRegenerate, existingPlan } = options

  const season = getSeason()
  const recentIds = getMealIdsFromLastNWeeks(history, 2)

  const candidates = shuffle(
    meals.filter(
      (m) => m.duration === 2 && isMealAvailable(m, season) && !recentIds.has(m.id)
    )
  )
  const fallbackPool = shuffle(
    meals.filter((m) => m.duration === 2 && isMealAvailable(m, season))
  )

  const usedCategories = new Set<string>()
  const pickedMealIds = new Set<string>()

  // Uzmi u obzir parove koji se NE regenerišu
  if (existingPlan) {
    for (let pairIdx = 0; pairIdx < 3; pairIdx++) {
      if (pairsToRegenerate.includes(pairIdx)) continue
      const [dayA] = DAY_PAIRS[pairIdx]
      const existing = existingPlan.days.find((d) => d.dayIndex === dayA)
      if (existing?.mealId) {
        const meal = meals.find((m) => m.id === existing.mealId)
        if (meal) {
          usedCategories.add(meal.category)
          pickedMealIds.add(existing.mealId)
        }
      }
    }
  }

  // Kreiranje 6 dana — kopiraj postojeće ili prazni
  const newDays: DayEntry[] = Array.from({ length: 6 }, (_, i) => {
    const dayIndex = i as DayIndex
    if (existingPlan) {
      const existing = existingPlan.days.find((d) => d.dayIndex === dayIndex)
      if (existing) return { ...existing }
    }
    return { dayIndex, mealId: null, isCatering: false, cateringNote: '' }
  })

  // Regeneriši tražene parove
  for (let pairIdx = 0; pairIdx < 3; pairIdx++) {
    if (!pairsToRegenerate.includes(pairIdx)) continue

    const [dayA, dayB] = DAY_PAIRS[pairIdx]

    const available = candidates.filter((m) => !pickedMealIds.has(m.id))
    const fallback = fallbackPool.filter((m) => !pickedMealIds.has(m.id))
    const picked = pickMeal(available, usedCategories, fallback)

    if (picked) {
      usedCategories.add(picked.category)
      pickedMealIds.add(picked.id)
      newDays[dayA] = { dayIndex: dayA, mealId: picked.id, isCatering: false, cateringNote: '' }
      newDays[dayB] = { dayIndex: dayB, mealId: picked.id, isCatering: false, cateringNote: '' }
    } else {
      newDays[dayA] = { dayIndex: dayA, mealId: null, isCatering: false, cateringNote: '' }
      newDays[dayB] = { dayIndex: dayB, mealId: null, isCatering: false, cateringNote: '' }
    }
  }

  return {
    id: existingPlan?.id ?? newId(),
    weekStart: getWeekStart(),
    days: newDays,
    generatedAt: Date.now(),
    isCurrentWeek: true,
    notes: existingPlan?.notes ?? '',
  }
}
