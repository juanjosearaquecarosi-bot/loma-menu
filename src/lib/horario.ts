import type { Almuerzo, DiaId, Plato } from '../types'

export const DIAS: { id: DiaId; corto: string; largo: string }[] = [
  { id: 'lunes', corto: 'Lun', largo: 'Lunes' },
  { id: 'martes', corto: 'Mar', largo: 'Martes' },
  { id: 'miercoles', corto: 'Mié', largo: 'Miércoles' },
  { id: 'jueves', corto: 'Jue', largo: 'Jueves' },
  { id: 'viernes', corto: 'Vie', largo: 'Viernes' },
  { id: 'sabado', corto: 'Sáb', largo: 'Sábado' },
  { id: 'domingo', corto: 'Dom', largo: 'Domingo' },
]

const POR_INDICE_JS: DiaId[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

/**
 * Día de la semana en la zona del negocio (America/Caracas = UTC-4 fijo, sin horario de verano).
 * Se calcula con Intl para no depender del reloj/zona del teléfono del cliente.
 */
export function diaActual(zona: string, ahora: Date = new Date()): DiaId {
  const corto = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: zona }).format(ahora)
  const mapa: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return POR_INDICE_JS[mapa[corto] ?? 0]
}

export interface AlmuerzoDelDia {
  dia: DiaId
  servicio: boolean
  fijos: Plato[]
  /** Plato fijo que cambia según el día (rotación del set activo). null = el original no lo trae. */
  rotativo: Plato | null
  platoDelDia: Plato | null
}

export function almuerzoDe(a: Almuerzo, dia: DiaId): AlmuerzoDelDia {
  const servicio = !a.dias_sin_servicio.includes(dia)
  return {
    dia,
    servicio,
    fijos: servicio ? a.platos_fijos : [],
    rotativo: servicio ? (a.rotaciones[a.set_activo]?.[dia] ?? null) : null,
    platoDelDia: servicio ? (a.plato_del_dia[dia] ?? null) : null,
  }
}
