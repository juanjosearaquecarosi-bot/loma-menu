import type { Negocio } from '../types'

/**
 * Isotipo de la marca (montaña con la casita). Se pinta como máscara para tomar el color del tema
 * (`color`), así se lee igual sobre el fondo naranja que sobre el negro.
 */
export function Emblema({ size = 96, className = '' }: { size?: number; className?: string }) {
  return <span role="img" aria-label="Isotipo" className={`emblema ${className}`} style={{ width: size, height: Math.round(size * 1.12) }} />
}

/** RIF y razón social destacados, aparte de la firma de NFC Táchira. */
export function DatosFiscales({ n }: { n: Negocio }) {
  const l = n.local
  if (!l?.rif && !l?.razon_social) return null
  return (
    <p className="fiscal">
      {l.razon_social && <span>{l.razon_social}</span>}
      {l.rif && <strong>RIF {l.rif}</strong>}
    </p>
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
            <dl aria-label="Horario">
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
      <p className="firma">Menú digital creado por NFC Táchira</p>
    </>
  )
}
