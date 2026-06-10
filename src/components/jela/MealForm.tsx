import { useState, useEffect } from 'react'
import type { Meal, MealCategory, Season } from '@/types'
import { ALL_CATEGORIES, SEASON_LABELS, SEASON_ICONS } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { IngredientsEditor } from './IngredientsEditor'
import { newId } from '@/lib/idUtils'

type FormData = {
  name: string
  category: MealCategory
  duration: 1 | 2
  seasons: Season[]
  notes: string
  ingredients: Meal['ingredients']
}

const ALL_SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']

interface Props {
  open: boolean
  onClose: () => void
  meal?: Meal
  onSave: (data: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) => void
}

function emptyForm(): FormData {
  return {
    name: '',
    category: 'Paprikaši/Variva',
    duration: 2,
    seasons: [],
    notes: '',
    ingredients: [],
  }
}

export function MealForm({ open, onClose, meal, onSave }: Props) {
  const mealId = meal?.id ?? newId()
  const [form, setForm] = useState<FormData>(emptyForm())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (meal) {
      setForm({
        name: meal.name,
        category: meal.category,
        duration: meal.duration,
        seasons: meal.seasons,
        notes: meal.notes,
        ingredients: meal.ingredients,
      })
    } else {
      setForm(emptyForm())
    }
  }, [meal, open])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleSeason(s: Season) {
    const seasons = form.seasons.includes(s)
      ? form.seasons.filter((x) => x !== s)
      : [...form.seasons, s]
    set('seasons', seasons)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await onSave({
        name: form.name.trim(),
        category: form.category,
        duration: form.duration,
        seasons: form.seasons,
        notes: form.notes,
        ingredients: form.ingredients.filter((i) => i.name.trim()),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={meal ? 'Uredi jelo' : 'Dodaj jelo'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-espresso-muted uppercase tracking-wider block mb-1.5">
            Naziv jela *
          </label>
          <input
            autoFocus
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="npr. Gulaš"
            className="w-full text-sm border border-espresso/20 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30 bg-bg font-medium"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-espresso-muted uppercase tracking-wider block mb-1.5">
            Kategorija
          </label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value as MealCategory)}
            className="w-full text-sm border border-espresso/20 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30 bg-bg"
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-semibold text-espresso-muted uppercase tracking-wider block mb-1.5">
            Trajanje
          </label>
          <div className="flex gap-2">
            {([1, 2] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => set('duration', d)}
                className={[
                  'flex-1 py-2 rounded-xl text-sm font-medium border transition-all',
                  form.duration === d
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-espresso border-espresso/20 hover:border-primary/40',
                ].join(' ')}
              >
                {d === 1 ? '1 dan' : '2 dana'}
              </button>
            ))}
          </div>
        </div>

        {/* Seasons */}
        <div>
          <label className="text-xs font-semibold text-espresso-muted uppercase tracking-wider block mb-1.5">
            Dostupnost (prazno = cela godina)
          </label>
          <div className="flex gap-2 flex-wrap">
            {ALL_SEASONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSeason(s)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  form.seasons.includes(s)
                    ? 'bg-sage text-white border-sage'
                    : 'bg-white text-espresso-muted border-espresso/20 hover:border-sage/40',
                ].join(' ')}
              >
                {SEASON_ICONS[s]} {SEASON_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <IngredientsEditor
          mealId={mealId}
          ingredients={form.ingredients}
          onChange={(ingredients) => set('ingredients', ingredients)}
        />

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-espresso-muted uppercase tracking-wider block mb-1.5">
            Napomena
          </label>
          <input
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Opciono..."
            className="w-full text-sm border border-espresso/20 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 bg-bg"
          />
        </div>

        <div className="flex gap-3 pt-2 border-t border-espresso/8">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Otkaži
          </Button>
          <Button type="submit" className="flex-1" loading={saving}>
            Sačuvaj
          </Button>
        </div>
      </form>
    </Modal>
  )
}
