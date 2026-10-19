import type { Negocio } from '../types'

/**
 * Persistencia del panel admin.
 * - Con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY: el menú publicado vive en la tabla `menu_docs`
 *   (ver supabase/migrations/002_menu_docs.sql); escribir exige iniciar sesión y la política RLS decide quién puede.
 * - Sin ellas: el panel guarda un BORRADOR en este navegador y permite descargar el JSON.
 * Solo se usa la clave "anon". Nunca la service_role.
 */
const URL_BASE = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const hayNube = Boolean(URL_BASE && ANON)

export function esNegocioValido(x: unknown): x is Negocio {
  const n = x as Negocio
  return !!n && typeof n.slug === 'string' && Array.isArray(n.categorias) && !!n.almuerzo && !!n.temas && !!n.enlaces
}

export async function leerNube(slug: string): Promise<Negocio | null> {
  if (!hayNube) return null
  try {
    const r = await fetch(`${URL_BASE}/rest/v1/menu_docs?slug=eq.${encodeURIComponent(slug)}&select=data`, { headers: { apikey: ANON! } })
    if (!r.ok) return null
    const filas = (await r.json()) as { data: unknown }[]
    return esNegocioValido(filas[0]?.data) ? filas[0].data : null
  } catch {
    return null
  }
}

export async function iniciarSesion(email: string, clave: string): Promise<string> {
  const r = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: clave }),
  })
  if (!r.ok) throw new Error('Correo o clave incorrectos')
  const j = (await r.json()) as { access_token: string }
  return j.access_token
}

export async function publicarNube(n: Negocio, token: string): Promise<void> {
  const r = await fetch(`${URL_BASE}/rest/v1/menu_docs?on_conflict=slug`, {
    method: 'POST',
    headers: { apikey: ANON!, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ slug: n.slug, data: n, updated_at: new Date().toISOString() }),
  })
  if (r.status === 401) throw new Error('SESION')
  if (!r.ok) throw new Error('No se pudo publicar (¿tu usuario tiene permiso para este negocio?)')
}

const kBorrador = (slug: string) => `nfcmenu:borrador:${slug}`
export function leerBorrador(slug: string): Negocio | null {
  try {
    const t = localStorage.getItem(kBorrador(slug))
    const x = t ? JSON.parse(t) : null
    return esNegocioValido(x) ? x : null
  } catch {
    return null
  }
}
export function guardarBorrador(n: Negocio) {
  try {
    localStorage.setItem(kBorrador(n.slug), JSON.stringify(n))
  } catch {
    /* sin almacenamiento: el panel sigue funcionando en memoria */
  }
}
export function borrarBorrador(slug: string) {
  try {
    localStorage.removeItem(kBorrador(slug))
  } catch {
    /* nada */
  }
}
