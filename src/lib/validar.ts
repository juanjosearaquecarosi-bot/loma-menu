import type { Negocio } from '../types'

const HEX = /^#[0-9a-f]{6}$/i
const esTexto = (x: unknown): x is string => typeof x === 'string'
const esPrecio = (x: unknown) => x === null || x === undefined || (typeof x === 'number' && Number.isFinite(x) && x >= 0)

/**
 * Revisa que un documento de menú tenga la forma que la interfaz espera. Se usa al leer de la nube
 * (si falla, se usa la copia incluida en el código en vez de dejar la página en blanco) y antes de publicar
 * desde el panel (se bloquea la publicación y se explica el problema). Devuelve la lista de problemas.
 */
export function validarNegocio(x: unknown): string[] {
  const e: string[] = []
  const n = x as Negocio
  if (!n || typeof n !== 'object') return ['El documento no es un objeto']
  if (!esTexto(n.slug) || !/^[a-z0-9-]{1,60}$/.test(n.slug)) e.push('slug inválido')
  if (!esTexto(n.nombre) || !n.nombre.trim()) e.push('Falta el nombre del negocio')
  for (const k of ['subtitulo', 'lema', 'ciudad_frase', 'moneda', 'zona_horaria'] as const) if (!esTexto(n[k])) e.push(`Campo "${k}" inválido`)
  if (!n.temas || !n.temas.naranja || !n.temas.negro) e.push('Faltan los temas')
  else for (const [id, t] of Object.entries(n.temas)) for (const [c, v] of Object.entries(t)) if (!HEX.test(String(v))) e.push(`Color inválido en tema ${id}: ${c}`)
  if (!['auto', 'naranja', 'negro'].includes(n.tema_modo) || !['naranja', 'negro'].includes(n.tema_par)) e.push('Modo de tema inválido')
  if (!n.enlaces || typeof n.enlaces !== 'object') e.push('Faltan los enlaces')
  else if (n.enlaces.pagos && !Array.isArray(n.enlaces.pagos)) e.push('Pagos inválidos')
  const a = n.almuerzo
  if (!a || !Array.isArray(a.incluye) || !Array.isArray(a.platos_fijos) || !a.cuarto_plato || !Array.isArray(a.cuarto_plato.catalogo) || !a.plato_del_dia || !Array.isArray(a.dias_sin_servicio)) e.push('Sección de almuerzo incompleta')
  if (!Array.isArray(n.categorias)) e.push('Faltan las categorías')
  else {
    const ids = new Set<string>()
    for (const c of n.categorias) {
      if (!c || !esTexto(c.id) || !Array.isArray(c.items)) {
        e.push('Una categoría está dañada')
        continue
      }
      if (ids.has(c.id)) e.push(`Categoría repetida: ${c.id}`)
      ids.add(c.id)
      if (!esTexto(c.nombre) || !c.nombre.trim()) e.push('Hay una categoría sin título')
      if (!['cafe', 'comida', 'desayuno'].includes(c.grupo)) e.push(`Tipo inválido en "${c.nombre}"`)
      const iids = new Set<string>()
      for (const it of c.items) {
        if (!it || !esTexto(it.id) || !esTexto(it.nombre)) {
          e.push(`Un producto de "${c.nombre}" está dañado`)
          continue
        }
        if (!it.nombre.trim()) e.push(`Hay un producto sin nombre en "${c.nombre}"`)
        if (iids.has(it.id)) e.push(`Producto repetido en "${c.nombre}": ${it.id}`)
        iids.add(it.id)
        if (!esPrecio(it.precio)) e.push(`Precio inválido: ${it.nombre}`)
        if (it.precios && Object.values(it.precios).some((p) => !esPrecio(p))) e.push(`Precio inválido: ${it.nombre}`)
      }
    }
  }
  return e
}
