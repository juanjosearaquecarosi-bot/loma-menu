import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useNegocio } from '../lib/repo'
import { buscarEnAlmuerzo, buscarEnCarta } from '../lib/busqueda'
import { aplicarThemeColor, elegirTema, estiloTema } from '../lib/tema'
import { DatosFiscales, Emblema, PieLegal } from '../components/Marca'
import { Enlaces } from '../components/Enlaces'
import { Almuerzo } from '../components/Almuerzo'
import { Carta } from '../components/Carta'
import { Monto } from '../components/Monto'
import { CarritoProvider } from '../components/Carrito'
import { NoEncontrado } from './NoEncontrado'

export function MenuPage() {
  const { slug = '' } = useParams()
  const [sp] = useSearchParams()
  const n = useNegocio(slug)
  const [q, setQ] = useState('')
  const [activa, setActiva] = useState('almuerzo')
  const [barraH, setBarraH] = useState(120)
  const navRef = useRef<HTMLElement>(null)
  const barraRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (n) document.title = `${n.nombre} · ${n.subtitulo}`
  }, [n])

  const temaId = n ? elegirTema(n, new Date(), sp.get('tema')) : null
  useEffect(() => {
    if (temaId) aplicarThemeColor(temaId.tema.fondo)
  }, [temaId?.id])

  // Altura real de la barra pegajosa: los títulos de sección se pegan justo debajo de ella.
  useEffect(() => {
    const el = barraRef.current
    if (!el) return
    const medir = () => setBarraH(Math.round(el.getBoundingClientRect().height))
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [n])

  useEffect(() => {
    document.documentElement.style.scrollPaddingTop = `${barraH + 64}px`
    return () => {
      document.documentElement.style.scrollPaddingTop = ''
    }
  }, [barraH])

  // Scroll-spy: resalta la sección visible en la barra de categorías.
  useEffect(() => {
    if (!n || q) return
    const secs = Array.from(document.querySelectorAll<HTMLElement>('[data-sec]'))
    const io = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActiva(vis[0].target.id)
      },
      { rootMargin: `-${barraH + 8}px 0px -65% 0px` },
    )
    secs.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [n, q, barraH])

  // Mantiene visible el botón activo dentro de la barra horizontal (se mueve solo la barra, no la página).
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

  const { id, tema } = elegirTema(n, new Date(), sp.get('tema'))
  const style = { ...estiloTema(tema, id), '--barra-h': `${barraH}px` } as React.CSSProperties
  const secciones = [{ id: 'almuerzo', nombre: 'Almuerzo' }, ...n.categorias.map((c) => ({ id: c.id, nombre: c.nombre }))]
  const buscando = q.trim().length > 0

  return (
    <div className={`raiz tema-${id}`} style={style}>
    <CarritoProvider n={n}>
      <div className="app">
        <a className="saltar" href="#contenido">
          Saltar al contenido
        </a>

        <header className="hero">
          <div className="hero-marca">{n.logo ? <img className="logo" src={n.logo} alt={n.nombre} width="230" height="164" /> : <Emblema />}</div>
          <p className="sobre">Café · Repostería · Comida</p>
          <h1>{n.nombre}</h1>
          <p className="subtitulo">{n.subtitulo}</p>
          <p className="lema">{n.lema}</p>
          <DatosFiscales n={n} />
          <Enlaces n={n} />
        </header>

        {n.suscripcion.estado === 'vencida' && (
          <p className="aviso" role="status">
            Este menú puede estar desactualizado. Consulta precios en el local.
          </p>
        )}

        <div className="barra" ref={barraRef}>
          <div className="buscador" role="search">
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
                  <h3 className="sub-grupo">Almuerzo</h3>
                  <ul className="items">
                    {rAlm.map((r, i) => (
                      <li className="fila" key={i}>
                        <div className="item">
                          <div className="txt">
                            <span className="nombre">{r.plato.nombre}</span>
                            <span className="desc">
                              {r.cuando}
                              {r.plato.detalle ? ` · ${r.plato.detalle}` : ''}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {rCarta.length > 0 && (
                <>
                  <h3 className="sub-grupo">Carta</h3>
                  <ul className="items">
                    {rCarta.map(({ categoria, item }) => {
                      const mon = item.moneda ?? n.moneda
                      const desde = item.precios ? Object.values(item.precios).filter((v): v is number => v != null) : []
                      return (
                        <li className="fila" key={item.id}>
                          <div className="item">
                            <div className="txt">
                              <span className="nombre">{item.nombre}</span>
                              <span className="desc">
                                {categoria.nombre}
                                {item.subgrupo ? ` · ${item.subgrupo}` : ''}
                              </span>
                            </div>
                            <span className="precio">
                              {item.precio != null ? (
                                <Monto valor={item.precio} moneda={mon} />
                              ) : desde.length ? (
                                <Monto valor={Math.min(...desde)} moneda={mon} prefijo="desde" />
                              ) : (
                                <span className="sin">Consultar</span>
                              )}
                            </span>
                          </div>
                        </li>
                      )
                    })}
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
          <Emblema size={56} className="en-oscuro" />
          <p className="lema">{n.lema}</p>
          <p className="frase">{n.ciudad_frase}</p>
          <PieLegal n={n} />
        </footer>
      </div>
    </CarritoProvider>
    </div>
  )
}
