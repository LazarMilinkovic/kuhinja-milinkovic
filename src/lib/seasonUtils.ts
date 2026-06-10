import type { Season, Meal } from '@/types'

export function getSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export function isMealAvailable(meal: Meal, season: Season): boolean {
  if (meal.seasons.length === 0) return true
  return meal.seasons.includes(season)
}
