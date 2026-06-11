import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Meal, MealCategory, MealDuration, Season, Ingredient } from '@/types'
import { newId } from '@/lib/idUtils'

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

export function useMeals(): Meal[] {
  const [meals, setMeals] = useState<Meal[]>([])

  const fetchMeals = useCallback(async () => {
    const { data } = await supabase.from('meals').select('*').order('name')
    if (data) setMeals(data.map(toMeal))
  }, [])

  useEffect(() => {
    fetchMeals()
    const channel = supabase
      .channel('meals-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meals' }, fetchMeals)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchMeals])

  return meals
}

export async function addMeal(data: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = Date.now()
  await supabase.from('meals').insert({
    id: newId(),
    name: data.name,
    category: data.category,
    duration: data.duration,
    seasons: data.seasons,
    ingredients: data.ingredients,
    notes: data.notes,
    created_at: now,
    updated_at: now,
  })
}

export async function updateMeal(id: string, data: Partial<Omit<Meal, 'id' | 'createdAt'>>) {
  const update: Record<string, unknown> = { updated_at: Date.now() }
  if (data.name !== undefined) update.name = data.name
  if (data.category !== undefined) update.category = data.category
  if (data.duration !== undefined) update.duration = data.duration
  if (data.seasons !== undefined) update.seasons = data.seasons
  if (data.ingredients !== undefined) update.ingredients = data.ingredients
  if (data.notes !== undefined) update.notes = data.notes
  await supabase.from('meals').update(update).eq('id', id)
}

export async function deleteMeal(id: string) {
  await supabase.from('meals').delete().eq('id', id)
}
