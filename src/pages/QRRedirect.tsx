import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { resolverEnlace } from '../lib/repo'
import { NoEncontrado } from './NoEncontrado'

/**
 * /q/:codigo — el chip NFC y el QR apuntan al CÓDIGO, nunca al slug. Llega a la pantalla de bienvenida (/b/:slug).
 * Así el negocio puede cambiar de slug o de menú sin reprogramar los stands vendidos.
 * (En producción esta resolución puede hacerse con un redirect 302 en el borde.)
 */
export function QRRedirect() {
  const { codigo = '' } = useParams()
  const [estado, setEstado] = useState<'cargando' | { slug: string } | 'inactivo' | 'noexiste'>('cargando')

  useEffect(() => {
    resolverEnlace(codigo).then((e) => {
      if (!e) setEstado('noexiste')
      else if (!e.activo) setEstado('inactivo')
      else setEstado({ slug: e.slug })
    })
  }, [codigo])

  if (estado === 'cargando') return <div className="cargando" role="status">Abriendo menú…</div>
  if (estado === 'noexiste') return <NoEncontrado mensaje="Este código no existe." />
  if (estado === 'inactivo') return <NoEncontrado mensaje="Este menú está temporalmente desactivado." />
  return <Navigate to={`/b/${estado.slug}`} replace />
}
