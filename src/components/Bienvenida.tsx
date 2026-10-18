import { useState } from 'react'
import type { Negocio } from '../types'
import { logoActivo, paletaActiva } from '../lib/tema'

/**
 * Pantalla de bienvenida: lo primero que ve el cliente al escanear el NFC/QR.
 * Logo real del negocio + accesos pedidos por el cliente: menú digital, WiFi,
 * métodos de pago, Instagram y WhatsApp con mensaje predefinido.
 * Solo se muestran los accesos que el negocio haya configurado (nada inventado).
 */
export function Bienvenida({ n }: { n: Negocio }) {
  const paleta = paletaActiva(n.tema)
  const logo = logoActivo(n, paleta)
  const [copiado, setCopiado] = useState(false)
  const [verPagos, setVerPagos] = useState(false)

  const wa = n.enlaces.whatsapp?.replace(/\D/g, '')
  const mensaje = encodeURIComponent(n.enlaces.whatsapp_mensaje || '¡Hola! Escribo desde el menú digital.')

  const botones: { k: string; el: React.ReactNode }[] = []

  if (wa) {
    botones.push({
      k: 'wa',
      el: (
        <a className="cta cta-principal" href={`https://wa.me/${wa}?text=${mensaje}`} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      ),
    })
  }
  if (n.enlaces.instagram) {
    botones.push({
      k: 'ig',
      el: (
        <a className="cta" href={n.enlaces.instagram} target="_blank" rel="noreferrer">
          Instagram
        </a>
      ),
    })
  }

  return (
    <div className="bienvenida">
      <img className="logo" src={logo} alt={`Logo de ${n.nombre}`} width="180" height="180" />
      <p className="sobre">{n.subtitulo}</p>
      <h1>{n.nombre}</h1>
      <p className="lema">{n.lema}</p>

      <a className="cta entrar" href="#contenido">
        Ver el menú
      </a>

      {(n.enlaces.wifi || n.enlaces.pagos?.length || botones.length > 0) && <hr className="divisor" />}

      {n.enlaces.wifi && (
        <button
          className="cta secundario"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(n.enlaces!.wifi!.clave)
              setCopiado(true)
              setTimeout(() => setCopiado(false), 2000)
            } catch {
              /* sin permiso de portapapeles: la clave igual se ve en pantalla */
            }
          }}
        >
          {copiado ? 'Clave copiada' : `WiFi · ${n.enlaces.wifi.red}`}
        </button>
      )}

      {n.enlaces.pagos?.length ? (
        <button className="cta secundario" type="button" onClick={() => setVerPagos(v => !v)} aria-expanded={verPagos}>
          Métodos de pago
        </button>
      ) : null}
      {verPagos && n.enlaces.pagos?.length ? (
        <div className="pagos-lista">
          {n.enlaces.pagos.map(p => (
            <p key={p.metodo}>
              <strong>{p.metodo}</strong> {p.detalle}
            </p>
          ))}
        </div>
      ) : null}

      {botones.length > 0 && <div className="cta-grupo">{botones.map(b => <span key={b.k}>{b.el}</span>)}</div>}

      {n.enlaces.direccion && <p className="direccion">📍 {n.enlaces.direccion}</p>}
      {n.enlaces.email && (
        <p className="correo">
          <a href={`mailto:${n.enlaces.email}`}>{n.enlaces.email}</a>
        </p>
      )}
    </div>
  )
}
