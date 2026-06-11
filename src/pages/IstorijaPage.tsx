import { useState } from 'react'
import { ChevronDown, Truck, UtensilsCrossed, Clock, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useHistory, deleteHistoryEntry } from '@/hooks/useHistory'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatWeekLabel, formatDayDate } from '@/lib/dateUtils'
import { DAY_NAMES } from '@/types'
import type { DayIndex } from '@/types'
import { useToast } from '@/components/ui/Toast'

export function IstorijaPage() {
  const history = useHistory(50)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDeletingId(id)
    try {
      await deleteHistoryEntry(id)
      if (expanded === id) setExpanded(null)
      toast('Nedelja obrisana iz istorije')
    } catch {
      toast('Greška pri brisanju', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  // Grupiši danove po jedinstvenim jelima za preview tekst
  function getPreviewText(daySummaries: typeof history[0]['daySummaries']): string {
    const seenMeals = new Set<string>()
    return daySummaries
      .filter((d) => !d.isCatering && d.mealName && !seenMeals.has(d.mealName) && (seenMeals.add(d.mealName!), true))
      .map((d) => d.mealName!)
      .join(' · ')
  }

  return (
    <div>
      <PageHeader
        title="Istorija obroka"
        subtitle={`${history.length} prethodnih nedelja`}
      />

      <div className="px-4 py-4 flex flex-col gap-2">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Clock size={28} className="text-primary" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-espresso mb-2">Nema istorije</h3>
            <p className="text-sm text-espresso-muted">
              Generiši prvi nedeljni plan da počneš da pratiš obroke.
            </p>
          </div>
        )}

        {history.map((entry) => {
          const isOpen = expanded === entry.id
          const weekLabel = formatWeekLabel(entry.weekStart)
          const preview = getPreviewText(entry.daySummaries)
          const isDeleting = deletingId === entry.id

          return (
            <div key={entry.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : entry.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-medium text-sm text-espresso">{weekLabel}</p>
                  <p className="text-xs text-espresso-muted mt-0.5 truncate">{preview || '—'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleDelete(entry.id, e)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-lg text-espresso-muted hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    title="Obriši iz istorije"
                  >
                    <Trash2 size={15} />
                  </button>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-espresso-muted"
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-espresso/8 divide-y divide-espresso/6">
                      {entry.daySummaries.map((day) => (
                        <div key={day.dayIndex} className="px-4 py-3 flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {day.isCatering ? (
                              <Truck size={13} className="text-blue-500" />
                            ) : (
                              <UtensilsCrossed size={13} className="text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-espresso-muted uppercase tracking-wider">
                              {DAY_NAMES[day.dayIndex as DayIndex]}
                            </p>
                            <p className="text-xs text-espresso-muted mt-0.5">
                              {formatDayDate(entry.weekStart, day.dayIndex as DayIndex)}
                            </p>
                            <p className="text-sm font-medium text-espresso mt-1">
                              {day.isCatering
                                ? `Ketering${day.cateringNote ? ` — ${day.cateringNote}` : ''}`
                                : day.mealName ?? '—'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
