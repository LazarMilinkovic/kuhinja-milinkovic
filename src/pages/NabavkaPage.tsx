import { useState, useEffect } from 'react'
import { Printer, Package, CheckCircle2 } from 'lucide-react'
import { useMeals } from '@/hooks/useMeals'
import { useCurrentPlan } from '@/hooks/useWeeklyPlan'
import { useShoppingList } from '@/hooks/useShoppingList'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { formatWeekLabel } from '@/lib/dateUtils'

const STORAGE_KEY = 'kuhinja-checked-items'

function loadChecked(weekStart: number): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (parsed.weekStart !== weekStart) return new Set()
    return new Set(parsed.ids as string[])
  } catch {
    return new Set()
  }
}

function saveChecked(weekStart: number, ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ weekStart, ids: [...ids] }))
}

export function NabavkaPage() {
  const plan = useCurrentPlan()
  const meals = useMeals()
  const items = useShoppingList(plan, meals)

  const [checked, setChecked] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (plan) setChecked(loadChecked(plan.weekStart))
  }, [plan?.weekStart])

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      if (plan) saveChecked(plan.weekStart, next)
      return next
    })
  }

  // Group by meal
  const byMeal: Record<string, typeof items> = {}
  for (const item of items) {
    if (!byMeal[item.mealId]) byMeal[item.mealId] = []
    byMeal[item.mealId].push(item)
  }

  const weekLabel = plan ? formatWeekLabel(plan.weekStart) : ''
  const totalItems = items.length
  const checkedCount = items.filter((i) => checked.has(i.ingredientId)).length

  return (
    <div>
      <PageHeader
        title="Lista za nabavku"
        subtitle={weekLabel}
        right={
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <Printer size={16} />
            Štampaj
          </Button>
        }
      />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Package size={28} className="text-primary" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-espresso mb-2">Nema namirnica</h3>
          <p className="text-sm text-espresso-muted">
            Generiši nedeljni plan i dodaj namirnice jelima da se prikažu ovde.
          </p>
        </div>
      ) : (
        <div className="px-4 py-4">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-white rounded-2xl shadow-card">
            <CheckCircle2 size={18} className={checkedCount === totalItems ? 'text-sage' : 'text-espresso-muted/40'} />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1 font-medium text-espresso">
                <span>Kupljeno</span>
                <span>{checkedCount}/{totalItems}</span>
              </div>
              <div className="h-1.5 bg-espresso/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sage rounded-full transition-all duration-300"
                  style={{ width: `${totalItems ? (checkedCount / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Items by meal */}
          <div className="flex flex-col gap-4">
            {Object.entries(byMeal).map(([mealId, mealItems]) => (
              <div key={mealId}>
                <p className="text-xs font-semibold text-espresso-muted uppercase tracking-wider mb-2 px-1">
                  {mealItems[0].mealName}
                </p>
                <div className="bg-white rounded-2xl shadow-card overflow-hidden divide-y divide-espresso/6">
                  {mealItems.map((item) => (
                    <button
                      key={item.ingredientId}
                      onClick={() => toggle(item.ingredientId)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg transition-colors"
                    >
                      <div className={[
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                        checked.has(item.ingredientId)
                          ? 'bg-sage border-sage'
                          : 'border-espresso/25',
                      ].join(' ')}>
                        {checked.has(item.ingredientId) && (
                          <svg viewBox="0 0 10 8" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="1 4 4 7 9 1" />
                          </svg>
                        )}
                      </div>
                      <span className={[
                        'flex-1 text-sm',
                        checked.has(item.ingredientId)
                          ? 'line-through text-espresso-muted/50'
                          : 'text-espresso',
                      ].join(' ')}>
                        {item.ingredientName}
                      </span>
                      <span className="text-xs text-espresso-muted">{item.quantity}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
