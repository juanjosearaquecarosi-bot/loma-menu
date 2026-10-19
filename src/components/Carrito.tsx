import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Negocio } from '../types'
import { agregar as sumar, armarMensaje, cambiarCantidad, cantidadTotal, totalTexto, validarPedido, type DatosPedido, type Linea } from '../lib/carrito'
import { precio } from '../lib/format'
import { waUrl } from '../lib/contacto'
import { PagosLista } from './Pagos'

interface Ctx {
  /** El carrito solo existe si el negocio lo activó Y tiene un WhatsApp válido. */
  activo: boolean
  agregar: (l: Omit<Linea, 'cantidad'>) => void
}
const C = createContext<Ctx>({ activo: false, agregar: () => {} })
export const useCarrito = () => useContext(C)

function leer(clave: string): Linea[] {
  try {
    const raw = JSON.parse(sessionStorage.getItem(clave) ?? '[]')
    if (!Array.isArray(raw)) return []
    return raw.filter(
      (l): l is Linea =>
        l && typeof l.clave === 'string' && typeof l.nombre === 'string' && typeof l.precio === 'number' && typeof l.moneda === 'string' && Number.isInteger(l.cantidad) && l.cantidad > 0,
    )
  } catch {
    return []
  }
}

export function CarritoProvider({ n, children }: { n: Negocio; children: React.ReactNode }) {
  const numero = n.enlaces.whatsapp
  const activo = !!n.pedidos?.activo && !!numero && !!waUrl(numero)
  const clave = `carrito:${n.slug}`
  const [lineas, setLineas] = useState<Linea[]>(() => leer(clave))
  const [aviso, setAviso] = useState('')
  const dlg = useRef<HTMLDialogElement>(null)
  const [datos, setDatos] = useState<DatosPedido>({ tipo: 'delivery', nombre: '', direccion: '', notas: '' })
  const [error, setError] = useState<string | null>(null)
  /** revisar → pago (si el negocio tiene métodos de pago) → enviado (WhatsApp abierto, sigue visible el pago). */
  const [paso, setPaso] = useState<'revisar' | 'pago' | 'enviado'>('revisar')
  const pagos = n.enlaces.pagos?.filter((p) => p.metodo.trim()) ?? []
  const hayPagos = pagos.length > 0

  useEffect(() => {
    try {
      sessionStorage.setItem(clave, JSON.stringify(lineas))
    } catch {
      /* sin almacenamiento (modo privado): el carrito sigue funcionando en memoria */
    }
  }, [clave, lineas])

  useEffect(() => {
    if (!lineas.length) {
      dlg.current?.close()
      setPaso('revisar')
    }
  }, [lineas.length])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(''), 1800)
    return () => clearTimeout(t)
  }, [aviso])

  const agregar = useCallback((l: Omit<Linea, 'cantidad'>) => {
    setLineas((prev) => sumar(prev, l))
    setAviso(`${l.nombre}${l.variante ? ` (${l.variante})` : ''} agregado al pedido`)
  }, [])

  const ctx = useMemo(() => ({ activo, agregar }), [activo, agregar])
  const cant = cantidadTotal(lineas)
  const set = <K extends keyof DatosPedido>(k: K, v: DatosPedido[K]) => {
    setDatos((d) => ({ ...d, [k]: v }))
    setError(null)
  }

  function continuar() {
    const e = validarPedido(lineas, datos)
    if (e) return setError(e)
    if (hayPagos) setPaso('pago')
    else abrirWhatsApp()
  }
  function abrirWhatsApp() {
    const e = validarPedido(lineas, datos)
    if (e) {
      setPaso('revisar')
      return setError(e)
    }
    const url = waUrl(numero!, armarMensaje(n.nombre, n.moneda, lineas, datos, hayPagos))
    if (url) window.open(url, '_blank', 'noopener')
    if (hayPagos) setPaso('enviado')
  }
  function nuevoPedido() {
    setLineas([])
    setPaso('revisar')
  }

  return (
    <C.Provider value={ctx}>
      {children}
      {activo && (
        <>
          <p className="sr" role="status" aria-live="polite">
            {aviso}
          </p>
          {cant > 0 && (
            <button type="button" className="barra-pedido" onClick={() => {
                if (paso === 'enviado') setPaso('revisar')
                dlg.current?.showModal()
              }}>
              <span>
                Ver pedido <b>({cant})</b>
              </span>
              <span className="total">{totalTexto(lineas, n.moneda)}</span>
            </button>
          )}
          <dialog
            ref={dlg}
            className="hoja"
            aria-labelledby="t-pedido"
            onClick={(e) => {
              if (e.target === dlg.current) dlg.current?.close()
            }}
          >
            <div className="hoja-in">
              <header className="hoja-cab">
                <h2 id="t-pedido">{paso === 'revisar' ? 'Tu pedido' : paso === 'pago' ? 'Paga tu pedido' : 'Falta tu pago'}</h2>
                <button type="button" className="cerrar" onClick={() => dlg.current?.close()} aria-label="Cerrar">
                  ×
                </button>
              </header>

              {paso === 'revisar' && (
                <>
              <ul className="lineas">
                {lineas.map((l) => (
                  <li key={l.clave}>
                    <div className="l-txt">
                      <span className="nombre">{l.nombre}</span>
                      {l.variante && <span className="desc">{l.variante}</span>}
                      <span className="desc">{precio(l.precio, l.moneda)} c/u</span>
                    </div>
                    <div className="cant" role="group" aria-label={`Cantidad de ${l.nombre}`}>
                      <button type="button" onClick={() => setLineas((p) => cambiarCantidad(p, l.clave, -1))} aria-label="Quitar uno">
                        −
                      </button>
                      <output aria-live="polite">{l.cantidad}</output>
                      <button type="button" onClick={() => setLineas((p) => cambiarCantidad(p, l.clave, 1))} aria-label="Agregar uno">
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="tot-fila">
                <span>Total</span>
                <b>{totalTexto(lineas, n.moneda)}</b>
              </p>

              <fieldset className="tipo">
                <legend>¿Cómo lo quieres?</legend>
                <label>
                  <input type="radio" name="tipo" checked={datos.tipo === 'delivery'} onChange={() => set('tipo', 'delivery')} /> Delivery
                </label>
                <label>
                  <input type="radio" name="tipo" checked={datos.tipo === 'retiro'} onChange={() => set('tipo', 'retiro')} /> Retiro en el local
                </label>
              </fieldset>

              <label className="campo">
                Tu nombre
                <input value={datos.nombre} maxLength={60} autoComplete="name" onChange={(e) => set('nombre', e.target.value)} />
              </label>
              {datos.tipo === 'delivery' && (
                <label className="campo">
                  Dirección de entrega
                  <input value={datos.direccion} maxLength={160} autoComplete="street-address" onChange={(e) => set('direccion', e.target.value)} />
                </label>
              )}
              <label className="campo">
                Notas (opcional)
                <textarea value={datos.notas} maxLength={300} rows={2} onChange={(e) => set('notas', e.target.value)} />
              </label>

              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button type="button" className="enviar" onClick={continuar}>
                {hayPagos ? 'Continuar al pago' : 'Enviar pedido por WhatsApp'}
              </button>
              <p className="pie-hoja">
                {hayPagos ? 'Primero verás los métodos de pago; después se abrirá WhatsApp con tu pedido listo para enviar.' : 'Se abrirá WhatsApp con tu pedido listo para enviar. El negocio te confirmará por ahí.'}
              </p>
              <button type="button" className="vaciar" onClick={() => setLineas([])}>
                Vaciar pedido
              </button>
                </>
              )}
              {paso !== 'revisar' && (
                <>
                  <p className="tot-fila">
                    <span>Total a pagar</span>
                    <b>{totalTexto(lineas, n.moneda)}</b>
                  </p>
                  <ol className="pasos">
                    <li>{paso === 'pago' ? 'Paga con uno de estos métodos (toca “Copiar” en cada dato).' : 'Paga con uno de estos métodos.'}</li>
                    <li>{paso === 'pago' ? 'Abre WhatsApp: tu pedido ya va escrito.' : 'En el chat de WhatsApp, adjunta la foto o captura del comprobante y envía el mensaje.'}</li>
                    <li>Verificamos el pago y empezamos a preparar tu pedido.</li>
                  </ol>
                  <PagosLista pagos={pagos} />
                  {paso === 'pago' ? (
                    <>
                      <button type="button" className="enviar" onClick={abrirWhatsApp}>
                        Ya pagué · Abrir WhatsApp
                      </button>
                      <button type="button" className="vaciar" onClick={() => setPaso('revisar')}>
                        ← Volver a mi pedido
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="enviar" onClick={abrirWhatsApp}>
                        Volver a abrir WhatsApp
                      </button>
                      <p className="pie-hoja">El pedido no se prepara hasta verificar el comprobante.</p>
                      <button type="button" className="vaciar" onClick={nuevoPedido}>
                        Terminé · Nuevo pedido
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </dialog>
        </>
      )}
    </C.Provider>
  )
}
