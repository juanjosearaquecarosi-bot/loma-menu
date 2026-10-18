import { numero } from '../lib/format'

/** Monto con su moneda. Los códigos (COP) llevan un espacio real para que se lea y se copie bien. */
export function Monto({ valor, moneda, prefijo }: { valor: number; moneda: string; prefijo?: string }) {
  return (
    <>
      <small>
        {prefijo ? `${prefijo} ` : ''}
        {moneda}
      </small>
      {moneda.length > 1 || prefijo ? ' ' : ''}
      {numero(valor)}
    </>
  )
}
