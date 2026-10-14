import { describe, expect, it } from 'vitest'
import lomaLinda from '../data/loma-linda.json'
import enlaces from '../data/enlaces.json'
import type { Negocio } from '../types'
import { almuerzoDe, diaActual } from './horario'
import { normalizar, numero } from './format'
import { buscarEnAlmuerzo, buscarEnCarta } from './busqueda'

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
