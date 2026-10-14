import type { EnlaceQR, Negocio } from '../types'
import lomaLinda from '../data/loma-linda.json'
import enlaces from '../data/enlaces.json'

/**
 * Capa de acceso a datos. Hoy lee JSON local; para pasar a Supabase solo se
 * reemplazan estas dos funciones (la interfaz no cambia). Ver supabase/migrations.
 */
const NEGOCIOS: Record<string, Negocio> = {
  'loma-linda': lomaLinda as unknown as Negocio,
}

export async function getNegocio(slug: string): Promise<Negocio | null> {
  return NEGOCIOS[slug] ?? null
}

export async function resolverEnlace(codigo: string): Promise<EnlaceQR | null> {
  return (enlaces as EnlaceQR[]).find((e) => e.codigo === codigo) ?? null
}

export function listarSlugs(): string[] {
  return Object.keys(NEGOCIOS)
}
