import { format, startOfWeek, addDays } from 'date-fns'
import { sr } from 'date-fns/locale'
import type { DayIndex } from '@/types'

export function getWeekStart(date: Date = new Date()): number {
  const monday = startOfWeek(date, { weekStartsOn: 1 })
  monday.setHours(0, 0, 0, 0)
  return monday.getTime()
}

export function formatWeekLabel(weekStart: number): string {
  const mon = new Date(weekStart)
  const sat = addDays(mon, 5)
  const monStr = format(mon, 'd. MMM', { locale: sr })
  const satStr = format(sat, 'd. MMM yyyy.', { locale: sr })
  return `${monStr} — ${satStr}`
}

export function formatShortDate(ts: number): string {
  return format(new Date(ts), 'd. MMM', { locale: sr })
}

export function formatDayDate(weekStart: number, dayIndex: DayIndex): string {
  const day = addDays(new Date(weekStart), dayIndex)
  return format(day, 'd. MMM', { locale: sr })
}

export function formatPairDates(weekStart: number, pairIndex: 0 | 1 | 2): string {
  const mon = new Date(weekStart)
  const start = addDays(mon, pairIndex * 2)
  const end = addDays(mon, pairIndex * 2 + 1)
  return `${format(start, 'd. MMM', { locale: sr })} — ${format(end, 'd. MMM', { locale: sr })}`
}

export function isCurrentWeek(weekStart: number): boolean {
  return weekStart === getWeekStart()
}
