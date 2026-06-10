import { useState } from 'react'
import { Search } from 'lucide-react'
import type { Meal, SlotIndex } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'

interface Props {
  open: boolean
  onClose: () => void
  meals: Meal[]
  slotIndex: SlotIndex | null
  onSelect: (slotIndex: SlotIndex, mealId: string) => void
}

export function PickMealModal({ open, onClose, meals, slotIndex, onSelect }: Props) {
  const [search, setSearch] = useState('')

  const filtered = meals.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Modal open={open} onClose={onClose} title="Odaberi jelo" size="md">
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-muted" />
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretraži jela..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-espresso/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 bg-bg"
        />
      </div>
      <div className="flex flex-col gap-1">
        {filtered.map((meal) => (
          <button
            key={meal.id}
            onClick={() => {
              if (slotIndex !== null) onSelect(slotIndex, meal.id)
              onClose()
            }}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-bg text-left transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-espresso text-sm">{meal.name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="category" category={meal.category} />
                <Badge variant="duration" duration={meal.duration} />
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-espresso-muted py-6">Nema rezultata</p>
        )}
      </div>
    </Modal>
  )
}
