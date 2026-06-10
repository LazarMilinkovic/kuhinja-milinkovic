import { NavLink } from 'react-router-dom'
import { CalendarDays, UtensilsCrossed, Clock, ShoppingCart } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Planer', icon: CalendarDays },
  { to: '/jela', label: 'Jela', icon: UtensilsCrossed },
  { to: '/nabavka', label: 'Nabavka', icon: ShoppingCart },
  { to: '/istorija', label: 'Istorija', icon: Clock },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-espresso/10 safe-bottom no-print">
      <div className="flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-espresso/50',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <div className={[
                  'p-1.5 rounded-xl transition-colors',
                  isActive ? 'bg-primary/10' : '',
                ].join(' ')}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
