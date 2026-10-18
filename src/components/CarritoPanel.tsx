import { useState } from 'react'
import type { Negocio } from '../types'
import { numero, numeroMiles } from '../lib/format'
import { eliminar, linkWhatsApp, mensajePedido, monedaDeItem, quitar, totalItems, totalMonto, vaciar, type Carrito } from '../lib/carrito'

/** Barra inferior + panel deslizante con el resumen del pedido. */
export function CarritoPanel({ n, carrito, setCarrito }: { n: Negocio; carrito: Carrito; setCarrito: (f: (c: Carrito) => Carrito) => void }) {
  const [abierto, setAbierto] = useState(false)
  const [nota, setNota] = useState('')
  const [enviado, setEnviado] = useState(false)

  const items = totalItems(carrito)
  const monto = totalMonto(carrito)
  const wa = n.enlaces.whatsapp?.replace(/\D/g, '')

  if (items === 0) return null

  const montoFmt = numeroMiles(monto)
  const enviar = () => {
    if (!wa) return
    const msg = mensajePedido(n, carrito, nota)
    open(linkWhatsApp(wa, msg), '_blank')
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
          {items} {items === 1 ? 'ítem' : 'ítems'} · {n.moneda_pesos ?? '$'}
          {montoFmt}
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
              {Object.values(carrito).map(l => (
                <li key={l.item.id} className="carrito-item">
                  <div className="txt">
                    <span className="nombre">{l.item.nombre}</span>
                    <span className="desc">{l.categoria.nombre}</span>
                  </div>
                  <div className="cant">
                    <button onClick={() => setCarrito(f => quitar(f, l.item.id))} aria-label={`Quitar un ${l.item.nombre}`}>
                      −
                    </button>
                    <span aria-live="polite">{l.cantidad}</span>
                    <button
                      onClick={() => setCarrito(f => ({ ...f, [l.item.id]: { ...f[l.item.id], cantidad: f[l.item.id].cantidad + 1 } }))}
                      aria-label={`Agregar un ${l.item.nombre}`}
                    >
                      +
                    </button>
                  </div>
                  <span className="precio">
                    <small>{monedaDeItem(n, l.categoria, l.item)}</small>
                    {monedaDeItem(n, l.categoria, l.item) === n.moneda_pesos
                      ? numeroMiles(l.item.precio! * l.cantidad)
                      : numero(l.item.precio! * l.cantidad)}
                  </span>
                  <button className="borrar" onClick={() => setCarrito(f => eliminar(f, l.item.id))} aria-label={`Eliminar ${l.item.nombre} del pedido`}>
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
                <strong>
                  {n.moneda_pesos ?? '$'}
                  {montoFmt}
                </strong>
              </div>
              <div className="acciones">
                <button className="secundario" onClick={() => setCarrito(vaciar)}>
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
