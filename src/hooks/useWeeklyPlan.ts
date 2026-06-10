import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'
import type { WeeklyPlan, DaySlot, SlotIndex } from '@/types'
import { generateWeeklyPlan } from '@/lib/planGenerator'
import { getWeekStart } from '@/lib/dateUtils'
import { newId } from '@/lib/idUtils'

async function getCurrentPlan(): Promise<WeeklyPlan | undefined> {
  return db.weeklyPlans.filter((p) => p.isCurrentWeek).first()
}

export function useCurrentPlan(): WeeklyPlan | undefined {
  return useLiveQuery(() => getCurrentPlan(), [])
}

async function archiveCurrentPlan(plan: WeeklyPlan) {
  const meals = await db.meals.toArray()
  await db.history.add({
    id: plan.id,
    weekStart: plan.weekStart,
    createdAt: Date.now(),
    slotSummaries: plan.slots.map((slot) => {
      const meal = slot.mealId ? meals.find((m) => m.id === slot.mealId) : null
      return {
        slotIndex: slot.slotIndex,
        mealId: slot.mealId,
        mealName: meal?.name ?? null,
        isCatering: slot.isCatering,
        cateringNote: slot.cateringNote,
      }
    }),
  })
}

export async function generateNewPlan() {
  const [meals, history] = await Promise.all([
    db.meals.toArray(),
    db.history.orderBy('weekStart').reverse().limit(2).toArray(),
  ])

  const existing = await getCurrentPlan()
  if (existing) {
    await archiveCurrentPlan(existing)
    await db.weeklyPlans.update(existing.id, { isCurrentWeek: false })
  }

  const plan = generateWeeklyPlan({
    meals,
    history,
    slotsToRegenerate: [0, 1, 2],
  })

  await db.weeklyPlans.add(plan)
  return plan
}

export async function regenerateSlot(plan: WeeklyPlan, slotIndex: SlotIndex) {
  const [meals, history] = await Promise.all([
    db.meals.toArray(),
    db.history.orderBy('weekStart').reverse().limit(2).toArray(),
  ])

  const updated = generateWeeklyPlan({
    meals,
    history,
    slotsToRegenerate: [slotIndex],
    existingPlan: plan,
  })

  await db.weeklyPlans.update(plan.id, { slots: updated.slots, generatedAt: Date.now() })
}

export async function updateSlot(planId: string, slots: [DaySlot, DaySlot, DaySlot]) {
  await db.weeklyPlans.update(planId, { slots })
}

export async function setSlotCatering(
  plan: WeeklyPlan,
  slotIndex: SlotIndex,
  isCatering: boolean,
  cateringNote = ''
) {
  const slots = plan.slots.map((s) =>
    s.slotIndex === slotIndex
      ? { ...s, isCatering, cateringNote, mealId: isCatering ? null : s.mealId }
      : s
  ) as [DaySlot, DaySlot, DaySlot]
  await db.weeklyPlans.update(plan.id, { slots })
}

export async function setSlotMeal(plan: WeeklyPlan, slotIndex: SlotIndex, mealId: string) {
  const slots = plan.slots.map((s) =>
    s.slotIndex === slotIndex
      ? { ...s, mealId, isCatering: false, cateringNote: '' }
      : s
  ) as [DaySlot, DaySlot, DaySlot]
  await db.weeklyPlans.update(plan.id, { slots })
}

export async function ensureCurrentWeekPlan() {
  const existing = await getCurrentPlan()
  if (existing) return

  const currentWeekStart = getWeekStart()

  // Archive any old current-week plan from a previous week
  const oldPlan = await db.weeklyPlans
    .filter((p) => p.isCurrentWeek && p.weekStart < currentWeekStart)
    .first()

  if (oldPlan) {
    await archiveCurrentPlan(oldPlan)
    await db.weeklyPlans.update(oldPlan.id, { isCurrentWeek: false })
  }

  const emptyPlan: WeeklyPlan = {
    id: newId(),
    weekStart: currentWeekStart,
    slots: [
      { slotIndex: 0, mealId: null, isCatering: false, cateringNote: '' },
      { slotIndex: 1, mealId: null, isCatering: false, cateringNote: '' },
      { slotIndex: 2, mealId: null, isCatering: false, cateringNote: '' },
    ],
    generatedAt: Date.now(),
    isCurrentWeek: true,
    notes: '',
  }
  await db.weeklyPlans.add(emptyPlan)
}
