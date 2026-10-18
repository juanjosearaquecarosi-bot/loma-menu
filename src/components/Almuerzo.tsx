import { useMemo, useState } from 'react'
import type { DiaId, Negocio } from '../types'
import { DIAS, almuerzoDe, diaActual } from '../lib/horario'

export function Almuerzo({ n }: { n: Negocio }) {
  const hoy = useMemo(() => diaActual(n.zona_horaria), [n.zona_horaria])
  const [dia, setDia] = useState<DiaId>(hoy)
  const a = almuerzoDe(n.almuerzo, dia)
  const etiqueta = DIAS.find((d) => d.id === dia)!

  return (
    <section id="almuerzo" className="seccion" aria-labelledby="t-almuerzo" data-sec>
      <header className="sec-cab">
        <span className="num" aria-hidden="true">
          01
        </span>
        <h2 id="t-almuerzo">{n.almuerzo.titulo}</h2>
      </header>

      <div className="dias" role="tablist" aria-label="Día de la semana">
        {DIAS.map((d) => (
          <button
            key={d.id}
            role="tab"
            type="button"
            aria-selected={d.id === dia}
            aria-controls="panel-almuerzo"
            className={'dia' + (d.id === dia ? ' on' : '') + (d.id === hoy ? ' hoy' : '')}
            onClick={() => setDia(d.id)}
          >
            {d.corto}
            {d.id === hoy && <i className="punto" aria-label="hoy" />}
          </button>
        ))}
      </div>

      <div id="panel-almuerzo" role="tabpanel" className="almuerzo-lista">
        <p className="kicker">
          {etiqueta.largo}
          {dia === hoy ? ' · hoy' : ''}
        </p>

        {!a.servicio ? (
          <p className="vacio">Este día no hay menú de almuerzo. Mira la carta más abajo.</p>
        ) : (
          <>
            <ul className="platos">
              {a.fijos.map((p) => (
                <li key={p.nombre}>
                  <span className="nombre">{p.nombre}</span>
                  {p.detalle && <span className="detalle">{p.detalle}</span>}
                </li>
              ))}
              <li className="rota">
                <span className="etq-sem">Plato de la semana</span>
                {a.cuartoPlato ? (
                  <>
                    <span className="nombre">{a.cuartoPlato.nombre}</span>
                    {a.cuartoPlato.detalle && <span className="detalle">{a.cuartoPlato.detalle}</span>}
                  </>
                ) : (
                  <span className="detalle">Pregunta por el plato de esta semana</span>
                )}
              </li>
            </ul>

            <div className="plato-dia">
              <span className="etq">Plato del día · {etiqueta.largo}</span>
              {a.platoDelDia ? (
                <>
                  <span className="nombre">{a.platoDelDia.nombre}</span>
                  {a.platoDelDia.detalle && <span className="detalle">{a.platoDelDia.detalle}</span>}
                </>
              ) : (
                <span className="detalle">Pregunta por el plato de hoy</span>
              )}
            </div>

            <div className="incluye">
              <p>Todos nuestros almuerzos vienen con</p>
              <ul className="tags">
                {n.almuerzo.incluye.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
