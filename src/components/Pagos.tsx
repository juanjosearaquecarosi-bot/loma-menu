import { useState } from 'react'
import type { Enlaces } from '../types'

export function Copiar({ valor }: { valor: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      type="button"
      className="chip chip-sol chip-mini"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(valor)
          setOk(true)
          setTimeout(() => setOk(false), 1800)
        } catch {
          /* sin permiso: el dato igual se ve en pantalla */
        }
      }}
    >
      {ok ? 'Copiado' : 'Copiar'}
    </button>
  )
}

/** Métodos de pago con cada dato copiable. Se usa en la bienvenida y en el pedido. */
export function PagosLista({ pagos }: { pagos: NonNullable<Enlaces['pagos']> }) {
  return (
    <ul className="pagos-lista">
      {pagos.map((p) => (
        <li key={p.metodo}>
          <strong>{p.metodo}</strong>
          {p.datos?.map((x) => (
            <div className="dato" key={x.etiqueta}>
              <span>
                <small>{x.etiqueta}</small>
                {x.valor}
              </span>
              <Copiar valor={x.valor} />
            </div>
          ))}
          {p.detalle && <span>{p.detalle}</span>}
        </li>
      ))}
    </ul>
  )
}
