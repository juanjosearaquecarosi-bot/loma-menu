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

/** Año/mes/día calendario en la zona del negocio (no en la del teléfono del cliente). */
function fechaEnZona(zona: string, ahora: Date): { y: number; m: number; d: number } {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(ahora)
  const g = (t: string) => Number(partes.find((p) => p.type === t)!.value)
  return { y: g('year'), m: g('month'), d: g('day') }
}

/**
 * Día de la semana en la zona del negocio (America/Caracas = UTC-4 fijo, sin horario de verano).
 */
export function diaActual(zona: string, ahora: Date = new Date()): DiaId {
  const { y, m, d } = fechaEnZona(zona, ahora)
  return POR_INDICE_JS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
}

/** Número de semana ISO 8601 (la semana empieza el lunes) según el calendario de la zona. */
export function semanaISO(zona: string, ahora: Date = new Date()): number {
  const { y, m, d } = fechaEnZona(zona, ahora)
  const f = new Date(Date.UTC(y, m - 1, d))
  const dia = f.getUTCDay() || 7 // lunes=1 ... domingo=7
  f.setUTCDate(f.getUTCDate() + 4 - dia) // jueves de esa semana
  const inicio = Date.UTC(f.getUTCFullYear(), 0, 1)
  return Math.ceil(((f.getTime() - inicio) / 86400000 + 1) / 7)
}

export interface AlmuerzoDelDia {
  dia: DiaId
  servicio: boolean
  fijos: Plato[]
  /** Plato de la semana (igual todos los días). null = aún no definido. */
  cuartoPlato: Plato | null
  /** Plato del día: fijo por día de la semana. null = ese día no tiene. */
  platoDelDia: Plato | null
}

export function almuerzoDe(a: Almuerzo, dia: DiaId): AlmuerzoDelDia {
  const servicio = !a.dias_sin_servicio.includes(dia)
  return {
    dia,
    servicio,
    fijos: servicio ? a.platos_fijos : [],
    cuartoPlato: servicio ? (a.cuarto_plato.actual ?? null) : null,
    platoDelDia: servicio ? (a.plato_del_dia[dia] ?? null) : null,
  }
}
