import type { Negocio, Paleta, Tema } from '../types'

/**
 * Rotación semanal de temas claro/oscuro (identidad naranja/negra).
 * Semana ISO: si el número de semana es impar se usa el tema oscuro,
 * si es par el claro. Así el local cambia de look cada lunes sin tocar nada.
 */
export function numeroSemanaISO(ahora: Date = new Date()): number {
  const d = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()))
  const dia = d.getUTCDay() || 7 // lunes=1 ... domingo=7
  d.setUTCDate(d.getUTCDate() + 4 - dia) // jueves de esa semana
  const inicioAnio = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - inicioAnio.getTime()) / 86400000 + 1) / 7)
}

/** Devuelve la paleta activa según la semana ISO y forzarTema ('auto'|'claro'|'oscuro'). */
export function paletaActiva(tema: Tema, forzar: 'auto' | 'claro' | 'oscuro' = 'auto', ahora: Date = new Date()): Paleta {
  const claro: Paleta = tema.claro
  const oscuro: Paleta = tema.oscuro

  if (forzar === 'claro') return claro
  if (forzar === 'oscuro') return oscuro

  const semana = numeroSemanaISO(ahora)
  return semana % 2 === 0 ? claro : oscuro
}

/** URL del logo real según la paleta activa (claro -> logo sobre fondo claro). */
export function logoActivo(n: Negocio, activo: Paleta): string {
  const esOscuro = normalizarHex(activo.fondo).luminancia < 0.45
  return esOscuro ? n.logos?.oscuro : n.logos?.claro
}

function normalizarHex(hex: string): { luminancia: number } {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  // Luminancia relativa aproximada (0 = negro, 1 = blanco)
  return { luminancia: (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 }
}
