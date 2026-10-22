import { useEffect, useState } from 'react'
import type { EnlaceQR, Negocio } from '../types'
import lomaLinda from '../data/loma-linda.json'
import enlaces from '../data/enlaces.json'
import { hayNube, leerBorrador, leerNube } from './store'

/**
 * Capa de acceso a datos. Hoy lee JSON local; para pasar a Supabase solo se
 * reemplazan estas funciones (la interfaz no cambia). Ver supabase/migrations.
 */
const NEGOCIOS: Record<string, Negocio> = {
  'loma-linda': lomaLinda as unknown as Negocio,
}
const ENLACES: EnlaceQR[] = [...(enlaces as EnlaceQR[])]

// Solo en desarrollo (npm run dev): un negocio de PRUEBA con todos los accesos llenos para
// poder ver Wi-Fi, pagos, Instagram, WhatsApp y el carrito. Los datos son ficticios y esta
// rama se elimina del build de producción.
if (import.meta.env.DEV) {
  const base = structuredClone(NEGOCIOS['loma-linda'])
  NEGOCIOS['demo-pruebas'] = {
    ...base,
    slug: 'demo-pruebas',
    enlaces: {
      whatsapp: '580000000000',
      instagram: '@demo.pruebas',
      google_review: 'https://example.com/resena',
      wifi: { red: 'Demo-WiFi', clave: 'clave;demo:123' },
      pagos: [
        { metodo: 'Pago Móvil (demo)', detalle: '0000-0000000 · V-00000000' },
        { metodo: 'Efectivo', detalle: 'USD o COP' },
      ],
    },
    almuerzo: { ...base.almuerzo, cuarto_plato: { ...base.almuerzo.cuarto_plato, actual: { nombre: 'Pasticho' } } },
  }
  ENLACES.push({ codigo: 'demo-pr', slug: 'demo-pruebas', activo: true })
}

/**
 * Gana la versión más reciente: la publicada en la nube solo si se publicó después del
 * `actualizado` del JSON incluido. Así un cambio en el código no exige volver a publicar desde el panel.
 * Con borrador=true, primero el borrador local del panel.
 */
export async function getNegocio(slug: string, borrador = false): Promise<Negocio | null> {
  if (borrador) {
    const b = leerBorrador(slug)
    if (b) return b
  }
  if (hayNube && NEGOCIOS[slug]) {
    const r = await leerNube(slug)
    if (r && esMasNueva(r.publicado, NEGOCIOS[slug].actualizado)) return r.data
  }
  return NEGOCIOS[slug] ?? null
}

/** Sin fecha en el código, la nube siempre gana (comportamiento anterior). */
export function esMasNueva(publicado: string, actualizado?: string): boolean {
  if (!actualizado) return true
  return Date.parse(publicado) > Date.parse(actualizado)
}

/** Versión incluida en el código (base para "descartar cambios"). */
export function getNegocioBase(slug: string): Negocio | null {
  return NEGOCIOS[slug] ? structuredClone(NEGOCIOS[slug]) : null
}

export async function resolverEnlace(codigo: string): Promise<EnlaceQR | null> {
  return ENLACES.find((e) => e.codigo === codigo) ?? null
}

export function listarSlugs(): string[] {
  return Object.keys(NEGOCIOS).filter((s) => s !== 'demo-pruebas')
}

/** undefined = cargando, null = no existe. */
export function useNegocio(slug: string): Negocio | null | undefined {
  const [n, setN] = useState<Negocio | null | undefined>(undefined)
  const borrador = typeof location !== 'undefined' && new URLSearchParams(location.search).has('borrador')
  useEffect(() => {
    let vivo = true
    setN(undefined)
    getNegocio(slug, borrador).then((r) => vivo && setN(r))
    return () => {
      vivo = false
    }
  }, [slug, borrador])
  return n
}
