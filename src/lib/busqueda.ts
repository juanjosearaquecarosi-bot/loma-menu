import type { Categoria, Item, Negocio, Plato } from '../types'
import { DIAS, almuerzoDe } from './horario'
import { normalizar } from './format'

export interface ResultadoCarta {
  categoria: Categoria
  item: Item
}
export interface ResultadoAlmuerzo {
  /** Dónde aparece: "Todos los días", "Plato de la semana" o el día del plato del día. */
  cuando: string
  plato: Plato
}

export function buscarEnCarta(n: Negocio, consulta: string): ResultadoCarta[] {
  const q = normalizar(consulta)
  if (!q) return []
  const out: ResultadoCarta[] = []
  for (const categoria of n.categorias) {
    for (const item of categoria.items) {
      const texto = normalizar(`${item.nombre} ${item.descripcion ?? ''} ${item.subgrupo ?? ''} ${categoria.nombre}`)
      if (texto.includes(q)) out.push({ categoria, item })
    }
  }
  return out
}

export function buscarEnAlmuerzo(n: Negocio, consulta: string): ResultadoAlmuerzo[] {
  const q = normalizar(consulta)
  if (!q) return []
  const coincide = (p: Plato) => normalizar(`${p.nombre} ${p.detalle ?? ''}`).includes(q)
  const out: ResultadoAlmuerzo[] = []
  const a = n.almuerzo
  for (const p of a.platos_fijos) if (coincide(p)) out.push({ cuando: 'Todos los días', plato: p })
  if (a.cuarto_plato.actual && coincide(a.cuarto_plato.actual)) out.push({ cuando: 'Plato de la semana', plato: a.cuarto_plato.actual })
  for (const d of DIAS) {
    const p = almuerzoDe(a, d.id).platoDelDia
    if (p && coincide(p)) out.push({ cuando: `Plato del día · ${d.largo}`, plato: p })
  }
  return out
}
