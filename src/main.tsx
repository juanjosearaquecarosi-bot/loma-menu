import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import '@fontsource-variable/archivo/wdth.css'
import './styles.css'
import { MenuPage } from './pages/MenuPage'
import { BienvenidaPage } from './pages/BienvenidaPage'
import { QRRedirect } from './pages/QRRedirect'
import { NoEncontrado } from './pages/NoEncontrado'
import { listarSlugs } from './lib/repo'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/b/${listarSlugs()[0]}`} replace />} />
        <Route path="/b/:slug" element={<BienvenidaPage />} />
        <Route path="/m/:slug" element={<MenuPage />} />
        <Route path="/q/:codigo" element={<QRRedirect />} />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
