import { useState } from 'react'
import { ChevronDown, Truck, UtensilsCrossed, Clock } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useHistory } from '@/hooks/useHistory'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatWeekLabel, formatSlotDates } from '@/lib/dateUtils'
import { SLOT_LABELS } from '@/types'
import type { SlotIndex } from '@/types'

export function IstorijaPage() {
  const history = useHistory(50)
  const [expanded, setExpanded] = useState<string | null>(null)

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

          return (
            <div key={entry.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : entry.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <div>
                  <p className="font-medium text-sm text-espresso">{weekLabel}</p>
                  <p className="text-xs text-espresso-muted mt-0.5">
                    {entry.slotSummaries
                      .filter((s) => !s.isCatering && s.mealName)
                      .map((s) => s.mealName)
                      .join(' · ')}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-espresso-muted ml-2 flex-shrink-0"
                >
                  <ChevronDown size={18} />
                </motion.div>
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
                      {entry.slotSummaries.map((slot) => (
                        <div key={slot.slotIndex} className="px-4 py-3 flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {slot.isCatering ? (
                              <Truck size={13} className="text-blue-500" />
                            ) : (
                              <UtensilsCrossed size={13} className="text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-espresso-muted uppercase tracking-wider">
                              {SLOT_LABELS[slot.slotIndex as SlotIndex]}
                            </p>
                            <p className="text-xs text-espresso-muted mt-0.5">
                              {formatSlotDates(entry.weekStart, slot.slotIndex as SlotIndex)}
                            </p>
                            <p className="text-sm font-medium text-espresso mt-1">
                              {slot.isCatering
                                ? `Ketering${slot.cateringNote ? ` — ${slot.cateringNote}` : ''}`
                                : slot.mealName ?? '—'}
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
