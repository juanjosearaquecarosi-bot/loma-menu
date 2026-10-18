import { describe, expect, it } from 'vitest'
import lomaLinda from '../data/loma-linda.json'
import enlaces from '../data/enlaces.json'
import type { Negocio } from '../types'
import { almuerzoDe, diaActual, semanaISO } from './horario'
import { normalizar, numero, precio } from './format'
import { buscarEnAlmuerzo, buscarEnCarta } from './busqueda'
import { elegirTema } from './tema'
import { instagramUrl, urlSegura, waUrl, wifiPayload } from './contacto'
import { agregar, armarMensaje, cambiarCantidad, cantidadTotal, totales, validarPedido, type DatosPedido, type Linea } from './carrito'

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
  it('sábado: 3 fijos y sin plato del día', () => {
    const s = almuerzoDe(n.almuerzo, 'sabado')
    expect(s.fijos).toHaveLength(3)
    expect(s.platoDelDia).toBeNull()
  })
  it('plato del día fijo por día de la semana', () => {
    expect(almuerzoDe(n.almuerzo, 'lunes').platoDelDia?.nombre).toBe('Alas de pollo en BBQ')
    expect(almuerzoDe(n.almuerzo, 'viernes').platoDelDia?.nombre).toBe('Croqueta de carne')
  })
  it('el cuarto plato es el mismo toda la semana', () => {
    const a = { ...n.almuerzo, cuarto_plato: { ...n.almuerzo.cuarto_plato, actual: { nombre: 'Pasticho' } } }
    for (const d of ['lunes', 'miercoles', 'viernes'] as const) expect(almuerzoDe(a, d).cuartoPlato?.nombre).toBe('Pasticho')
  })
  it('semana ISO: casos de borde', () => {
    expect(semanaISO('America/Caracas', new Date('2026-01-01T12:00:00Z'))).toBe(1) // jueves
    expect(semanaISO('America/Caracas', new Date('2026-12-31T12:00:00Z'))).toBe(53) // 2026 tiene 53 semanas ISO
    expect(semanaISO('America/Caracas', new Date('2027-01-01T12:00:00Z'))).toBe(53) // viernes, aún semana 53 de 2026
    expect(semanaISO('America/Caracas', new Date('2027-01-04T12:00:00Z'))).toBe(1)
  })
  it('la semana cambia el lunes en hora de Caracas, no en UTC', () => {
    // domingo 18 oct 21:00 Caracas = lunes 19 01:00 UTC -> sigue siendo la semana del domingo
    const dom = semanaISO('America/Caracas', new Date('2026-10-19T01:00:00Z'))
    const lun = semanaISO('America/Caracas', new Date('2026-10-19T05:00:00Z'))
    expect(lun).toBe(dom + 1)
  })
})

describe('tema semanal naranja/negro', () => {
  it('alterna cada semana en modo auto', () => {
    const sem1 = new Date('2026-10-14T15:00:00Z') // semana 42 (par)
    const sem2 = new Date('2026-10-21T15:00:00Z') // semana 43 (impar)
    const a = elegirTema(n, sem1).id
    const b = elegirTema(n, sem2).id
    expect(a).not.toBe(b)
    expect(a).toBe('naranja') // tema_par = naranja y la 42 es par
  })
  it('un modo fijo ignora la semana y ?tema= lo anula', () => {
    expect(elegirTema({ ...n, tema_modo: 'negro' }, new Date('2026-10-14T15:00:00Z')).id).toBe('negro')
    expect(elegirTema(n, new Date('2026-10-14T15:00:00Z'), 'negro').id).toBe('negro')
    expect(elegirTema(n, new Date('2026-10-14T15:00:00Z'), 'basura').id).toBe('naranja')
  })
})

