import { describe, expect, it } from 'vitest'
import lomaLinda from '../data/loma-linda.json'
import enlaces from '../data/enlaces.json'
import type { Negocio } from '../types'
import { almuerzoDe, diaActual } from './horario'
import { normalizar, numero, numeroMiles } from './format'
import { buscarEnAlmuerzo, buscarEnCarta } from './busqueda'
import { numeroSemanaISO, paletaActiva } from './tema'
import { agregar, mensajePedido, quitar, totalItems, totalMonto, vaciar, type Carrito } from './carrito'

const n = lomaLinda as unknown as Negocio

describe('horario (America/Caracas)', () => {
  it('usa el día de Caracas, no el de UTC', () => {
    // 01:30 UTC del martes 13 = 21:30 del lunes 12 en Caracas (UTC-4)
    expect(diaActual('America/Caracas', new Date('2026-10-13T01:30:00Z'))).toBe('lunes')
    expect(diaActual('America/Caracas', new Date('2026-10-13T12:00:00Z'))).toBe('martes')
  })
  it('domingo no tiene servicio de almuerzo', () => {
    expect(almuerzoDe(n.almuerzo, 'domingo').servicio).toBe(false)
  })
  it('sábado: 3 fijos, sin rotativo', () => {
    const s = almuerzoDe(n.almuerzo, 'sabado')
    expect(s.fijos).toHaveLength(3)
    expect(s.rotativo).toBeNull()
  })
  it('lunes del set A es Gordon Blue y plato del día Alas de pollo en BBQ', () => {
    const l = almuerzoDe(n.almuerzo, 'lunes')
    expect(l.rotativo?.nombre).toBe('Gordon Blue')
    expect(l.platoDelDia?.nombre).toBe('Alas de pollo en BBQ')
  })
})

describe('formato de miles (pesos)', () => {
  it('separa los miles con punto', () => {
    expect(numeroMiles(4000)).toBe('4.000')
    expect(numeroMiles(3000)).toBe('3.000')
    expect(numeroMiles(15000)).toBe('15.000')
    expect(numeroMiles(500)).toBe('500')
  })
})

describe('tema semanal (claro / oscuro)', () => {
  it('número de semana ISO es estable en fechas conocidas', () => {
    // 2026-01-01 cae en la semana 1; 2026-10-18 en la semana 42
    expect(numeroSemanaISO(new Date('2026-01-01'))).toBe(1)
    expect(numeroSemanaISO(new Date('2026-10-18'))).toBe(42)
  })
  it('alterna entre claro y oscuro según la semana', () => {
    const par = paletaActiva(n.tema, 'auto', new Date('2026-10-18')) // semana 42 → claro
    const impar = paletaActiva(n.tema, 'auto', new Date('2026-10-11')) // semana 41 → oscuro
    expect(par.fondo).toBe(n.tema.claro!.fondo)
    expect(impar.fondo).toBe(n.tema.oscuro!.fondo)
  })
  it('forzar tema omite la rotación', () => {
    expect(paletaActiva(n.tema, 'oscuro', new Date('2026-10-18')).fondo).toBe(n.tema.oscuro!.fondo)
  })
})

describe('carrito', () => {
  const pasta = n.categorias.find(c => c.id === 'empanadas')!
  const emp = pasta.items[0]

  it('agrega, suma y quita', () => {
    let car: Carrito = vaciar()
    car = agregar(car, pasta, emp)
    car = agregar(car, pasta, emp)
    expect(totalItems(car)).toBe(2)
    expect(totalMonto(car)).toBe(8000)
    car = quitar(car, emp.id)
    expect(totalItems(car)).toBe(1)
    car = quitar(car, emp.id)
    expect(totalItems(car)).toBe(0)
  })

  it('mensaje de WhatsApp lleva nombre, cantidad y total formateado en miles', () => {
    let car: Carrito = vaciar()
    car = agregar(car, pasta, emp)
    const msg = mensajePedido(n, car, 'sin cebolla')
    expect(msg).toContain('Pedido · Loma Linda')
    expect(msg).toContain('1 × Carne mechada — $4.000')
    expect(msg).toContain('*Total:* $4.000')
    expect(msg).toContain('Nota: sin cebolla')
  })
})

describe('secciones nuevas', () => {
  it('hay empanadas y pasteles en pesos', () => {
    const empanadas = n.categorias.find(c => c.id === 'empanadas')
    const pasteles = n.categorias.find(c => c.id === 'pasteles')
    expect(empanadas?.items.map(i => i.nombre)).toEqual(['Carne mechada', 'Pollo', 'Mixta'])
    expect(pasteles?.items.map(i => i.precio)).toEqual([3000, 3000, 3000, 3000, 3000, 3000, 4000])
    expect(empanadas?.items.every(i => i.precio === 4000)).toBe(true)
  })

  it('los precios de la carta en euros no cambiaron vs. el BPM de referencia', () => {
    const cafes = n.categorias.find(c => c.id === 'cafes')!
    expect(cafes.items.find(i => i.id === 'americano')!.precios).toEqual({ pequeno: 2, mediano: 3, grande: 4, extragrande: 4.5 })
    const hb = n.categorias.find(c => c.id === 'hamburguesas')!
    expect(hb.items.find(i => i.id === 'hb-especial')!.precio).toBe(8.5)
  })
})

describe('formato', () => {
  it('respeta la coma decimal del menú impreso', () => {
    expect(numero(4.5)).toBe('4,5')
    expect(numero(6)).toBe('6')
    expect(numero(15.5)).toBe('15,5')
  })
  it('normaliza tildes', () => {
    expect(normalizar('Pabellón CRIOLLO')).toBe('pabellon criollo')
  })
})

describe('búsqueda', () => {
  it('encuentra sin tildes', () => {
    expect(buscarEnCarta(n, 'pizza').length).toBeGreaterThan(5)
    expect(buscarEnCarta(n, 'tequenos').map((r) => r.item.id)).toContain('ex-tequenos')
    expect(buscarEnAlmuerzo(n, 'pabellon').length).toBeGreaterThan(0)
  })
  it('consulta vacía no devuelve nada', () => {
    expect(buscarEnCarta(n, '  ')).toHaveLength(0)
  })
})

describe('integridad de datos', () => {
  const items = n.categorias.flatMap((c) => c.items.map((i) => ({ c, i })))

  it('ids únicos', () => {
    const ids = items.map(({ i }) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('precios numéricos y positivos', () => {
    for (const { i } of items) {
      if (typeof i.precio === 'number') expect(i.precio).toBeGreaterThan(0)
      for (const v of Object.values(i.precios ?? {})) if (v != null) expect(v).toBeGreaterThan(0)
    }
  })
  it('las columnas usadas existen en la categoría', () => {
    for (const { c, i } of items) {
      for (const k of Object.keys(i.precios ?? {})) expect(c.columnas?.map((x) => x.id)).toContain(k)
    }
  })
  it('cada ítem tiene precio, precios o queda marcado como sin precio', () => {
    for (const { i } of items) expect(i.precio !== undefined || i.precios !== undefined).toBe(true)
  })
  it('set activo existe', () => {
    expect(Object.keys(n.almuerzo.rotaciones)).toContain(n.almuerzo.set_activo)
  })
  it('enlaces QR apuntan a negocios existentes', () => {
    for (const e of enlaces) expect(e.slug).toBe(n.slug)
  })
})
