/** 4.5 -> "4,5"; 6 -> "6" (se respeta el formato impreso en el menú original). */
export function numero(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n).replace('.', ',')
}

/** 4000 -> "4.000" (precios grandes de empanadas/pasteles en pesos). */
export function numeroMiles(n: number): string {
  const s = String(Math.abs(Math.round(n)))
  return (n < 0 ? '-' : '') + s.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function precioMiles(p: number, moneda: string): string {
  return `${moneda}${numeroMiles(p)}`
}

export function precio(n: number, moneda: string): string {
  return `${moneda}${numero(n)}`
}

/** Minúsculas y sin tildes, para que "pure" encuentre "puré" y "cafe" encuentre "café". */
export function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}
