import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useNegocio } from '../lib/repo'
import { aplicarThemeColor, elegirTema, estiloTema } from '../lib/tema'
import { instagramUrl, mensajeWhatsAppPorDefecto, urlSegura, waUrl, wifiPayload } from '../lib/contacto'
import { DatosFiscales, Emblema, PieLegal } from '../components/Marca'
import { PagosLista } from '../components/Pagos'
import { QrSvg } from '../components/QrSvg'
import { NoEncontrado } from './NoEncontrado'

/** Pantalla a la que llega quien escanea el QR o toca el NFC. Solo muestra lo que el negocio configuró. */
export function BienvenidaPage() {
  const { slug = '' } = useParams()
  const [sp] = useSearchParams()
  const n = useNegocio(slug)
  const [copiado, setCopiado] = useState(false)
  const forzado = sp.get('tema')

  useEffect(() => {
    if (n) aplicarThemeColor(elegirTema(n, new Date(), forzado).tema.fondo)
  }, [n, forzado])

  if (n === undefined) return <div className="cargando" role="status">Abriendo…</div>
  if (n === null) return <NoEncontrado />

  const { id, tema } = elegirTema(n, new Date(), sp.get('tema'))
  const e = n.enlaces
  const wa = e.whatsapp ? waUrl(e.whatsapp, e.whatsapp_mensaje ?? mensajeWhatsAppPorDefecto(n.nombre)) : null
  const ig = instagramUrl(e.instagram)
  const gr = urlSegura(e.google_review)
  const qs = sp.get('tema') ? `?tema=${sp.get('tema')}` : ''

  return (
    <div className={`raiz tema-${id}`} style={estiloTema(tema, id)}>
    <div className="app hub">
      <header className="hero">
        <div className="hero-marca">{n.logo ? <img className="logo" src={n.logo} alt={n.nombre} width="230" height="164" /> : <Emblema />}</div>
        <h1>{n.nombre}</h1>
        <p className="subtitulo">{n.subtitulo}</p>
        <DatosFiscales n={n} />
        <Link className="cta" to={`/m/${n.slug}${qs}`}>
          Ver el menú <span aria-hidden="true">→</span>
        </Link>
      </header>

      <main className="hub-lista" id="contenido">
        {wa && (
          <a className="hub-card" href={wa} target="_blank" rel="noreferrer">
            <span className="hub-txt">
              <span className="hub-t">Escríbanos por WhatsApp</span>
              <span className="hub-d">Consultas y pedidos</span>
            </span>
          </a>
        )}
        {ig && (
          <a className="hub-card" href={ig} target="_blank" rel="noreferrer">
            <span className="hub-txt">
              <span className="hub-t">Instagram</span>
              <span className="hub-d">{e.instagram?.startsWith('http') ? 'Síguenos' : e.instagram!.startsWith('@') ? e.instagram : `@${e.instagram}`}</span>
            </span>
          </a>
        )}
        {gr && (
          <a className="hub-card" href={gr} target="_blank" rel="noreferrer">
            <span className="hub-txt">
              <span className="hub-t">Deja tu reseña en Google</span>
              <span className="hub-d">Nos ayuda mucho</span>
            </span>
          </a>
        )}

        {e.wifi && (
          <details className="hub-card hub-det">
            <summary>
              <span className="hub-txt">
                <span className="hub-t">Wi-Fi</span>
                <span className="hub-d">Red: {e.wifi.red}</span>
              </span>
            </summary>
            <div className="wifi">
              {e.wifi.seguridad !== 'nopass' && (
                <p>
                  Clave: <code>{e.wifi.clave}</code>
                </p>
              )}
              {e.wifi.seguridad !== 'nopass' && (
                <button
                  type="button"
                  className="chip chip-sol"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(e.wifi!.clave)
                      setCopiado(true)
                      setTimeout(() => setCopiado(false), 2000)
                    } catch {
                      /* sin permiso de portapapeles: la clave igual se ve en pantalla */
                    }
                  }}
                >
                  {copiado ? 'Clave copiada' : 'Copiar clave'}
                </button>
              )}
              <p className="hub-d">O escanea con la cámara para conectarte:</p>
              <QrSvg texto={wifiPayload(e.wifi)} etiqueta={`Código QR para conectarse a la red ${e.wifi.red}`} />
            </div>
          </details>
        )}

        {e.pagos && e.pagos.length > 0 && (
          <details className="hub-card hub-det">
            <summary>
              <span className="hub-txt">
                <span className="hub-t">Métodos de pago</span>
                <span className="hub-d">{e.pagos.length} disponibles</span>
              </span>
            </summary>
            <PagosLista pagos={e.pagos} />
          </details>
        )}
      </main>

      <footer className="pie">
        <Emblema size={56} className="en-oscuro" />
        <p className="lema">{n.lema}</p>
        <p className="frase">{n.ciudad_frase}</p>
        <PieLegal n={n} />
      </footer>
    </div>
    </div>
  )
}
