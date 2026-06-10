import { Plus, X } from 'lucide-react'
import type { Ingredient } from '@/types'
import { newId } from '@/lib/idUtils'

interface Props {
  mealId: string
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
}

export function IngredientsEditor({ mealId, ingredients, onChange }: Props) {
  function add() {
    onChange([
      ...ingredients,
      { id: newId(), name: '', quantity: '', mealId },
    ])
  }

  function update(id: string, field: 'name' | 'quantity', value: string) {
    onChange(ingredients.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  function remove(id: string) {
    onChange(ingredients.filter((i) => i.id !== id))
  }

  return (
    <div>
      <p className="text-xs font-semibold text-espresso-muted uppercase tracking-wider mb-2">
        Namirnice
      </p>
      <div className="flex flex-col gap-2">
        {ingredients.map((ing, idx) => (
          <div key={ing.id} className="flex gap-2 items-center">
            <input
              value={ing.name}
              onChange={(e) => update(ing.id, 'name', e.target.value)}
              placeholder={`Namirnica ${idx + 1}`}
              className="flex-1 text-sm border border-espresso/20 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 bg-bg"
            />
            <input
              value={ing.quantity}
              onChange={(e) => update(ing.id, 'quantity', e.target.value)}
              placeholder="Količina"
              className="w-28 text-sm border border-espresso/20 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 bg-bg"
            />
            <button
              type="button"
              onClick={() => remove(ing.id)}
              className="p-2 rounded-xl hover:bg-red-50 text-espresso-muted hover:text-red-500 transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
      >
        <Plus size={15} />
        Dodaj namirnicu
      </button>
    </div>
  )
}
