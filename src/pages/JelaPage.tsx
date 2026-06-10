import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useMeals, addMeal, updateMeal, deleteMeal } from '@/hooks/useMeals'
import { PageHeader } from '@/components/layout/PageHeader'
import { CategoryTabs } from '@/components/jela/CategoryTabs'
import { MealCard } from '@/components/jela/MealCard'
import { MealForm } from '@/components/jela/MealForm'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { Meal, MealCategory } from '@/types'

export function JelaPage() {
  const meals = useMeals()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<MealCategory | 'Sve'>('Sve')
  const [formOpen, setFormOpen] = useState(false)
  const [editMeal, setEditMeal] = useState<Meal | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<Meal | null>(null)

  const filtered = meals.filter((m) => {
    const matchCat = activeCategory === 'Sve' || m.category === activeCategory
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const counts: Partial<Record<MealCategory | 'Sve', number>> = {
    Sve: meals.length,
  }
  for (const m of meals) {
    counts[m.category] = (counts[m.category] ?? 0) + 1
  }

  async function handleSave(data: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editMeal) {
      await updateMeal(editMeal.id, data)
      toast('Jelo ažurirano')
    } else {
      await addMeal(data)
      toast('Jelo dodato')
    }
    setEditMeal(undefined)
  }

  async function handleDelete(meal: Meal) {
    await deleteMeal(meal.id)
    setDeleteConfirm(null)
    toast('Jelo obrisano')
  }

  return (
    <div>
      <PageHeader
        title="Naša Jela"
        subtitle={`${meals.length} jela u listi`}
        right={
          <Button size="sm" onClick={() => { setEditMeal(undefined); setFormOpen(true) }}>
            <Plus size={16} />
            Dodaj
          </Button>
        }
      />

      <CategoryTabs
        active={activeCategory}
        onChange={setActiveCategory}
        counts={counts}
      />

      {/* Search */}
      <div className="px-4 pt-3 pb-1">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-espresso/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
      </div>

      <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
        {filtered.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onEdit={() => { setEditMeal(meal); setFormOpen(true) }}
            onDelete={() => setDeleteConfirm(meal)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-espresso-muted">
            <p className="text-sm">Nema jela</p>
          </div>
        )}
      </div>

      <MealForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditMeal(undefined) }}
        meal={editMeal}
        onSave={handleSave}
      />

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-warm-lg z-10">
            <h3 className="font-serif text-lg font-semibold text-espresso mb-2">Obriši jelo?</h3>
            <p className="text-sm text-espresso-muted mb-5">
              „{deleteConfirm.name}" će biti trajno obrisano.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                Otkaži
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => handleDelete(deleteConfirm)}>
                Obriši
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
