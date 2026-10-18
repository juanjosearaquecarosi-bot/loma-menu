import { useState } from 'react'
import type { Negocio } from '../types'
import { numero } from '../lib/format'
import { armarMensaje, cambiarCantidad, cantidadTotal, totalTexto, type DatosPedido, type Linea } from '../lib/carrito'
import { waUrl } from '../lib/contacto'

/** Barra inferior + panel deslizante con el resumen del pedido. */
export function CarritoPanel({ n, carrito, setCarrito }: { n: Negocio; carrito: Linea[]; setCarrito: (f: (c: Linea[]) => Linea[]) => void }) {
  const [abierto, setAbierto] = useState(false)
  const [nota, setNota] = useState('')
  const [enviado, setEnviado] = useState(false)

  const items = cantidadTotal(carrito)
  const wa = n.enlaces.whatsapp?.replace(/\D/g, '')

  if (items === 0) return null

  const montoFmt = totalTexto(carrito, n.moneda)
  const enviar = () => {
    if (!wa) return
    const datos: DatosPedido = { tipo: 'retiro', nombre: '', direccion: '', notas: nota }
    const url = waUrl(wa, armarMensaje(n.nombre, n.moneda, carrito, datos))
    if (url) open(url, '_blank')
    setEnviado(true)
    setTimeout(() => setEnviado(false), 4000)
  }

  return (
    <>
      {!abierto && (
        <button className="carrito-flotante" onClick={() => setAbierto(true)}>
          <span className="carrito-icono" aria-hidden="true">
            🛒
          </span>
          {items} {items === 1 ? 'ítem' : 'ítems'} · {montoFmt}
        </button>
      )}

      {abierto && (
        <div className="carrito-velo" onClick={() => setAbierto(false)}>
          <aside className="carrito-panel" role="dialog" aria-label="Tu pedido" onClick={e => e.stopPropagation()}>
            <header className="carrito-cab">
              <h2>Tu pedido</h2>
              <button className="cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar carrito">
                ×
              </button>
            </header>

            <ul className="carrito-items">
              {carrito.map(l => (
                <li key={l.clave} className="carrito-item">
                  <div className="txt">
                    <span className="nombre">{l.nombre}</span>
                    {l.variante && <span className="desc">{l.variante}</span>}
                  </div>
                  <div className="cant">
                    <button onClick={() => setCarrito(f => cambiarCantidad(f, l.clave, -1))} aria-label={`Quitar un ${l.nombre}`}>
                      −
                    </button>
                    <span aria-live="polite">{l.cantidad}</span>
                    <button onClick={() => setCarrito(f => cambiarCantidad(f, l.clave, 1))} aria-label={`Agregar un ${l.nombre}`}>
                      +
                    </button>
                  </div>
                  <span className="precio">
                    <small>{l.moneda}</small>
                    {numero(l.precio * l.cantidad)}
                  </span>
                  <button
                    className="borrar"
                    onClick={() => setCarrito(f => f.filter(x => x.clave !== l.clave))}
                    aria-label={`Eliminar ${l.nombre} del pedido`}
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>

            <label className="carrito-nota">
              <span className="etq">Nota para el local</span>
              <textarea
                value={nota}
                onChange={e => setNota(e.target.value)}
                placeholder="Ej: sin cebolla, entregar en la mesa 3, toques de timbre…"
                rows={2}
              />
            </label>

            <footer className="carrito-pie">
              <div className="total">
                <span className="etq">Total</span>
                <strong>{montoFmt}</strong>
              </div>
              <div className="acciones">
                <button className="secundario" onClick={() => setCarrito(() => [])}>
                  Vaciar
                </button>
                {wa ? (
                  <button className="primario" onClick={enviar} disabled={enviado}>
                    {enviado ? '¡Pedido enviado!' : 'Enviar por WhatsApp'}
                  </button>
                ) : (
                  <button className="primario" disabled title="Configura el WhatsApp del negocio en el panel de administración">
                    WhatsApp no configurado
                  </button>
                )}
              </div>
            </footer>
          </aside>
        </div>
      )}
    </>
  )
}
