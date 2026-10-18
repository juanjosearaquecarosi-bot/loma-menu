import type { Enlaces } from '../types'

export function soloDigitos(s: string): string {
  return s.replace(/\D/g, '')
}

/** Solo http(s). Evita que un dato mal cargado ("javascript:...") termine en un href. */
export function urlSegura(v?: string): string | null {
  if (!v) return null
  try {
    const u = new URL(v)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null
  } catch {
    return null
  }
}

/** Acepta "@usuario", "usuario" o una URL de instagram.com. Cualquier otra cosa -> null. */
export function instagramUrl(v?: string): string | null {
  if (!v) return null
  const t = v.trim()
  if (/^https?:\/\//i.test(t)) {
    const u = urlSegura(t)
    if (!u) return null
    const host = new URL(u).hostname.replace(/^www\./, '')
    return host === 'instagram.com' ? u : null
  }
  const h = t.replace(/^@/, '')
  return /^[A-Za-z0-9._]{1,30}$/.test(h) ? `https://instagram.com/${h}` : null
}

export function mensajeWhatsAppPorDefecto(nombreNegocio: string): string {
  return `Hola ${nombreNegocio}, vi su menú digital y quisiera hacerles una consulta.`
}

export function waUrl(numero: string, mensaje?: string): string | null {
  const d = soloDigitos(numero)
  if (d.length < 8) return null
  return `https://wa.me/${d}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''}`
}

/** Texto del QR que el teléfono interpreta como "conectarse a esta red" (formato WIFI: estándar). */
export function wifiPayload(w: NonNullable<Enlaces['wifi']>): string {
  const esc = (s: string) => s.replace(/([\\;,:"])/g, '\\$1')
  const t = w.seguridad ?? 'WPA'
  return t === 'nopass' ? `WIFI:T:nopass;S:${esc(w.red)};;` : `WIFI:T:${t};S:${esc(w.red)};P:${esc(w.clave)};;`
}
