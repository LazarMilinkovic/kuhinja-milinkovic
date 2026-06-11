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

// 0=Pon, 1=Uto, 2=Sre, 3=Čet, 4=Pet, 5=Sub
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5

export const DAY_NAMES: Record<DayIndex, string> = {
  0: 'Ponedeljak',
  1: 'Utorak',
  2: 'Sreda',
  3: 'Četvrtak',
  4: 'Petak',
  5: 'Subota',
}

export const DAY_NAMES_SHORT: Record<DayIndex, string> = {
  0: 'Pon',
  1: 'Uto',
  2: 'Sre',
  3: 'Čet',
  4: 'Pet',
  5: 'Sub',
}

// Parovi: [Pon,Uto], [Sre,Čet], [Pet,Sub]
export const DAY_PAIRS = [[0, 1], [2, 3], [4, 5]] as const

export const PAIR_LABELS = {
  0: 'Ponedeljak — Utorak',
  1: 'Sreda — Četvrtak',
  2: 'Petak — Subota',
} as const

export interface DayEntry {
  dayIndex: DayIndex
  mealId: string | null
  isCatering: boolean
  cateringNote: string
}

export interface WeeklyPlan {
  id: string
  weekStart: number
  days: DayEntry[]
  generatedAt: number
  isCurrentWeek: boolean
  notes: string
}

export interface HistoryDaySummary {
  dayIndex: DayIndex
  mealId: string | null
  mealName: string | null
  isCatering: boolean
  cateringNote: string
}

export interface HistoryEntry {
  id: string
  weekStart: number
  daySummaries: HistoryDaySummary[]
  createdAt: number
}

export interface ShoppingItem {
  ingredientId: string
  ingredientName: string
  quantity: string
  mealId: string
  mealName: string
}
