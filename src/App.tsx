import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ToastProvider } from '@/components/ui/Toast'
import { PlanerPage } from '@/pages/PlanerPage'
import { JelaPage } from '@/pages/JelaPage'
import { NabavkaPage } from '@/pages/NabavkaPage'
import { IstorijaPage } from '@/pages/IstorijaPage'

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<PlanerPage />} />
            <Route path="jela" element={<JelaPage />} />
            <Route path="nabavka" element={<NabavkaPage />} />
            <Route path="istorija" element={<IstorijaPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </HashRouter>
  )
}
