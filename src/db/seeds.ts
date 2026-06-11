import { supabase } from '@/lib/supabase'
import { SEED_MEALS } from '@/data/seedMeals'

export async function runSeeds() {
  const { count, error } = await supabase
    .from('meals')
    .select('*', { count: 'exact', head: true })

  // error = tabela ne postoji još; count > 0 = već popunjeno
  if (error || (count ?? 0) > 0) return

  const now = Date.now()
  const rows = SEED_MEALS.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    duration: m.duration,
    seasons: m.seasons,
    ingredients: m.ingredients,
    notes: m.notes,
    created_at: now,
    updated_at: now,
  }))

  await supabase.from('meals').insert(rows)
}
