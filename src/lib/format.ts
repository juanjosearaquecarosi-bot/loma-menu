/**
 * Números como en el menú impreso: coma decimal (4,5) y punto de miles (4.000).
 * Se formatea a mano para no depender del locale del teléfono.
 */
export function numero(n: number): string {
  const r = Math.round(n * 100) / 100
  const [ent, dec] = String(Math.abs(r)).split('.')
  const miles = ent.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${r < 0 ? '-' : ''}${miles}${dec ? ',' + dec : ''}`
}

/** "€4,5", "$3,5", pero "COP 4.000" (los códigos de moneda llevan espacio). */
export function precio(n: number, moneda: string): string {
  return moneda.length > 1 ? `${moneda} ${numero(n)}` : `${moneda}${numero(n)}`
}

/** Minúsculas y sin tildes, para que "pure" encuentre "puré" y "cafe" encuentre "café". */
export function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}
