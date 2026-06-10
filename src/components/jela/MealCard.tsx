import { Pencil, Trash2, Package } from 'lucide-react'
import type { Meal } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

interface Props {
  meal: Meal
  onEdit: () => void
  onDelete: () => void
}

export function MealCard({ meal, onEdit, onDelete }: Props) {
  return (
    <Card className="px-4 py-3 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-base font-semibold text-espresso">{meal.name}</h3>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <Badge variant="category" category={meal.category} />
          <Badge variant="duration" duration={meal.duration} />
          {meal.seasons.map((s) => (
            <Badge key={s} variant="season" season={s} />
          ))}
        </div>
        {meal.ingredients.length > 0 && (
          <p className="text-xs text-espresso-muted mt-1.5 flex items-center gap-1">
            <Package size={11} />
            {meal.ingredients.length} namirnic{meal.ingredients.length === 1 ? 'a' : 'e'}
          </p>
        )}
        {meal.notes && (
          <p className="text-xs text-espresso-muted/70 mt-1 italic">{meal.notes}</p>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-2 rounded-xl hover:bg-primary/10 text-espresso-muted hover:text-primary transition-colors"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl hover:bg-red-50 text-espresso-muted hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
  )
}
