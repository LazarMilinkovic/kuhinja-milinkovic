import type { MealCategory } from '@/types'
import { ALL_CATEGORIES } from '@/types'

interface Props {
  active: MealCategory | 'Sve'
  onChange: (cat: MealCategory | 'Sve') => void
  counts: Partial<Record<MealCategory | 'Sve', number>>
}

export function CategoryTabs({ active, onChange, counts }: Props) {
  const tabs: (MealCategory | 'Sve')[] = ['Sve', ...ALL_CATEGORIES]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 px-4 pt-3 scrollbar-hide no-print">
      {tabs.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={[
            'flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all',
            active === cat
              ? 'bg-primary text-white shadow-warm'
              : 'bg-white text-espresso-muted border border-espresso/15 hover:border-primary/30',
          ].join(' ')}
        >
          {cat}
          {counts[cat] !== undefined && (
            <span className={[
              'ml-1.5 px-1.5 py-0.5 rounded-full text-xs',
              active === cat ? 'bg-white/20' : 'bg-espresso/8',
            ].join(' ')}>
              {counts[cat]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
