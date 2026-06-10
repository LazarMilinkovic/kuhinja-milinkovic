# Kuhinja Milinković — Vodič za razvoj

## Opis projekta

Porodična PWA aplikacija za planiranje nedeljnih ručkova. Generiše random plan za nedelju (Pon–Sub), prati istoriju prethodnih nedelja radi izbegavanja ponavljanja, i prikazuje listu namirnica za nabavku.

## Pokretanje

```bash
npm install       # Jednom, da se instaliraju zavisnosti
npm run dev       # Pokreće lokalni server na http://localhost:5173
npm run build     # Pravi produkcijsku verziju u /dist
```

## Tech Stack

| Alat | Svrha |
|---|---|
| React 18 + TypeScript | Komponente i type safety |
| Vite | Build tool i dev server |
| Tailwind CSS v3 | Stilizovanje |
| React Router v6 (HashRouter) | Navigacija |
| Dexie.js | Lokalna baza podataka (IndexedDB) |
| vite-plugin-pwa | Installable PWA (Android) |
| Framer Motion | Animacije |
| Lucide React | Ikone |
| date-fns | Rad sa datumima |

## Folder Struktura

```
src/
  types/index.ts       — SVE TypeScript interfejse i konstante
  data/seedMeals.ts    — Početna lista 17 porodičnih jela
  db/
    database.ts        — Dexie schema
    seeds.ts           — Punjenje DB pri prvom pokretanju
  lib/
    planGenerator.ts   — Algoritam generisanja nedeljnog plana
    seasonUtils.ts     — getSeason(), isMealAvailable()
    dateUtils.ts       — getWeekStart(), formatWeekLabel() itd.
    idUtils.ts         — newId() — crypto.randomUUID()
  hooks/
    useMeals.ts        — CRUD za jela (useLiveQuery)
    useWeeklyPlan.ts   — Trenutni plan, generisanje, regeneracija
    useHistory.ts      — Lista prethodnih nedelja
    useShoppingList.ts — Izvedena lista namirnica
  components/
    ui/                — Button, Card, Badge, Modal, Toast
    layout/            — AppShell, BottomNav, PageHeader
    planer/            — WeekSlotCard, PickMealModal
    jela/              — MealCard, MealForm, IngredientsEditor, CategoryTabs
  pages/
    PlanerPage.tsx     — Početna (/)
    JelaPage.tsx       — Lista jela (/jela)
    NabavkaPage.tsx    — Nabavka (/nabavka)
    IstorijaPage.tsx   — Istorija (/istorija)
```

## Dodavanje Novog Jela (Kod)

Da bi se dodalo jelo u početne podatke (seed), dodaj objekat u `src/data/seedMeals.ts`:

```typescript
{
  id: 'meal-moje-novo-jelo',       // Jedinstveni ID (snake-case)
  name: 'Moje Novo Jelo',
  category: 'Paprikaši/Variva',    // Jedna od 7 kategorija
  duration: 2,                      // 1 ili 2 dana
  seasons: [],                      // [] = cela godina, ili ['winter', 'summer' itd.]
  notes: '',
  ingredients: [
    { id: 'mnj-1', name: 'Sastojak', quantity: '500g', mealId: 'meal-moje-novo-jelo' },
  ],
}
```

Kategorije: `'Paprikaši/Variva' | 'Punjeno' | 'Sarmica' | 'Musaka' | 'Ćufte' | 'Testenina' | 'Meso'`

Sezone: `'spring' | 'summer' | 'autumn' | 'winter'`

## Dodavanje Nove Kategorije

1. U `src/types/index.ts` dodaj kategoriju u `MealCategory` union
2. Dodaj boju u `CATEGORY_COLORS`
3. Dodaj u `ALL_CATEGORIES` niz

## Dizajn Sistem

Boje (Tailwind klase):
- `text-primary` / `bg-primary` — terakota #E87A4D
- `text-espresso` — tamno braon #3D2B1F
- `text-espresso-muted` — muted braon
- `bg-bg` — krem pozadina #FFF8F0
- `bg-sage` — žalfija zelena
- `shadow-warm`, `shadow-card` — tople senke

Font naslova: `font-serif` (Playfair Display)
Font teksta: `font-sans` (Inter)

## Algoritam Generisanja

Fajl: `src/lib/planGenerator.ts`

1. Odredi sezonu po trenutnom mesecu (mart–maj = proleće itd.)
2. Uzmi ID-ove jela iz poslednje 2 nedelje istorije
3. Filtriraj jela: duration=2, dostupna u sezoni, nisu korišćena nedavno
4. Shuffle (Fisher-Yates), dodeli po 1 jelo po slotu (0=Pon–Uto, 1=Sre–Čet, 2=Pet–Sub)
5. Kategorija-diversity: posle izbora, ukloni istu kategoriju iz kandidata
6. Fallback: ako nema kandidata, relaksiraj recency ograničenje

Napomena: Jela sa `duration=1` (Šnicle) se NE generišu automatski — korisnik ih ručno dodeljuje slotu.

## Deployment na GitHub Pages (Android PWA)

```bash
# 1. Napravi besplatan nalog na github.com
# 2. Napravi novi repozitorijum (npr. "kuhinja-milinkovic")
# 3. Lokalno:
git init
git add .
git commit -m "Inicijalni commit"
git remote add origin https://github.com/TVOJE_IME/kuhinja-milinkovic.git
git push -u origin main

# GitHub Actions automatski deploy (fajl: .github/workflows/deploy.yml)
# Posle push-a, aplikacija je na: https://TVOJE_IME.github.io/kuhinja-milinkovic/
```

Na Xiaomi telefonu:
1. Otvori URL u Chrome
2. Meni (3 tačke) → "Dodaj na početni ekran"
3. Aplikacija se instalira kao native app

## Baza Podataka

IndexedDB (Dexie.js), čuva se lokalno na uređaju. Tablice:
- `meals` — sva jela porodice
- `weeklyPlans` — nedeljni planovi (current i arhiva)
- `history` — snapshot prethodnih nedelja

Da bi se resetovao DB tokom razvoja: Chrome DevTools → Application → Storage → Clear site data.
