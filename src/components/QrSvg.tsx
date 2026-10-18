import { useEffect, useState } from 'react'

/**
 * QR dibujado como SVG propio (sin innerHTML). La librería se descarga solo cuando hace falta,
 * así el menú normal no carga ese código.
 */
export function QrSvg({ texto, etiqueta }: { texto: string; etiqueta: string }) {
  const [qr, setQr] = useState<{ size: number; d: string } | null>(null)

  useEffect(() => {
    let vivo = true
    import('qrcode').then((mod) => {
      // Según el empaquetador, `create` llega en el módulo o dentro de `default`.
      const lib: typeof mod = 'create' in mod ? mod : (mod as unknown as { default: typeof mod }).default
      const q = lib.create(texto, { errorCorrectionLevel: 'M' })
      const size = q.modules.size
      let d = ''
      for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (q.modules.get(r, c)) d += `M${c} ${r}h1v1h-1z`
      if (vivo) setQr({ size, d })
    })
    return () => {
      vivo = false
    }
  }, [texto])

  if (!qr) return <div className="qr qr-carga" aria-hidden="true" />
  return (
    <svg className="qr" viewBox={`-2 -2 ${qr.size + 4} ${qr.size + 4}`} role="img" aria-label={etiqueta} shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={qr.size + 4} height={qr.size + 4} fill="#fff" />
      <path d={qr.d} fill="#000" />
    </svg>
  )
}
