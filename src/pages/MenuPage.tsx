import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Negocio } from '../types'
import { getNegocio } from '../lib/repo'
import { buscarEnAlmuerzo, buscarEnCarta } from '../lib/busqueda'
import { numero } from '../lib/format'
import { Emblema } from '../components/Marca'
import { Enlaces } from '../components/Enlaces'
import { Almuerzo } from '../components/Almuerzo'
import { Carta } from '../components/Carta'
import { NoEncontrado } from './NoEncontrado'

export function MenuPage() {
  const { slug = '' } = useParams()
  const [n, setN] = useState<Negocio | null | undefined>(undefined)
  const [q, setQ] = useState('')
  const [activa, setActiva] = useState('almuerzo')
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let vivo = true
    getNegocio(slug).then((r) => vivo && setN(r))
    return () => {
      vivo = false
    }
  }, [slug])

  useEffect(() => {
    if (n) document.title = `${n.nombre} · ${n.subtitulo}`
  }, [n])

  // Scroll-spy: resalta la sección visible en la barra de categorías.
  useEffect(() => {
    if (!n || q) return
    const secs = Array.from(document.querySelectorAll<HTMLElement>('[data-sec]'))
    const io = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActiva(vis[0].target.id)
      },
      { rootMargin: '-96px 0px -65% 0px' },
    )
    secs.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [n, q])

  // Mantiene visible el botón activo dentro de la barra horizontal.
  // (Se mueve solo la barra: scrollIntoView también movería la página y cancelaría el scroll suave.)
  useEffect(() => {
    const nav = navRef.current
    const b = nav?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!nav || !b) return
    const izq = b.offsetLeft - (nav.clientWidth - b.offsetWidth) / 2
    nav.scrollTo({ left: Math.max(0, izq), behavior: 'smooth' })
  }, [activa])

  const rCarta = useMemo(() => (n ? buscarEnCarta(n, q) : []), [n, q])
  const rAlm = useMemo(() => (n ? buscarEnAlmuerzo(n, q) : []), [n, q])

  if (n === undefined) return <div className="cargando" role="status">Cargando menú…</div>
  if (n === null) return <NoEncontrado />

  const style = {
    '--fondo': n.tema.fondo,
    '--tinta': n.tema.tinta,
    '--oscuro': n.tema.oscuro,
    '--acento': n.tema.acento,
    '--acento-texto': n.tema.acento_texto,
    '--dorado': n.tema.dorado,
    '--verde': n.tema.verde,
  } as React.CSSProperties

  const secciones = [{ id: 'almuerzo', nombre: 'Almuerzo' }, ...n.categorias.map((c) => ({ id: c.id, nombre: c.nombre }))]
  const buscando = q.trim().length > 0

  return (
    <div className="app" style={style}>
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>

      <header className="hero">
        <Emblema />
        <p className="sobre">Café · Repostería · Comida</p>
        <h1>{n.nombre}</h1>
        <p className="subtitulo">{n.subtitulo}</p>
        <p className="lema">{n.lema}</p>
        <Enlaces e={n.enlaces} />
      </header>

      {n.suscripcion.estado === 'vencida' && (
        <p className="aviso" role="status">
          Este menú puede estar desactualizado. Consulta precios en el local.
        </p>
      )}

      <div className="barra">
        <div className="buscador">
          <label htmlFor="buscar" className="sr">
            Buscar en el menú
          </label>
          <input
            id="buscar"
            type="search"
            inputMode="search"
            autoComplete="off"
            placeholder="Buscar: pizza, latte, pechuga…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {buscando && (
            <button type="button" className="limpiar" onClick={() => setQ('')} aria-label="Borrar búsqueda">
              ×
            </button>
          )}
        </div>
        {!buscando && (
          <nav ref={navRef} className="cats" aria-label="Categorías">
            {secciones.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={activa === s.id ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(s.id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
                  setActiva(s.id)
                }}
              >
                {s.nombre}
              </a>
            ))}
          </nav>
        )}
      </div>

      <main id="contenido">
        {buscando ? (
          <section className="seccion resultados" aria-live="polite">
            <header className="sec-cab">
              <h2>Resultados</h2>
            </header>
            {rCarta.length + rAlm.length === 0 && <p className="vacio">No encontramos “{q}”. Prueba con otra palabra.</p>}
            {rAlm.length > 0 && (
              <>
                <h3 className="sub">Almuerzo</h3>
                <ul className="items">
                  {rAlm.map((r, i) => (
                    <li className="item" key={i}>
                      <div className="txt">
                        <span className="nombre">{r.plato.nombre}</span>
                        <span className="desc">
                          {r.dia}
                          {r.plato.detalle ? ` · ${r.plato.detalle}` : ''}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {rCarta.length > 0 && (
              <>
                <h3 className="sub">Carta</h3>
                <ul className="items">
                  {rCarta.map(({ categoria, item }) => (
                    <li className="item" key={item.id}>
                      <div className="txt">
                        <span className="nombre">{item.nombre}</span>
                        <span className="desc">{categoria.nombre}</span>
                      </div>
                      <span className="relleno" aria-hidden="true" />
                      <span className="precio">
                        {item.precio != null ? (
                          <>
                            <small>{item.moneda ?? n.moneda}</small>
                            {numero(item.precio)}
                          </>
                        ) : item.precios ? (
                          <>
                            <small>desde {n.moneda}</small>
                            {numero(Math.min(...Object.values(item.precios).filter((v): v is number => v != null)))}
                          </>
                        ) : (
                          <span className="sin">Consultar</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        ) : (
          <>
            <Almuerzo n={n} />
            <Carta n={n} numeroInicial={2} />
          </>
        )}
      </main>

      <footer className="pie">
        <Emblema size={48} />
        <p className="lema">{n.lema}</p>
        <p className="frase">{n.ciudad_frase}</p>
        <p className="firma">Menú digital · NFC Táchira</p>
      </footer>
    </div>
  )
}
