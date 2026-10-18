import type { Categoria, Item, Negocio } from '../types'
import { numero, numeroMiles } from '../lib/format'

/** El carrito solo admite ítems con precio único (no versiones por tamaño). */
export interface LineaCarrito {
  item: Item
  categoria: Categoria
  cantidad: number
}

export type Carrito = Record<string, LineaCarrito>

/** Determina si un ítem es "pedible" (precio único definido). */
export function esPedible(item: Item): boolean {
  return typeof item.precio === 'number'
}

/** Moneda que se muestra para el ítem (hereda la de la categoría si tiene una). */
export function monedaDeItem(n: Negocio, c: Categoria, item: Item): string {
  return item.moneda ?? c.moneda ?? n.moneda
}

export function agregar(car: Carrito, c: Categoria, item: Item): Carrito {
  const previa = car[item.id]
  return { ...car, [item.id]: { item, categoria: c, cantidad: (previa?.cantidad ?? 0) + 1 } }
}

export function quitar(car: Carrito, id: string): Carrito {
  const linea = car[id]
  if (!linea) return car
  if (linea.cantidad <= 1) {
    const copia = { ...car }
    delete copia[id]
    return copia
  }
  return { ...car, [id]: { ...linea, cantidad: linea.cantidad - 1 } }
}

export function eliminar(car: Carrito, id: string): Carrito {
  const copia = { ...car }
  delete copia[id]
  return copia
}

export function vaciar(): Carrito {
  return {}
}

export function totalItems(car: Carrito): number {
  return Object.values(car).reduce((s, l) => s + l.cantidad, 0)
}

export function totalMonto(car: Carrito): number {
  return Object.values(car).reduce((s, l) => s + l.cantidad * (l.item.precio ?? 0), 0)
}

/**
 * Mensaje de WhatsApp organizado:
 *   1 x Carne mechada — $4.000
 *   1 x Latte (Pequeño) — €2
 *   Total: ...
 */
export function mensajePedido(n: Negocio, car: Carrito, nota?: string): string {
  const lineas: string[] = [`*Pedido · ${n.nombre}*`, '']
  const lineasItem = Object.values(car).map(l => {
    const m = monedaDeItem(n, l.categoria, l.item)
    const precioFmt = m === n.moneda_pesos ? numeroMiles(l.item.precio!) : numero(l.item.precio!)
    return `${l.cantidad} × ${l.item.nombre} — ${m}${precioFmt}`
  })
  lineas.push(...lineasItem)

  // Agrupar los totales por moneda (por si hay mezcla € / $).
  const porMoneda = new Map<string, number>()
  for (const l of Object.values(car)) {
    const m = monedaDeItem(n, l.categoria, l.item)
    porMoneda.set(m, (porMoneda.get(m) ?? 0) + l.cantidad * (l.item.precio ?? 0))
  }
  lineas.push('')
  for (const [m, t] of porMoneda) {
    const fmt = m === n.moneda_pesos ? numeroMiles(t) : numero(t)
    lineas.push(`*Total:* ${m}${fmt}`)
  }

  if (nota?.trim()) {
    lineas.push('', `Nota: ${nota.trim()}`)
  }
  return lineas.join('\n')
}

export function linkWhatsApp(numero: string, mensaje: string): string {
  return `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`
}
