import { Link } from 'react-router-dom'
import type { Negocio } from '../types'
import { instagramUrl, mensajeWhatsAppPorDefecto, urlSegura, waUrl } from '../lib/contacto'

/** Accesos rápidos de la cabecera del menú. Solo aparece lo que el negocio configuró (nada inventado). */
export function Enlaces({ n }: { n: Negocio }) {
  const e = n.enlaces
  const wa = e.whatsapp ? waUrl(e.whatsapp, e.whatsapp_mensaje ?? mensajeWhatsAppPorDefecto(n.nombre)) : null
  const ig = instagramUrl(e.instagram)
  const gr = urlSegura(e.google_review)
  const hayHub = !!e.wifi || !!e.pagos?.length

  if (!wa && !ig && !gr && !hayHub) return null
  return (
    <div className="enlaces" aria-label="Accesos rápidos">
      {wa && (
        <a className="chip" href={wa} target="_blank" rel="noreferrer">
          Escríbanos por WhatsApp
        </a>
      )}
      {ig && (
        <a className="chip" href={ig} target="_blank" rel="noreferrer">
          Instagram
        </a>
      )}
      {gr && (
        <a className="chip" href={gr} target="_blank" rel="noreferrer">
          Deja tu reseña
        </a>
      )}
      {hayHub && (
        <Link className="chip" to={`/b/${n.slug}`}>
          Wi-Fi y pagos
        </Link>
      )}
    </div>
  )
}
