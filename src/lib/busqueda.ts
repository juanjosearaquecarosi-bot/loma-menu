import type { Categoria, Item, Negocio, Plato } from '../types'
import { DIAS, almuerzoDe } from './horario'
import { normalizar } from './format'

export interface ResultadoCarta {
  categoria: Categoria
  item: Item
}
export interface ResultadoAlmuerzo {
  dia: string
  plato: Plato
}

export function buscarEnCarta(n: Negocio, consulta: string): ResultadoCarta[] {
  const q = normalizar(consulta)
  if (!q) return []
  const out: ResultadoCarta[] = []
  for (const categoria of n.categorias) {
    for (const item of categoria.items) {
      const texto = normalizar(`${item.nombre} ${item.descripcion ?? ''} ${categoria.nombre}`)
      if (texto.includes(q)) out.push({ categoria, item })
    }
  }
  return out
}

export function buscarEnAlmuerzo(n: Negocio, consulta: string): ResultadoAlmuerzo[] {
  const q = normalizar(consulta)
  if (!q) return []
  const out: ResultadoAlmuerzo[] = []
  for (const d of DIAS) {
    const a = almuerzoDe(n.almuerzo, d.id)
    const platos = [...a.fijos, a.rotativo, a.platoDelDia].filter((p): p is Plato => !!p)
    const vistos = new Set<string>()
    for (const p of platos) {
      if (normalizar(`${p.nombre} ${p.detalle ?? ''}`).includes(q) && !vistos.has(p.nombre)) {
        vistos.add(p.nombre)
        out.push({ dia: d.largo, plato: p })
      }
    }
  }
  return out
}
