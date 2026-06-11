import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { WeeklyPlan, DayEntry, DayIndex, HistoryEntry, HistoryDaySummary, Meal, Season, Ingredient, MealCategory, MealDuration } from '@/types'
import { generateWeeklyPlan } from '@/lib/planGenerator'
import { getWeekStart } from '@/lib/dateUtils'
import { newId } from '@/lib/idUtils'

// ─── Maperi ──────────────────────────────────────────────────────────────────

function toPlan(row: Record<string, unknown>): WeeklyPlan {
  return {
    id: row.id as string,
    weekStart: row.week_start as number,
    days: (row.days ?? []) as DayEntry[],
    generatedAt: row.generated_at as number,
    isCurrentWeek: row.is_current_week as boolean,
    notes: (row.notes ?? '') as string,
  }
}

function fromPlan(plan: WeeklyPlan) {
  return {
    id: plan.id,
    week_start: plan.weekStart,
    days: plan.days,
    generated_at: plan.generatedAt,
    is_current_week: plan.isCurrentWeek,
    notes: plan.notes,
  }
}

function toMeal(row: Record<string, unknown>): Meal {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as MealCategory,
    duration: row.duration as MealDuration,
    seasons: (row.seasons ?? []) as Season[],
    ingredients: (row.ingredients ?? []) as Ingredient[],
    notes: (row.notes ?? '') as string,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  }
}

function toHistory(row: Record<string, unknown>): HistoryEntry {
  return {
    id: row.id as string,
    weekStart: row.week_start as number,
    daySummaries: (row.day_summaries ?? []) as HistoryDaySummary[],
    createdAt: row.created_at as number,
  }
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchCurrentPlan(): Promise<WeeklyPlan | undefined> {
  const { data } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('is_current_week', true)
    .limit(1)
    .maybeSingle()
  return data ? toPlan(data as Record<string, unknown>) : undefined
}

async function fetchMeals(): Promise<Meal[]> {
  const { data } = await supabase.from('meals').select('*')
  return (data ?? []).map((r) => toMeal(r as Record<string, unknown>))
}

async function fetchRecentHistory(limit = 2): Promise<HistoryEntry[]> {
  const { data } = await supabase
    .from('history')
    .select('*')
    .order('week_start', { ascending: false })
    .limit(limit)
  return (data ?? []).map((r) => toHistory(r as Record<string, unknown>))
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCurrentPlan(): WeeklyPlan | undefined {
  const [plan, setPlan] = useState<WeeklyPlan | undefined>(undefined)

  const refresh = useCallback(async () => {
    const p = await fetchCurrentPlan()
    setPlan(p)
  }, [])

  useEffect(() => {
    refresh()
    const channel = supabase
      .channel('weekly-plans-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_plans' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [refresh])

  return plan
}

// ─── Arhiviranje ─────────────────────────────────────────────────────────────

async function archiveCurrentPlan(plan: WeeklyPlan, allMeals: Meal[]) {
  const seenMealIds = new Set<string>()
  const daySummaries: HistoryDaySummary[] = plan.days.map((day) => {
    const meal = day.mealId && !seenMealIds.has(day.mealId)
      ? allMeals.find((m) => m.id === day.mealId) ?? null
      : null
    if (day.mealId) seenMealIds.add(day.mealId)
    return {
      dayIndex: day.dayIndex,
      mealId: day.mealId,
      mealName: meal?.name ?? (day.mealId ? allMeals.find((m) => m.id === day.mealId)?.name ?? null : null),
      isCatering: day.isCatering,
      cateringNote: day.cateringNote,
    }
  })

  await supabase.from('history').insert({
    id: plan.id,
    week_start: plan.weekStart,
    day_summaries: daySummaries,
    created_at: Date.now(),
  })
}

// ─── Mutacije ────────────────────────────────────────────────────────────────

export async function generateNewPlan() {
  const [allMeals, history] = await Promise.all([fetchMeals(), fetchRecentHistory(2)])

  const existing = await fetchCurrentPlan()
  if (existing) {
    await archiveCurrentPlan(existing, allMeals)
    await supabase.from('weekly_plans').update({ is_current_week: false }).eq('id', existing.id)
  }

  const plan = generateWeeklyPlan({ meals: allMeals, history, pairsToRegenerate: [0, 1, 2] })
  await supabase.from('weekly_plans').insert(fromPlan(plan))
  return plan
}

export async function regeneratePair(plan: WeeklyPlan, pairIndex: number) {
  const [allMeals, history] = await Promise.all([fetchMeals(), fetchRecentHistory(2)])

  const updated = generateWeeklyPlan({
    meals: allMeals,
    history,
    pairsToRegenerate: [pairIndex],
    existingPlan: plan,
  })

  await supabase
    .from('weekly_plans')
    .update({ days: updated.days, generated_at: Date.now() })
    .eq('id', plan.id)
}

export async function clearDay(plan: WeeklyPlan, dayIndex: DayIndex) {
  const days: DayEntry[] = plan.days.map((d) =>
    d.dayIndex === dayIndex
      ? { ...d, mealId: null, isCatering: false, cateringNote: '' }
      : d
  )
  await supabase.from('weekly_plans').update({ days }).eq('id', plan.id)
}

export async function setDayCatering(
  plan: WeeklyPlan,
  dayIndex: DayIndex,
  isCatering: boolean,
  cateringNote = ''
) {
  const days: DayEntry[] = plan.days.map((d) =>
    d.dayIndex === dayIndex
      ? { ...d, isCatering, cateringNote, mealId: isCatering ? null : d.mealId }
      : d
  )
  await supabase.from('weekly_plans').update({ days }).eq('id', plan.id)
}

export async function setDayMeal(plan: WeeklyPlan, dayIndex: DayIndex, mealId: string) {
  const days: DayEntry[] = plan.days.map((d) =>
    d.dayIndex === dayIndex
      ? { ...d, mealId, isCatering: false, cateringNote: '' }
      : d
  )
  await supabase.from('weekly_plans').update({ days }).eq('id', plan.id)
}

export async function ensureCurrentWeekPlan() {
  const existing = await fetchCurrentPlan()
  if (existing) return

  const currentWeekStart = getWeekStart()

  // Arhiviraj stari plan ako postoji
  const { data: oldPlans } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('is_current_week', true)
    .lt('week_start', currentWeekStart)
    .limit(1)

  if (oldPlans && oldPlans.length > 0) {
    const oldPlan = toPlan(oldPlans[0] as Record<string, unknown>)
    const allMeals = await fetchMeals()
    await archiveCurrentPlan(oldPlan, allMeals)
    await supabase.from('weekly_plans').update({ is_current_week: false }).eq('id', oldPlan.id)
  }

  const emptyDays: DayEntry[] = [0, 1, 2, 3, 4, 5].map((i) => ({
    dayIndex: i as DayIndex,
    mealId: null,
    isCatering: false,
    cateringNote: '',
  }))

  const emptyPlan: WeeklyPlan = {
    id: newId(),
    weekStart: currentWeekStart,
    days: emptyDays,
    generatedAt: Date.now(),
    isCurrentWeek: true,
    notes: '',
  }

  await supabase.from('weekly_plans').insert(fromPlan(emptyPlan))
}
