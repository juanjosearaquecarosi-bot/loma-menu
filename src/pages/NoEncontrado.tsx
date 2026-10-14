export function NoEncontrado({ mensaje }: { mensaje?: string }) {
  return (
    <div className="centro">
      <h1>Menú no disponible</h1>
      <p>{mensaje ?? 'No encontramos este menú. Pide al local que revise su código QR.'}</p>
    </div>
  )
}
