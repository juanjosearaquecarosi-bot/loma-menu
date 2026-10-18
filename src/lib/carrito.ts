import { precio } from './format'

export interface Linea {
  clave: string
  nombre: string
  variante?: string
  precio: number
  moneda: string
  cantidad: number
}

export type TipoPedido = 'delivery' | 'retiro'

export interface DatosPedido {
  tipo: TipoPedido
  nombre: string
  direccion: string
  notas: string
}

const r2 = (n: number) => Math.round(n * 100) / 100
export const MAX_CANTIDAD = 20

export function agregar(lineas: Linea[], nueva: Omit<Linea, 'cantidad'>): Linea[] {
  const i = lineas.findIndex((l) => l.clave === nueva.clave)
  if (i === -1) return [...lineas, { ...nueva, cantidad: 1 }]
  return lineas.map((l, j) => (j === i ? { ...l, cantidad: Math.min(MAX_CANTIDAD, l.cantidad + 1) } : l))
}

export function cambiarCantidad(lineas: Linea[], clave: string, delta: number): Linea[] {
  return lineas
    .map((l) => (l.clave === clave ? { ...l, cantidad: Math.min(MAX_CANTIDAD, l.cantidad + delta) } : l))
    .filter((l) => l.cantidad > 0)
}

export function cantidadTotal(lineas: Linea[]): number {
  return lineas.reduce((s, l) => s + l.cantidad, 0)
}

/** Totales por moneda: el menú mezcla € y COP y no se pueden sumar entre sí. La moneda principal va primero. */
export function totales(lineas: Linea[], monedaPrincipal: string): { moneda: string; total: number }[] {
  const m = new Map<string, number>()
  for (const l of lineas) m.set(l.moneda, r2((m.get(l.moneda) ?? 0) + l.precio * l.cantidad))
  return [...m.entries()]
    .map(([moneda, total]) => ({ moneda, total }))
    .sort((a, b) => (a.moneda === monedaPrincipal ? -1 : b.moneda === monedaPrincipal ? 1 : 0))
}

export function totalTexto(lineas: Linea[], monedaPrincipal: string): string {
  return totales(lineas, monedaPrincipal)
    .map((t) => precio(t.total, t.moneda))
    .join(' + ')
}

export function validarPedido(lineas: Linea[], d: DatosPedido): string | null {
  if (!lineas.length) return 'Agrega al menos un producto.'
  if (!d.nombre.trim()) return 'Escribe tu nombre.'
  if (d.tipo === 'delivery' && !d.direccion.trim()) return 'Escribe la dirección de entrega.'
  return null
}

/** Quita saltos de línea y caracteres de control de lo que escribió el cliente. */
const limpio = (s: string, max: number) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max)

export function armarMensaje(nombreNegocio: string, monedaPrincipal: string, lineas: Linea[], d: DatosPedido): string {
  const filas = lineas.map((l) => {
    const nom = l.variante ? `${l.nombre} (${l.variante})` : l.nombre
    return `• ${l.cantidad} × ${nom} — ${precio(r2(l.precio * l.cantidad), l.moneda)}`
  })
  const out = [`Hola ${nombreNegocio}, quiero hacer un pedido:`, '', ...filas, '', `Total: ${totalTexto(lineas, monedaPrincipal)}`, '']
  out.push(`Tipo: ${d.tipo === 'delivery' ? 'Delivery' : 'Retiro en el local'}`)
  out.push(`Nombre: ${limpio(d.nombre, 60)}`)
  if (d.tipo === 'delivery') out.push(`Dirección: ${limpio(d.direccion, 160)}`)
  if (d.notas.trim()) out.push(`Notas: ${limpio(d.notas, 300)}`)
  return out.join('\n')
}
