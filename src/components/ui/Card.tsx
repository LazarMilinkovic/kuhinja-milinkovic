import type { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
}

export function Card({ elevated, className = '', children, ...props }: Props) {
  return (
    <div
      className={[
        'bg-white rounded-2xl',
        elevated ? 'shadow-warm-lg' : 'shadow-card',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
