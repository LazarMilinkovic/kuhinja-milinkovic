import type { HTMLAttributes } from 'react'
import type { MealCategory, Season } from '@/types'
import { CATEGORY_COLORS, SEASON_ICONS, SEASON_LABELS } from '@/types'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'category' | 'season' | 'duration'
  category?: MealCategory
  season?: Season
  duration?: 1 | 2
}

export function Badge({ variant = 'default', category, season, duration, className = '', children, ...props }: BadgeProps) {
  let content = children
  let colorClass = 'bg-gray-100 text-gray-700'

  if (variant === 'category' && category) {
    colorClass = CATEGORY_COLORS[category]
    content = category
  } else if (variant === 'season' && season) {
    colorClass = 'bg-green-50 text-green-800'
    content = `${SEASON_ICONS[season]} ${SEASON_LABELS[season]}`
  } else if (variant === 'duration') {
    colorClass = duration === 1 ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
    content = duration === 1 ? '1 dan' : '2 dana'
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        colorClass,
        className,
      ].join(' ')}
      {...props}
    >
      {content}
    </span>
  )
}
