import type { Negocio } from '../types'

const CLAVE = (slug: string) => `admin-borrador-${slug}`

/** Lee el borrador guardado en localStorage (o null si no existe / está corrupto). */
export function cargarBorrador(slug: string): Negocio | null {
  try {
    const crudo = localStorage.getItem(CLAVE(slug))
    return crudo ? (JSON.parse(crudo) as Negocio) : null
  } catch {
    return null
  }
}

/** Guarda el borrador en localStorage. */
export function guardarBorrador(n: Negocio): void {
  localStorage.setItem(CLAVE(n.slug), JSON.stringify(n))
}

/** Borra el borrador (volver a los datos originales). */
export function borrarBorrador(slug: string): void {
  localStorage.removeItem(CLAVE(slug))
}

/** Descarga el JSON final para reemplazar src/data/<slug>.json en el repo. */
export function descargar(n: Negocio): void {
  const blob = new Blob([JSON.stringify(n, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${n.slug}.json`
  a.click()
  URL.revokeObjectURL(url)
}
