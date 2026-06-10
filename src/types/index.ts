export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type MealDuration = 1 | 2
export type MealCategory =
  | 'Paprikaši/Variva'
  | 'Punjeno'
  | 'Sarmica'
  | 'Musaka'
  | 'Ćufte'
  | 'Testenina'
  | 'Meso'

export const ALL_CATEGORIES: MealCategory[] = [
  'Paprikaši/Variva',
  'Punjeno',
  'Sarmica',
  'Musaka',
  'Ćufte',
  'Testenina',
  'Meso',
]

export const CATEGORY_COLORS: Record<MealCategory, string> = {
  'Paprikaši/Variva': 'bg-orange-100 text-orange-800',
  'Punjeno': 'bg-green-100 text-green-800',
  'Sarmica': 'bg-yellow-100 text-yellow-800',
  'Musaka': 'bg-purple-100 text-purple-800',
  'Ćufte': 'bg-red-100 text-red-800',
  'Testenina': 'bg-amber-100 text-amber-800',
  'Meso': 'bg-rose-100 text-rose-800',
}

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'Proleće',
  summer: 'Leto',
  autumn: 'Jesen',
  winter: 'Zima',
}

export const SEASON_ICONS: Record<Season, string> = {
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
}

export interface Ingredient {
  id: string
  name: string
  quantity: string
  mealId: string
}

export interface Meal {
  id: string
  name: string
  category: MealCategory
  duration: MealDuration
  seasons: Season[]
  ingredients: Ingredient[]
  notes: string
  createdAt: number
  updatedAt: number
}

export type SlotIndex = 0 | 1 | 2

export const SLOT_LABELS: Record<SlotIndex, string> = {
  0: 'Ponedeljak — Utorak',
  1: 'Sreda — Četvrtak',
  2: 'Petak — Subota',
}

export const SLOT_SHORT_LABELS: Record<SlotIndex, string> = {
  0: 'Pon–Uto',
  1: 'Sre–Čet',
  2: 'Pet–Sub',
}

export interface DaySlot {
  slotIndex: SlotIndex
  mealId: string | null
  isCatering: boolean
  cateringNote: string
}

export interface WeeklyPlan {
  id: string
  weekStart: number
  slots: [DaySlot, DaySlot, DaySlot]
  generatedAt: number
  isCurrentWeek: boolean
  notes: string
}

export interface HistorySlotSummary {
  slotIndex: SlotIndex
  mealId: string | null
  mealName: string | null
  isCatering: boolean
  cateringNote: string
}

export interface HistoryEntry {
  id: string
  weekStart: number
  slotSummaries: HistorySlotSummary[]
  createdAt: number
}

export interface ShoppingItem {
  ingredientId: string
  ingredientName: string
  quantity: string
  mealId: string
  mealName: string
}
