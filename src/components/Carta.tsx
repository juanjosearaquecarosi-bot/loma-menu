import type { Categoria, Item, Negocio } from '../types'
import { precio } from '../lib/format'
import { useCarrito } from './Carrito'
import { Monto } from './Monto'

function Foto({ item }: { item: Item }) {
  if (!item.imagen) return null
  return <img className="foto" src={item.imagen} alt={item.nombre} loading="lazy" decoding="async" width="64" height="64" />
}

const PrecioTxt = Monto

function Lista({ c, moneda }: { c: Categoria; moneda: string }) {
  const { activo, agregar } = useCarrito()
  let previo: string | undefined
  return (
    <ul className="items">
      {c.items.map((it) => {
        const nuevoGrupo = it.subgrupo && it.subgrupo !== previo
        previo = it.subgrupo
        const mon = it.moneda ?? moneda
        return (
          <li key={it.id} className="fila">
            {nuevoGrupo && <h3 className="sub-grupo">{it.subgrupo}</h3>}
            <div className="item">
              <Foto item={it} />
              <div className="txt">
                <span className="nombre">{it.nombre}</span>
                {it.descripcion && <span className="desc">{it.descripcion}</span>}
              </div>
              {it.precio == null ? (
                <span className="precio sin">Consultar</span>
              ) : (
                <span className="precio">
                  <PrecioTxt valor={it.precio} moneda={mon} />
                </span>
              )}
              {activo && it.precio != null && (
                <button
                  type="button"
                  className="mas"
                  aria-label={`Agregar ${it.nombre}${it.subgrupo ? ` (${it.subgrupo})` : ''} al pedido`}
                  onClick={() => agregar({ clave: it.id, nombre: it.nombre, variante: it.subgrupo, precio: it.precio!, moneda: mon })}
                >
                  +
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function Tamanos({ c, moneda }: { c: Categoria; moneda: string }) {
  const { activo, agregar } = useCarrito()
  const cols = c.columnas ?? []
  return (
    <div className="tabla-wrap">
      <table className="tabla">
        <caption className="sr">{c.nombre}</caption>
        <thead>
          <tr>
            <th scope="col" className="sr">
              Producto
            </th>
            {cols.map((col) => (
              <th key={col.id} scope="col">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {c.items.map((it) => (
            <tr key={it.id}>
              <th scope="row">
                <span className="nombre">{it.nombre}</span>
                {it.descripcion && <span className="desc">{it.descripcion}</span>}
              </th>
              {cols.map((col) => {
                const v = it.precios?.[col.id]
                const mon = it.moneda ?? moneda
                return (
                  <td key={col.id}>
                    {v == null ? (
                      <span className="nada" aria-label="no disponible">
                        ·
                      </span>
                    ) : activo ? (
                      <button
                        type="button"
                        className="precio precio-btn"
                        aria-label={`Agregar ${it.nombre} ${col.label} al pedido, ${precio(v, mon)}`}
                        onClick={() => agregar({ clave: `${it.id}|${col.id}`, nombre: it.nombre, variante: col.label, precio: v, moneda: mon })}
                      >
                        <PrecioTxt valor={v} moneda={mon} />
                      </button>
                    ) : (
                      <span className="precio">
                        <PrecioTxt valor={v} moneda={mon} />
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Carta({ n, numeroInicial }: { n: Negocio; numeroInicial: number }) {
  const { activo } = useCarrito()
  return (
    <>
      {n.categorias.map((c, i) => (
        <section key={c.id} id={c.id} className="seccion" aria-labelledby={`t-${c.id}`} data-sec>
          <header className="sec-cab">
            <span className="num" aria-hidden="true">
              {String(numeroInicial + i).padStart(2, '0')}
            </span>
            <h2 id={`t-${c.id}`}>{c.nombre}</h2>
          </header>
          {c.horario && <p className="horario">{c.horario}</p>}
          {c.nota && <p className="nota">{c.nota}</p>}
          {i === 0 && activo && <p className="nota pista">Toca + o el precio para armar tu pedido por WhatsApp.</p>}
          {c.columnas ? <Tamanos c={c} moneda={n.moneda} /> : <Lista c={c} moneda={n.moneda} />}
        </section>
      ))}
    </>
  )
}
