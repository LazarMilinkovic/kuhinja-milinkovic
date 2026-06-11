import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useMeals } from '@/hooks/useMeals'
import {
  useCurrentPlan,
  generateNewPlan,
  regeneratePair,
  setDayCatering,
  setDayMeal,
  clearDay,
  ensureCurrentWeekPlan,
} from '@/hooks/useWeeklyPlan'
import { PageHeader } from '@/components/layout/PageHeader'
import { PairCard } from '@/components/planer/WeekSlotCard'
import { PickMealModal } from '@/components/planer/PickMealModal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatWeekLabel } from '@/lib/dateUtils'
import { getSeason } from '@/lib/seasonUtils'
import { SEASON_ICONS, SEASON_LABELS } from '@/types'
import type { DayIndex } from '@/types'

export function PlanerPage() {
  const plan = useCurrentPlan()
  const meals = useMeals()
  const { toast } = useToast()

  const [generating, setGenerating] = useState(false)
  const [regeneratingPair, setRegeneratingPair] = useState<number | null>(null)
  const [confirmGenerate, setConfirmGenerate] = useState(false)
  const [pickDay, setPickDay] = useState<DayIndex | null>(null)

  const season = getSeason()

  useEffect(() => {
    ensureCurrentWeekPlan()
  }, [])

  async function handleGenerateNew() {
    if (plan && plan.days.some((d) => d.mealId || d.isCatering)) {
      setConfirmGenerate(true)
      return
    }
    await doGenerate()
  }

  async function doGenerate() {
    setGenerating(true)
    setConfirmGenerate(false)
    try {
      await generateNewPlan()
      toast('Nova nedelja generisana! 🎉')
    } catch {
      toast('Greška pri generisanju', 'error')
    } finally {
      setGenerating(false)
    }
  }

  async function handleRegenerate(pairIndex: number) {
    if (!plan) return
    setRegeneratingPair(pairIndex)
    try {
      await regeneratePair(plan, pairIndex)
      toast('Par regenerisan')
    } catch {
      toast('Greška pri regenerisanju', 'error')
    } finally {
      setRegeneratingPair(null)
    }
  }

  async function handleSetCatering(dayIndex: DayIndex, value: boolean, note = '') {
    if (!plan) return
    await setDayCatering(plan, dayIndex, value, note)
    toast(value ? 'Ketering označen' : 'Ketering uklonjen')
  }

  async function handlePickMeal(dayIndex: DayIndex, mealId: string) {
    if (!plan) return
    await setDayMeal(plan, dayIndex, mealId)
    toast('Jelo odabrano')
  }

  async function handleClearMeal(dayIndex: DayIndex) {
    if (!plan) return
    await clearDay(plan, dayIndex)
    toast('Obrok uklonjen')
  }

  const weekLabel = plan ? formatWeekLabel(plan.weekStart) : ''
  const seasonLabel = `${SEASON_ICONS[season]} ${SEASON_LABELS[season]}`

  return (
    <div>
      <PageHeader
        title="Nedeljni planer"
        subtitle={weekLabel}
        right={
          <span className="text-xs px-2 py-1 bg-sage/20 text-sage-dark rounded-full font-medium">
            {seasonLabel}
          </span>
        }
      />

      <div className="px-4 py-4 flex flex-col gap-3">
        {plan && [0, 1, 2].map((pairIndex) => (
          <PairCard
            key={pairIndex}
            pairIndex={pairIndex as 0 | 1 | 2}
            plan={plan}
            meals={meals}
            onRegenerate={handleRegenerate}
            onPickMeal={setPickDay}
            onClearMeal={handleClearMeal}
            onSetCatering={handleSetCatering}
            regenerating={regeneratingPair === pairIndex}
          />
        ))}
      </div>

      {/* FAB */}
      <div className="fixed bottom-20 right-4 no-print">
        <Button
          size="lg"
          onClick={handleGenerateNew}
          loading={generating}
          className="rounded-2xl shadow-warm-lg"
        >
          <Sparkles size={18} />
          Generiši novu sedmicu
        </Button>
      </div>

      {/* Potvrda brisanja plana */}
      {confirmGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" onClick={() => setConfirmGenerate(false)} />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-warm-lg z-10">
            <h3 className="font-serif text-lg font-semibold text-espresso mb-2">Generisati novu sedmicu?</h3>
            <p className="text-sm text-espresso-muted mb-5">
              Trenutni plan će biti arhiviran u istoriju.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmGenerate(false)}>
                Otkaži
              </Button>
              <Button className="flex-1" onClick={doGenerate} loading={generating}>
                Generiši
              </Button>
            </div>
          </div>
        </div>
      )}

      <PickMealModal
        open={pickDay !== null}
        onClose={() => setPickDay(null)}
        meals={meals}
        dayIndex={pickDay}
        onSelect={handlePickMeal}
      />
    </div>
  )
}
