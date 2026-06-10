import { useState } from 'react'
import { RefreshCw, Truck, Utensils, ChevronDown, X } from 'lucide-react'
import type { DaySlot, WeeklyPlan, SlotIndex } from '@/types'
import { SLOT_LABELS } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatSlotDates } from '@/lib/dateUtils'
import type { Meal } from '@/types'

interface Props {
  slot: DaySlot
  plan: WeeklyPlan
  meal: Meal | undefined
  onRegenerate: (slotIndex: SlotIndex) => void
  onSetCatering: (slotIndex: SlotIndex, value: boolean, note?: string) => void
  onPickMeal: (slotIndex: SlotIndex) => void
  regenerating: boolean
}

export function WeekSlotCard({ slot, plan, meal, onRegenerate, onSetCatering, onPickMeal, regenerating }: Props) {
  const [showCateringInput, setShowCateringInput] = useState(false)
  const [cateringNote, setCateringNote] = useState(slot.cateringNote)

  const label = SLOT_LABELS[slot.slotIndex]
  const dates = formatSlotDates(plan.weekStart, slot.slotIndex)

  function handleCateringSubmit() {
    onSetCatering(slot.slotIndex, true, cateringNote)
    setShowCateringInput(false)
  }

  return (
    <Card className="overflow-hidden">
      {/* Slot header */}
      <div className="px-4 pt-4 pb-3 border-b border-espresso/6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">{label}</p>
            <p className="text-xs text-espresso-muted mt-0.5">{dates}</p>
          </div>
          {slot.isCatering && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              <Truck size={12} />
              Ketering
            </span>
          )}
        </div>
      </div>

      {/* Slot body */}
      <div className="px-4 py-4">
        {slot.isCatering ? (
          <div>
            <p className="text-sm text-espresso-muted">
              {slot.cateringNote || 'Dostava / ketering'}
            </p>
            <button
              onClick={() => onSetCatering(slot.slotIndex, false)}
              className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X size={12} /> Ukloni ketering
            </button>
          </div>
        ) : meal ? (
          <div>
            <h3 className="font-serif text-xl font-semibold text-espresso mb-2">{meal.name}</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant="category" category={meal.category} />
              <Badge variant="duration" duration={meal.duration} />
              {meal.seasons.map((s) => (
                <Badge key={s} variant="season" season={s} />
              ))}
            </div>
            {meal.ingredients.length > 0 && (
              <p className="text-xs text-espresso-muted">
                {meal.ingredients.length} namirnic{meal.ingredients.length === 1 ? 'a' : 'e'}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-espresso-muted text-sm mb-3">Nema planiranog obroka</p>
            <Button variant="secondary" size="sm" onClick={() => onPickMeal(slot.slotIndex)}>
              <Utensils size={14} />
              Odaberi jelo
            </Button>
          </div>
        )}
      </div>

      {/* Actions */}
      {!slot.isCatering && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRegenerate(slot.slotIndex)}
            loading={regenerating}
          >
            <RefreshCw size={14} />
            Regeneriši
          </Button>
          {!showCateringInput ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCateringInput(true)}
            >
              <Truck size={14} />
              Ketering
            </Button>
          ) : (
            <div className="flex-1 flex gap-2 items-center w-full mt-1">
              <input
                autoFocus
                value={cateringNote}
                onChange={(e) => setCateringNote(e.target.value)}
                placeholder="Napomena (opciono)"
                className="flex-1 text-sm border border-espresso/20 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/30 bg-bg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCateringSubmit()
                  if (e.key === 'Escape') setShowCateringInput(false)
                }}
              />
              <Button variant="primary" size="sm" onClick={handleCateringSubmit}>
                <ChevronDown size={14} />
                OK
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCateringInput(false)}>
                <X size={14} />
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
