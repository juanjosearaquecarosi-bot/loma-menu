import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Negocio } from '../types'
import { getNegocio } from '../lib/repo'
import { cargarBorrador, descargar, guardarBorrador } from '../lib/admin'
import { NoEncontrado } from './NoEncontrado'

/**
 * Borrador de administración. Aísla el negocio por slug (no toca otros),
 * persiste el borrador en localStorage y permite descargar el JSON resultante
 * para reemplazar src/data/<slug>.json en el repo (o via Supabase más adelante).
 */
export function AdminPage() {
  const { slug = '' } = useParams()
  const [n, setN] = useState<Negocio | null | undefined>(undefined)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    let vivo = true
    getNegocio(slug).then(base => {
      if (!vivo) return
      const borrador = cargarBorrador(slug)
      setN(borrador ?? base)
    })
    return () => {
      vivo = false
    }
  }, [slug])

  const set = <K extends keyof Negocio>(k: K, v: Negocio[K]) => {
    setN(prev => (prev ? { ...prev, [k]: v } : prev))
  }

  const guardar = () => {
    if (!n) return
    guardarBorrador(n)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  const json = useMemo(() => (n ? JSON.stringify(n, null, 2) : ''), [n])

  if (n === undefined) return <div className="cargando" role="status">Cargando…</div>
  if (n === null) return <NoEncontrado mensaje="Este negocio no existe." />

  return (
    <div className="admin" style={{ '--acento': n.tema.oscuro?.acento ?? '#E8672A', '--fondo': '#F6F0E4', '--tinta': '#211512', '--suave': '#8a7a6e', '--linea': 'rgba(0,0,0,.15)', '--papel': '#fff', '--verde': '#2F6B3A' } as React.CSSProperties}>
      <header className="cab">
        <h1>Panel de {n.nombre}</h1>
      </header>

      {guardado && <p className="guardado" role="status">Borrador guardado en este dispositivo. Descarga el JSON para publicarlo.</p>}

      <section>
        <h2>Datos del negocio</h2>
        <label>
          Nombre
          <input value={n.nombre} onChange={e => set('nombre', e.target.value)} />
        </label>
        <label>
          Subtítulo
          <input value={n.subtitulo} onChange={e => set('subtitulo', e.target.value)} />
        </label>
        <label>
          Lema
          <input value={n.lema} onChange={e => set('lema', e.target.value)} />
        </label>
        <label>
          Moneda carta (€, $…)
          <input value={n.moneda} onChange={e => set('moneda', e.target.value)} />
        </label>
        <label>
          Moneda de pesos (para empanadas/pasteles)
          <input value={n.moneda_pesos ?? '$'} onChange={e => set('moneda_pesos', e.target.value)} />
        </label>
      </section>

      <section>
        <h2>Contacto y redes</h2>
        <label>
          WhatsApp (código país + número, sin "+")
          <input value={n.enlaces.whatsapp ?? ''} onChange={e => set('enlaces', { ...n.enlaces, whatsapp: e.target.value })} placeholder="p. ej. 584121234567" />
        </label>
        <label>
          Mensaje de WhatsApp predefinido
          <input value={n.enlaces.whatsapp_mensaje ?? ''} onChange={e => set('enlaces', { ...n.enlaces, whatsapp_mensaje: e.target.value })} />
        </label>
        <label>
          Instagram (URL completa)
          <input value={n.enlaces.instagram ?? ''} onChange={e => set('enlaces', { ...n.enlaces, instagram: e.target.value })} placeholder="https://instagram.com/…" />
        </label>
        <label>
          Correo
          <input value={n.enlaces.email ?? ''} onChange={e => set('enlaces', { ...n.enlaces, email: e.target.value })} />
        </label>
        <label>
          Dirección
          <input value={n.enlaces.direccion ?? ''} onChange={e => set('enlaces', { ...n.enlaces, direccion: e.target.value })} />
        </label>
      </section>

      <section>
        <h2>WiFi</h2>
        <label>
          Red
          <input value={n.enlaces.wifi?.red ?? ''} onChange={e => set('enlaces', { ...n.enlaces, wifi: e.target.value ? { red: e.target.value, clave: n.enlaces.wifi?.clave ?? '' } : undefined })} />
        </label>
        <label>
          Clave
          <input value={n.enlaces.wifi?.clave ?? ''} onChange={e => set('enlaces', { ...n.enlaces, wifi: e.target.value ? { red: n.enlaces.wifi?.red ?? '', clave: e.target.value } : undefined })} />
        </label>
      </section>

      <section>
        <h2>Métodos de pago</h2>
        {(n.enlaces.pagos ?? []).map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={p.metodo}
              placeholder="Método (efectivo, Pago Móvil…)"
              onChange={e => {
                const copia = [...(n.enlaces.pagos ?? [])]
                copia[i] = { ...copia[i], metodo: e.target.value }
                set('enlaces', { ...n.enlaces, pagos: copia })
              }}
              style={{ flex: 1 }}
            />
            <input
              value={p.detalle}
              placeholder="Detalle"
              onChange={e => {
                const copia = [...(n.enlaces.pagos ?? [])]
                copia[i] = { ...copia[i], detalle: e.target.value }
                set('enlaces', { ...n.enlaces, pagos: copia })
              }}
              style={{ flex: 1 }}
            />
            <button
              className="qty"
              onClick={() => set('enlaces', { ...n.enlaces, pagos: (n.enlaces.pagos ?? []).filter((_, j) => j !== i) })}
              aria-label="Quitar método"
            >
              −
            </button>
          </div>
        ))}
        <button className="agregar" onClick={() => set('enlaces', { ...n.enlaces, pagos: [...(n.enlaces.pagos ?? []), { metodo: '', detalle: '' }] })}>
          + Agregar método
        </button>
      </section>

      <section>
        <h2>Platos del día (almuerzo)</h2>
        {Object.entries(n.almuerzo.plato_del_dia).map(([dia, plato]) => (
          <label key={dia}>
            {dia.charAt(0).toUpperCase() + dia.slice(1)}
            <input
              value={plato?.nombre ?? ''}
              onChange={e =>
                set('almuerzo', {
                  ...n.almuerzo,
                  plato_del_dia: { ...n.almuerzo.plato_del_dia, [dia]: e.target.value ? { nombre: e.target.value } : null },
                })
              }
            />
          </label>
        ))}
      </section>

      <section>
        <h2>Productos y precios</h2>
        {n.categorias.map((c, ci) => (
          <details key={c.id}>
            <summary style={{ fontWeight: 600, padding: '8px 0', cursor: 'pointer' }}>
              {c.nombre} ({c.items.length})
            </summary>
            {c.items.map((it, ii) => (
              <div key={it.id} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <input
                  value={it.nombre}
                  onChange={e => {
                    const copia = [...n.categorias]
                    copia[ci] = { ...c, items: c.items.map((x, j) => (j === ii ? { ...x, nombre: e.target.value } : x)) }
                    set('categorias', copia)
                  }}
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  value={it.precio ?? ''}
                  onChange={e => {
                    const copia = [...n.categorias]
                    copia[ci] = { ...c, items: c.items.map((x, j) => (j === ii ? { ...x, precio: e.target.value === '' ? null : Number(e.target.value) } : x)) }
                    set('categorias', copia)
                  }}
                  style={{ flex: 1 }}
                />
              </div>
            ))}
          </details>
        ))}
      </section>

      <div className="acciones-finales">
        <button className="btn-descargar" onClick={guardar}>
          Guardar borrador en este dispositivo
        </button>
        <button className="btn-descargar" onClick={() => descargar(n)}>
          Descargar JSON para publicar
        </button>
        <Link className="btn-volver" to={`/m/${n.slug}`}>
          Volver al menú
        </Link>
      </div>

      <details style={{ marginTop: 20 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--suave)' }}>Ver JSON completo</summary>
        <textarea readOnly value={json} rows={12} style={{ width: '100%', marginTop: 8, fontFamily: 'monospace', fontSize: 12 }} />
      </details>
    </div>
  )
}
