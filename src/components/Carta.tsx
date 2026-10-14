import type { Categoria, Item, Negocio } from '../types'
import { numero } from '../lib/format'

function Foto({ item }: { item: Item }) {
  if (!item.imagen) return null
  return <img className="foto" src={item.imagen} alt={item.nombre} loading="lazy" decoding="async" width="64" height="64" />
}

function PrecioUnico({ item, moneda }: { item: Item; moneda: string }) {
  if (item.precio == null) return <span className="precio sin">Consultar</span>
  return (
    <span className="precio">
      <small>{item.moneda ?? moneda}</small>
      {numero(item.precio)}
    </span>
  )
}

function Lista({ c, moneda }: { c: Categoria; moneda: string }) {
  return (
    <ul className="items">
      {c.items.map((it) => (
        <li key={it.id} className="item">
          <Foto item={it} />
          <div className="txt">
            <span className="nombre">{it.nombre}</span>
            {it.descripcion && <span className="desc">{it.descripcion}</span>}
          </div>
          <span className="relleno" aria-hidden="true" />
          <PrecioUnico item={it} moneda={moneda} />
        </li>
      ))}
    </ul>
  )
}

function Tamanos({ c, moneda }: { c: Categoria; moneda: string }) {
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
                return (
                  <td key={col.id}>
                    {v == null ? (
                      <span className="nada" aria-label="no disponible">
                        ·
                      </span>
                    ) : (
                      <span className="precio">
                        <small>{moneda}</small>
                        {numero(v)}
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
          {c.nota && <p className="nota">{c.nota}</p>}
          {c.columnas ? <Tamanos c={c} moneda={n.moneda} /> : <Lista c={c} moneda={n.moneda} />}
        </section>
      ))}
    </>
  )
}