describe('formato', () => {
  it('respeta la coma decimal del menú impreso y los miles con punto', () => {
    expect(numero(4.5)).toBe('4,5')
    expect(numero(6)).toBe('6')
    expect(numero(15.5)).toBe('15,5')
    expect(numero(4000)).toBe('4.000')
    expect(numero(1234567.5)).toBe('1.234.567,5')
  })
  it('códigos de moneda llevan espacio, símbolos no', () => {
    expect(precio(4.5, '€')).toBe('€4,5')
    expect(precio(4000, 'COP')).toBe('COP 4.000')
  })
  it('normaliza tildes', () => {
    expect(normalizar('Pabellón CRIOLLO')).toBe('pabellon criollo')
  })
})

describe('búsqueda', () => {
  it('encuentra sin tildes', () => {
    expect(buscarEnCarta(n, 'pizza').length).toBeGreaterThan(5)
    expect(buscarEnCarta(n, 'tequenos').map((r) => r.item.id)).toContain('ex-tequenos')
  })
  it('encuentra empanadas y pasteles por su subgrupo', () => {
    expect(buscarEnCarta(n, 'empanada').map((r) => r.item.id)).toEqual(expect.arrayContaining(['des-emp-carne', 'des-emp-pollo', 'des-emp-mixta']))
    // "pastel" también coincide con la categoría "Pastelería" (5 ítems), eso es esperado
    expect(buscarEnCarta(n, 'pastel').filter((r) => r.categoria.id === 'desayunos')).toHaveLength(7)
  })
  it('almuerzo: platos fijos y plato del día', () => {
    expect(buscarEnAlmuerzo(n, 'bistec')[0].cuando).toBe('Todos los días')
    expect(buscarEnAlmuerzo(n, 'croqueta')[0].cuando).toContain('Viernes')
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
  it('desayunos: 3 empanadas a 4.000 y 7 pasteles (6 a 3.000 y 1 a 4.000), todo en COP', () => {
    const d = n.categorias.find((c) => c.id === 'desayunos')!
    const emp = d.items.filter((i) => i.subgrupo === 'Empanadas')
    const pas = d.items.filter((i) => i.subgrupo === 'Pasteles')
    expect(emp).toHaveLength(3)
    expect(emp.every((i) => i.precio === 4000)).toBe(true)
    expect(pas).toHaveLength(7)
    expect(pas.filter((i) => i.precio === 3000)).toHaveLength(6)
    expect(pas.filter((i) => i.precio === 4000).map((i) => i.nombre)).toEqual(['Tocineta, pollo y maíz'])
    expect(d.items.every((i) => i.moneda === 'COP')).toBe(true)
  })
  it('los dos temas definen todos los colores', () => {
    for (const t of Object.values(n.temas)) for (const v of Object.values(t)) expect(v).toMatch(/^#[0-9a-f]{6}$/i)
  })
  it('enlaces QR apuntan a negocios existentes', () => {
    for (const e of enlaces) expect(e.slug).toBe(n.slug)
  })
  it('no hay datos de contacto inventados', () => {
    expect(n.enlaces.whatsapp).toBeUndefined()
    expect(n.enlaces.instagram).toBeUndefined()
    expect(n.enlaces.wifi).toBeUndefined()
    expect(n.logo).toBeUndefined()
  })
})

describe('contacto', () => {
  it('WhatsApp: solo dígitos y mensaje codificado', () => {
    expect(waUrl('+58 (414) 123-4567', 'Hola & ¿qué tal?')).toBe('https://wa.me/584141234567?text=Hola%20%26%20%C2%BFqu%C3%A9%20tal%3F')
    expect(waUrl('123')).toBeNull()
  })
  it('Instagram: acepta @usuario y URL de instagram.com, rechaza el resto', () => {
    expect(instagramUrl('@loma.linda')).toBe('https://instagram.com/loma.linda')
    expect(instagramUrl('https://www.instagram.com/loma.linda/')).toBe('https://www.instagram.com/loma.linda/')
    expect(instagramUrl('https://evil.com/instagram.com')).toBeNull()
    expect(instagramUrl('javascript:alert(1)')).toBeNull()
    expect(instagramUrl('no válido!')).toBeNull()
  })
  it('urlSegura rechaza esquemas peligrosos', () => {
    expect(urlSegura('javascript:alert(1)')).toBeNull()
    expect(urlSegura('https://g.page/r/abc')).toBe('https://g.page/r/abc')
  })
  it('QR de Wi-Fi escapa caracteres especiales', () => {
    expect(wifiPayload({ red: 'Mi;Red', clave: 'a:b"c\\d,e' })).toBe('WIFI:T:WPA;S:Mi\\;Red;P:a\\:b\\"c\\\\d\\,e;;')
    expect(wifiPayload({ red: 'Abierta', clave: '', seguridad: 'nopass' })).toBe('WIFI:T:nopass;S:Abierta;;')
  })
})

describe('carrito', () => {
  const latte: Omit<Linea, 'cantidad'> = { clave: 'latte|grande', nombre: 'Latte', variante: 'Grande', precio: 4, moneda: '€' }
  const pastel: Omit<Linea, 'cantidad'> = { clave: 'des-pas-queso', nombre: 'Queso', variante: 'Pasteles', precio: 3000, moneda: 'COP' }
  const datos: DatosPedido = { tipo: 'delivery', nombre: 'Ana', direccion: 'Calle 1', notas: '' }

  it('suma cantidades y quita al llegar a 0', () => {
    let l = agregar([], latte)
    l = agregar(l, latte)
    expect(l).toHaveLength(1)
    expect(cantidadTotal(l)).toBe(2)
    l = cambiarCantidad(l, latte.clave, -2)
    expect(l).toHaveLength(0)
  })
  it('no sube de 20 unidades por línea', () => {
    let l: Linea[] = []
    for (let i = 0; i < 30; i++) l = agregar(l, latte)
    expect(l[0].cantidad).toBe(20)
  })
  it('totales por moneda, sin mezclar € con COP y sin errores de punto flotante', () => {
    let l = agregar([], { ...latte, precio: 4.5 })
    l = agregar(agregar(l, { ...latte, precio: 4.5 }), { ...latte, precio: 4.5 })
    l = agregar(agregar(l, pastel), pastel)
    expect(totales(l, '€')).toEqual([
      { moneda: '€', total: 13.5 },
      { moneda: 'COP', total: 6000 },
    ])
  })
  it('valida nombre y dirección (solo en delivery)', () => {
    const l = agregar([], latte)
    expect(validarPedido([], datos)).toMatch(/producto/)
    expect(validarPedido(l, { ...datos, nombre: ' ' })).toMatch(/nombre/)
    expect(validarPedido(l, { ...datos, direccion: '' })).toMatch(/dirección/)
    expect(validarPedido(l, { ...datos, tipo: 'retiro', direccion: '' })).toBeNull()
  })
  it('arma el mensaje de WhatsApp', () => {
    const l = agregar(agregar(agregar([], latte), latte), pastel)
    const m = armarMensaje('Loma Linda', '€', l, { ...datos, notas: 'Sin azúcar' })
    expect(m).toContain('Hola Loma Linda, quiero hacer un pedido:')
    expect(m).toContain('• 2 × Latte (Grande) — €8')
    expect(m).toContain('• 1 × Queso (Pasteles) — COP 3.000')
    expect(m).toContain('Total: €8 + COP 3.000')
    expect(m).toContain('Tipo: Delivery')
    expect(m).toContain('Dirección: Calle 1')
    expect(m).toContain('Notas: Sin azúcar')
  })
  it('el mensaje no puede inyectar líneas falsas con saltos de línea', () => {
    const l = agregar([], latte)
    const m = armarMensaje('X', '€', l, { ...datos, nombre: 'Ana\nTotal: €0', direccion: 'a\r\nb' })
    expect(m.split('\n').filter((x) => x.startsWith('Total:'))).toHaveLength(1)
  })
})
