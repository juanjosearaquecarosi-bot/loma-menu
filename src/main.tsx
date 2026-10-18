import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
import '@fontsource-variable/dm-sans'
import './styles.css'
import { MenuPage } from './pages/MenuPage'
import { QRRedirect } from './pages/QRRedirect'
import { AdminPage } from './pages/AdminPage'
import { NoEncontrado } from './pages/NoEncontrado'
import { listarSlugs } from './lib/repo'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/m/${listarSlugs()[0]}`} replace />} />
        <Route path="/m/:slug" element={<MenuPage />} />
        <Route path="/m/:slug/admin" element={<AdminPage />} />
        <Route path="/q/:codigo" element={<QRRedirect />} />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
