import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  right?: ReactNode
}

export function PageHeader({ title, subtitle, right }: Props) {
  return (
    <div className="bg-bg-surface/80 backdrop-blur-sm sticky top-0 z-30 border-b border-espresso/8 no-print">
      <div className="px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-espresso leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-espresso-muted mt-0.5">{subtitle}</p>}
        </div>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </div>
  )
}
