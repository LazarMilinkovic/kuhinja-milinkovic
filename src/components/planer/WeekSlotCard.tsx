import { useState } from 'react'
import { RefreshCw, Truck, Utensils, ChevronDown, X } from 'lucide-react'
import type { DayEntry, WeeklyPlan, DayIndex, Meal } from '@/types'
import { DAY_NAMES, DAY_NAMES_SHORT, DAY_PAIRS, PAIR_LABELS } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatDayDate, formatPairDates } from '@/lib/dateUtils'

interface DayRowProps {
  dayEntry: DayEntry
  meal: Meal | undefined
  weekStart: number
  onPickMeal: (dayIndex: DayIndex) => void
  onClearMeal: (dayIndex: DayIndex) => void
  onSetCatering: (dayIndex: DayIndex, value: boolean, note?: string) => void
}

function DayRow({ dayEntry, meal, weekStart, onPickMeal, onClearMeal, onSetCatering }: DayRowProps) {
  const [showCateringInput, setShowCateringInput] = useState(false)
  const [cateringNote, setCateringNote] = useState(dayEntry.cateringNote)

  const dayShort = DAY_NAMES_SHORT[dayEntry.dayIndex]
  const dayFull = DAY_NAMES[dayEntry.dayIndex]
  const date = formatDayDate(weekStart, dayEntry.dayIndex)

  function handleCateringSubmit() {
    onSetCatering(dayEntry.dayIndex, true, cateringNote)
    setShowCateringInput(false)
  }

  return (
    <div className="px-4 py-3 border-t border-espresso/6">
      <div className="flex items-start gap-3">
        {/* Dan */}
        <div className="flex-shrink-0 w-14 pt-0.5">
          <p className="text-xs font-bold text-primary uppercase tracking-wide">{dayShort}</p>
          <p className="text-xs text-espresso-muted">{date}</p>
        </div>

        {/* Sadržaj */}
        <div className="flex-1 min-w-0">
          {dayEntry.isCatering ? (
            <div>
              <p className="text-sm font-medium text-espresso">Ketering</p>
              {dayEntry.cateringNote && (
                <p className="text-xs text-espresso-muted mt-0.5">{dayEntry.cateringNote}</p>
              )}
              <button
                onClick={() => onSetCatering(dayEntry.dayIndex, false)}
                className="mt-1.5 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X size={11} /> Ukloni ketering
              </button>
            </div>
          ) : meal ? (
            <div>
              <p className="text-sm font-semibold text-espresso leading-snug">{meal.name}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <Badge variant="category" category={meal.category} />
                <Badge variant="duration" duration={meal.duration} />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-espresso-muted mb-2">Nema obroka</p>
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => onPickMeal(dayEntry.dayIndex)}>
                  <Utensils size={13} />
                  Odaberi jelo
                </Button>
                {!showCateringInput && (
                  <Button size="sm" variant="ghost" onClick={() => setShowCateringInput(true)}>
                    <Truck size={13} />
                    Ketering
                  </Button>
                )}
              </div>
              {showCateringInput && (
                <div className="flex gap-2 items-center mt-2">
                  <input
                    autoFocus
                    value={cateringNote}
                    onChange={(e) => setCateringNote(e.target.value)}
                    placeholder={`Napomena za ${dayFull.toLowerCase()}...`}
                    className="flex-1 text-sm border border-espresso/20 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/30 bg-bg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCateringSubmit()
                      if (e.key === 'Escape') setShowCateringInput(false)
                    }}
                  />
                  <Button variant="primary" size="sm" onClick={handleCateringSubmit}>
                    <ChevronDown size={14} /> OK
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowCateringInput(false)}>
                    <X size={14} />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Akcije kada je jelo postavljeno */}
          {(meal || dayEntry.isCatering) && !showCateringInput && (
            <div className="flex gap-1.5 mt-2">
              {!dayEntry.isCatering && (
                <Button size="sm" variant="ghost" onClick={() => onPickMeal(dayEntry.dayIndex)}>
                  <Utensils size={13} />
                  Promeni
                </Button>
              )}
              {!dayEntry.isCatering && !meal && null}
              {meal && !dayEntry.isCatering && (
                <Button size="sm" variant="ghost" onClick={() => setShowCateringInput(true)}>
                  <Truck size={13} />
                  Ketering
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onClearMeal(dayEntry.dayIndex)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X size={13} />
                Obriši
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface PairCardProps {
  pairIndex: 0 | 1 | 2
  plan: WeeklyPlan
  meals: Meal[]
  onRegenerate: (pairIndex: number) => void
  onPickMeal: (dayIndex: DayIndex) => void
  onClearMeal: (dayIndex: DayIndex) => void
  onSetCatering: (dayIndex: DayIndex, value: boolean, note?: string) => void
  regenerating: boolean
}

export function PairCard({
  pairIndex,
  plan,
  meals,
  onRegenerate,
  onPickMeal,
  onClearMeal,
  onSetCatering,
  regenerating,
}: PairCardProps) {
  const [dayA, dayB] = DAY_PAIRS[pairIndex]
  const dayAEntry = plan.days.find((d) => d.dayIndex === dayA)!
  const dayBEntry = plan.days.find((d) => d.dayIndex === dayB)!

  const label = PAIR_LABELS[pairIndex]
  const dates = formatPairDates(plan.weekStart, pairIndex)

  return (
    <Card className="overflow-hidden">
      {/* Header para */}
      <div className="px-4 pt-4 pb-3 border-b border-espresso/6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">{label}</p>
          <p className="text-xs text-espresso-muted mt-0.5">{dates}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onRegenerate(pairIndex)}
          loading={regenerating}
        >
          <RefreshCw size={13} />
          Regeneriši
        </Button>
      </div>

      {/* Pon/Sre/Pet */}
      <DayRow
        dayEntry={dayAEntry}
        meal={meals.find((m) => m.id === dayAEntry.mealId)}
        weekStart={plan.weekStart}
        onPickMeal={onPickMeal}
        onClearMeal={onClearMeal}
        onSetCatering={onSetCatering}
      />

      {/* Uto/Čet/Sub */}
      <DayRow
        dayEntry={dayBEntry}
        meal={meals.find((m) => m.id === dayBEntry.mealId)}
        weekStart={plan.weekStart}
        onPickMeal={onPickMeal}
        onClearMeal={onClearMeal}
        onSetCatering={onSetCatering}
      />
    </Card>
  )
}
