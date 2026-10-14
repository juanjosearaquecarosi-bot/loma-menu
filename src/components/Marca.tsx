/** Emblema propio: sol naciente sobre una casa de loma. Usa los colores del tema. */
export function Emblema({ size = 72 }: { size?: number }) {
  const rayos = Array.from({ length: 13 }, (_, i) => {
    const a = Math.PI + (i * Math.PI) / 12
    const x1 = 50 + Math.cos(a) * 30
    const y1 = 52 + Math.sin(a) * 30
    const x2 = 50 + Math.cos(a) * 44
    const y2 = 52 + Math.sin(a) * 44
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
  })
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 100 70" role="img" aria-label="Emblema" className="emblema">
      <g stroke="var(--acento)" strokeWidth="3" strokeLinecap="round">
        {rayos}
      </g>
      <path d="M24 56 L50 30 L76 56 Z" fill="var(--fondo)" />
      <rect x="40" y="42" width="20" height="14" fill="var(--oscuro)" />
      <rect x="46" y="46" width="8" height="10" fill="var(--acento)" />
      <line x1="14" y1="57" x2="86" y2="57" stroke="var(--verde)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
