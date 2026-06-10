import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { runSeeds } from './db/seeds.ts'

runSeeds().catch(console.error)

createRoot(document.getElementById('root')!).render(<App />)
