import type { Negocio, Tema, TemaId } from '../types'
import { semanaISO } from './horario'

/**
 * Tema de la semana. En modo 'auto' alterna naranja/negro cada semana ISO:
 * las semanas pares usan `tema_par` y las impares el otro.
 * `forzado` (p. ej. ?tema=negro) sirve para previsualizar sin esperar a la otra semana.
 */
export function elegirTema(n: Negocio, ahora: Date = new Date(), forzado?: string | null): { id: TemaId; tema: Tema } {
  let id: TemaId
  if (forzado === 'naranja' || forzado === 'negro') id = forzado
  else if (n.tema_modo !== 'auto') id = n.tema_modo
  else {
    const par = semanaISO(n.zona_horaria, ahora) % 2 === 0
    const otro: TemaId = n.tema_par === 'naranja' ? 'negro' : 'naranja'
    id = par ? n.tema_par : otro
  }
  return { id, tema: n.temas[id] }
}

export function estiloTema(t: Tema, id: TemaId): React.CSSProperties {
  return {
    '--fondo': t.fondo,
    '--tinta': t.tinta,
    '--titulo': t.titulo,
    '--oscuro': t.oscuro,
    '--claro': t.claro,
    '--acento': t.acento,
    '--sobre-acento': t.sobre_acento,
    '--etiqueta': t.etiqueta,
    colorScheme: id === 'negro' ? 'dark' : 'light',
  } as React.CSSProperties
}

/** Que la barra del navegador móvil combine con el tema de la semana. */
export function aplicarThemeColor(color: string): void {
  let m = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!m) {
    m = document.createElement('meta')
    m.name = 'theme-color'
    document.head.appendChild(m)
  }
  m.content = color
}
