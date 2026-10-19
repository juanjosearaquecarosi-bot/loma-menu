import type { Negocio } from '../types'

/** Marca de relleno (sol naciente sobre una loma) para negocios sin logo. Monocromática: usa los colores del tema. */
export function Emblema({ size = 64, className = '' }: { size?: number; className?: string }) {
  const rayos = Array.from({ length: 7 }, (_, i) => {
    const a = Math.PI + (i * Math.PI) / 6
    const x1 = 50 + Math.cos(a) * 24
    const y1 = 50 + Math.sin(a) * 24
    const x2 = 50 + Math.cos(a) * 38
    const y2 = 50 + Math.sin(a) * 38
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
  })
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 100 62" role="img" aria-label="Emblema" className={`emblema ${className}`}>
      <g stroke="var(--titulo)" strokeWidth="4" strokeLinecap="round">
        {rayos}
      </g>
      <path d="M24 54 L50 30 L76 54 Z" fill="currentColor" />
      <line x1="10" y1="56" x2="90" y2="56" stroke="var(--titulo)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function PieLegal({ n }: { n: Negocio }) {
  const l = n.local
  return (
    <>
      {l && (l.direccion || l.horario?.length) && (
        <div className="local">
          {l.direccion && (
            <p>
              <small>Dirección</small>
              {l.direccion}
            </p>
          )}
          {l.horario && l.horario.length > 0 && (
            <dl>
              <dt className="sr">Horario</dt>
              {l.horario.map((h) => (
                <div key={h.dias}>
                  <dt>{h.dias}</dt>
                  <dd>{h.horas}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
      <p className="firma">
        {l?.razon_social && <>{l.razon_social} · </>}
        {l?.rif && <>RIF {l.rif} · </>}
        Menú digital creado por NFC Táchira
      </p>
    </>
  )
}
