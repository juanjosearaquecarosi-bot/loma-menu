import { useState } from 'react'
import type { Enlaces as TEnlaces } from '../types'

/** Botones de acción. Solo aparecen los que el negocio configuró (nada inventado). */
export function Enlaces({ e }: { e: TEnlaces }) {
  const [copiado, setCopiado] = useState(false)
  const items: { k: string; el: React.ReactNode }[] = []

  if (e.whatsapp) {
    items.push({
      k: 'wa',
      el: (
        <a className="chip" href={`https://wa.me/${e.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      ),
    })
  }
  if (e.instagram) {
    items.push({
      k: 'ig',
      el: (
        <a className="chip" href={e.instagram} target="_blank" rel="noreferrer">
          Instagram
        </a>
      ),
    })
  }
  if (e.google_review) {
    items.push({
      k: 'gr',
      el: (
        <a className="chip" href={e.google_review} target="_blank" rel="noreferrer">
          Deja tu reseña
        </a>
      ),
    })
  }
  if (e.wifi) {
    const w = e.wifi
    items.push({
      k: 'wifi',
      el: (
        <button
          className="chip"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(w.clave)
              setCopiado(true)
              setTimeout(() => setCopiado(false), 2000)
            } catch {
              /* sin permiso de portapapeles: la clave igual se ve en pantalla */
            }
          }}
        >
          {copiado ? 'Clave copiada' : `WiFi · ${w.red}`}
        </button>
      ),
    })
  }

  if (!items.length && !e.pagos?.length) return null
  return (
    <div className="enlaces" aria-label="Accesos rápidos">
      {items.map((i) => (
        <span key={i.k}>{i.el}</span>
      ))}
      {e.pagos?.length ? (
        <details className="pagos">
          <summary className="chip">Métodos de pago</summary>
          <ul>
            {e.pagos.map((p) => (
              <li key={p.metodo}>
                <strong>{p.metodo}</strong> {p.detalle}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}
